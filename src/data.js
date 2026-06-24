// src/data.js
// ─── Static UI data (not stored in database) ───────────────────────────────
export const DESTINATIONS = [
  { name: "Kochi", count: 320, image: "/assets/images/kochi.webp" },
  { name: "Munnar", count: 180, image: "/assets/images/munnar.webp" },
  { name: "Alappuzha", count: 240, image: "/assets/images/alappuzha.webp" },
  { name: "Varkala", count: 120, image: "/assets/images/varkala.webp" },
  { name: "Kovalam", count: 96, image: "/assets/images/kovalam.webp" },
  { name: "Wayanad", count: 130, image: "/assets/images/wayanad.webp" }
];

export const CATEGORIES = [
  { name: "Beach Resorts", icon: "fa-umbrella-beach", desc: "Sun, sand & the Arabian Sea" },
  { name: "Hill Station Hotels", icon: "fa-mountain", desc: "Cool misty mountain escapes" },
  { name: "Houseboats", icon: "fa-ship", desc: "Float through Kerala backwaters" },
  { name: "Homestays", icon: "fa-home", desc: "Live with local Kerala families" },
  { name: "Luxury Resorts", icon: "fa-gem", desc: "World-class comfort & service" },
  { name: "Budget Hotels", icon: "fa-wallet", desc: "Comfortable stays, great value" },
  { name: "Business Hotels", icon: "fa-briefcase", desc: "Work-ready, city-center stays" },
  { name: "Family Hotels", icon: "fa-users", desc: "Kid-friendly, spacious & fun" },
  { name: "Ayurveda Resorts", icon: "fa-spa", desc: "Ancient healing & wellness" },
  { name: "Eco Lodges", icon: "fa-leaf", desc: "Sustainable, nature-first stays" },
  { name: "Treehouse Stays", icon: "fa-tree", desc: "Sleep above the forest canopy" },
  { name: "Heritage Hotels", icon: "fa-landmark", desc: "Palaces, mansions & history" },
  { name: "Wildlife Resorts", icon: "fa-paw", desc: "Next to national parks & jungles" },
  { name: "Couple Retreats", icon: "fa-heart", desc: "Romantic getaways in Kerala" },
  { name: "Pilgrimage Stays", icon: "fa-pray", desc: "Near temples, churches & mosques" },
  { name: "Backpacker Hostels", icon: "fa-bed", desc: "Social, affordable, vibrant stays" }
];

const DEFAULT_SETTINGS = {
  platformName: "HotelsNearMeInKerala.com",
  taxRate: 18,
  logoUrl: "/logo.webp",
  notifyEmail: true,
  notifyWhatsapp: true,
  enableSound: true,
  currency: "INR",
  whatsappNumber: "919876543210",
  autoInvoice: true
};

const DEFAULT_SEO = {
  heroTitle: "Find The Perfect Stay Anywhere in Kerala",
  heroSubtext: "Search and book the best hotels, resorts, homestays, and houseboats across God's Own Country.",
  trustBadge: "Trusted by 25,000+ Happy Travelers"
};

// ─── In-memory store ───────────────────────────────────────────────
const store = {
  hotels: [],
  bookings: [],
  rooms: [],
  users: [],
  reviews: [],
  coupons: [],
  audit_logs: [],
  system_users: [],
  settings: { ...DEFAULT_SETTINGS },
  seo: { ...DEFAULT_SEO }
};

let dataReadyResolve;
const dataReady = new Promise((resolve) => { dataReadyResolve = resolve; });

const dataListeners = new Set();

function notifyChange(source) {
  dataListeners.forEach((cb) => {
    try { cb(source, store); } catch (e) { console.error(e); }
  });
}

function sortByDateDesc(list, field = "createdAt") {
  return [...list].sort((a, b) => (b[field] || "").localeCompare(a[field] || ""));
}

export function onDataChange(callback) {
  dataListeners.add(callback);
  return () => dataListeners.delete(callback);
}

async function waitForData() {
  await dataReady;
  return store;
}

// ─── Sync all data from Express Backend ──────────────────────────────────────
async function refreshAllData() {
  try {
    const collections = ["hotels", "bookings", "rooms", "users", "reviews", "coupons", "audit_logs", "system_users"];
    await Promise.all([
      ...collections.map(async (name) => {
        try {
          const res = await fetch(`/api/${name}`);
          if (res.ok) {
            const list = await res.json();
            if (name === "bookings" || name === "reviews") {
              store[name] = sortByDateDesc(list);
            } else if (name === "audit_logs") {
              store.audit_logs = sortByDateDesc(list, "timestamp");
            } else {
              store[name] = list;
            }
            notifyChange(name);
          }
        } catch (err) {
          console.warn(`Error fetching ${name}:`, err.message);
        }
      }),
      (async () => {
        try {
          const res = await fetch('/api/config/settings');
          if (res.ok) {
            const data = await res.json();
            store.settings = { ...DEFAULT_SETTINGS, ...data };
            notifyChange("settings");
          }
        } catch (err) {
          console.warn(`Error fetching settings:`, err.message);
        }
      })(),
      (async () => {
        try {
          const res = await fetch('/api/config/seo');
          if (res.ok) {
            const data = await res.json();
            store.seo = { ...DEFAULT_SEO, ...data };
            notifyChange("seo");
          }
        } catch (err) {
          console.warn(`Error fetching seo:`, err.message);
        }
      })()
    ]);

    // Merge localStorage fallback data when API returns nothing (DB offline)
    // Hotels: if store.hotels is empty, load from localStorage
    const lsHotels = (() => { try { return JSON.parse(localStorage.getItem("hbooking_hotels_local") || "[]"); } catch { return []; } })();
    const lsRooms = (() => { try { return JSON.parse(localStorage.getItem("hbooking_rooms_local") || "[]"); } catch { return []; } })();
    if (store.hotels.length === 0 && lsHotels.length > 0) {
      store.hotels = lsHotels;
      notifyChange("hotels");
    }
    if (store.rooms.length === 0 && lsRooms.length > 0) {
      store.rooms = lsRooms;
      notifyChange("rooms");
    }

    dataReadyResolve(store);
  } catch (err) {
    console.error("Failed to sync backend data:", err);
    dataReadyResolve(store);
  }
}

// ─── Realtime initialization ────────────────────────────────────────────────
export async function initRealtimeData() {
  await refreshAllData();
  
  // Set up polling interval to sync data every 6 seconds in the background
  setInterval(async () => {
    await refreshAllData();
  }, 6000);

  console.log("Connected to PostgreSQL REST API.");
  return store;
}

/** @deprecated Use initRealtimeData */
export async function seedDatabase() {
  return initRealtimeData();
}

// ─── Read helpers (from live cache) ───────────────────────────────────────────
export async function getHotels() {
  await waitForData();
  return [...store.hotels];
}

export async function getBookings() {
  await waitForData();
  return [...store.bookings];
}

export async function getRooms() {
  await waitForData();
  return [...store.rooms];
}

export async function getUsers() {
  await waitForData();
  return [...store.users];
}

export async function getReviews() {
  await waitForData();
  return [...store.reviews];
}

export async function getCoupons() {
  await waitForData();
  return [...store.coupons];
}

export async function getAuditLogs() {
  await waitForData();
  return [...store.audit_logs];
}

export async function getSystemUsers() {
  await waitForData();
  return [...store.system_users];
}

export async function getSettings() {
  await waitForData();
  return { ...store.settings };
}

export async function getSeo() {
  await waitForData();
  return { ...store.seo };
}

export async function getUserByUid(uid) {
  await waitForData();
  return store.users.find((u) => u.uid === uid) || null;
}

// ─── localStorage fallback store ──────────────────────────────────────────────
// Used when the API/database is offline. Data persists in browser only.
const LS_HOTELS_KEY = "hbooking_hotels_local";
const LS_ROOMS_KEY = "hbooking_rooms_local";

function lsGetHotels() {
  try { return JSON.parse(localStorage.getItem(LS_HOTELS_KEY) || "[]"); } catch { return []; }
}
function lsSaveHotels(list) {
  localStorage.setItem(LS_HOTELS_KEY, JSON.stringify(list));
}
function lsGetRooms() {
  try { return JSON.parse(localStorage.getItem(LS_ROOMS_KEY) || "[]"); } catch { return []; }
}
function lsSaveRooms(list) {
  localStorage.setItem(LS_ROOMS_KEY, JSON.stringify(list));
}

// Helper for making API mutation requests (with localStorage fallback)
async function mutateData(url, method = "POST", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorData = {};
      try { errorData = await res.json(); } catch { /* ignore */ }
      throw new Error(errorData.message || `Mutation ${method} ${url} failed`);
    }
    // Refresh data in-memory following a successful mutation
    await refreshAllData();
  } catch (err) {
    // If the API call fails (DB offline), fall back to localStorage for hotels/rooms
    console.warn(`API ${method} ${url} failed, using localStorage fallback:`, err.message);
    if (url === "/api/hotels" && method === "POST") {
      const list = lsGetHotels(); list.push(body); lsSaveHotels(list);
      store.hotels = [...list]; notifyChange("hotels");
    } else if (url.startsWith("/api/hotels/") && method === "PUT") {
      const id = url.replace("/api/hotels/", "");
      const list = lsGetHotels().map(h => h.id === id ? { ...h, ...body } : h);
      lsSaveHotels(list); store.hotels = [...list]; notifyChange("hotels");
    } else if (url.startsWith("/api/hotels/") && method === "DELETE") {
      const id = url.replace("/api/hotels/", "");
      const list = lsGetHotels().filter(h => h.id !== id);
      lsSaveHotels(list); store.hotels = [...list]; notifyChange("hotels");
    } else if (url === "/api/rooms" && method === "POST") {
      const list = lsGetRooms(); list.push(body); lsSaveRooms(list);
      store.rooms = [...list]; notifyChange("rooms");
    } else if (url.startsWith("/api/rooms/") && method === "PUT") {
      const id = url.replace("/api/rooms/", "");
      const list = lsGetRooms().map(r => r.id === id ? { ...r, ...body } : r);
      lsSaveRooms(list); store.rooms = [...list]; notifyChange("rooms");
    } else if (url.startsWith("/api/rooms/") && method === "DELETE") {
      const id = url.replace("/api/rooms/", "");
      const list = lsGetRooms().filter(r => r.id !== id);
      lsSaveRooms(list); store.rooms = [...list]; notifyChange("rooms");
    } else {
      // Re-throw for non-hotel/room mutations (bookings, etc.)
      throw err;
    }
  }
}

// ─── Config writes ────────────────────────────────────────────────────────────
export async function saveSettings(updates) {
  await mutateData("/api/config/settings", "PUT", updates);
}

export async function saveSeo(updates) {
  await mutateData("/api/config/seo", "PUT", updates);
}

export async function saveGatewaySettings({ currency, whatsappNumber, autoInvoice }) {
  await mutateData("/api/config/settings", "PUT", { currency, whatsappNumber, autoInvoice });
}

// ─── Audit logs ───────────────────────────────────────────────────────────────
export async function writeAuditLog(action, targetType, targetId, prevVal = "", newVal = "") {
  let operatorId = "system";
  let operatorEmail = "system@hotelsnearme.com";

  try {
    const userJson = localStorage.getItem("hbooking_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      operatorId = user.uid || user.email;
      operatorEmail = user.email;
    }
  } catch (e) { /* ignore */ }

  const log = {
    logId: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    operatorId,
    operatorEmail,
    action,
    targetType,
    targetId,
    previousValue: prevVal,
    newValue: newVal,
    timestamp: new Date().toISOString()
  };

  await mutateData("/api/audit_logs", "POST", log);
}

// ─── Hotels ─────────────────────────────────────────────────────────────────
export async function addHotel(hotel) {
  await mutateData("/api/hotels", "POST", hotel);
  await writeAuditLog("ADD_HOTEL", "hotel", hotel.id, "", JSON.stringify(hotel));
}

export async function updateHotel(hotelId, updates) {
  const old = store.hotels.find((h) => h.id === hotelId);
  await mutateData(`/api/hotels/${hotelId}`, "PUT", updates);
  await writeAuditLog("UPDATE_HOTEL", "hotel", hotelId, old ? JSON.stringify(old) : "", JSON.stringify(updates));
}

export async function deleteHotel(hotelId) {
  const old = store.hotels.find((h) => h.id === hotelId);
  await mutateData(`/api/hotels/${hotelId}`, "DELETE");
  await writeAuditLog("DELETE_HOTEL", "hotel", hotelId, old ? JSON.stringify(old) : "", "");
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export async function addBooking(booking) {
  booking.createdAt = new Date().toISOString();
  await mutateData("/api/bookings", "POST", booking);
  await writeAuditLog("ADD_BOOKING", "booking", booking.bookingId, "", JSON.stringify(booking));
}

export async function updateBookingStatus(bookingId, updates) {
  const old = store.bookings.find((b) => b.bookingId === bookingId);
  const patch = typeof updates === "string" ? { status: updates } : updates;
  await mutateData(`/api/bookings/${bookingId}`, "PUT", patch);
  await writeAuditLog("UPDATE_BOOKING", "booking", bookingId, old ? JSON.stringify(old) : "", JSON.stringify(patch));
}

export async function deleteBooking(bookingId) {
  const old = store.bookings.find((b) => b.bookingId === bookingId);
  await mutateData(`/api/bookings/${bookingId}`, "DELETE");
  await writeAuditLog("DELETE_BOOKING", "booking", bookingId, old ? JSON.stringify(old) : "", "");
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export async function addRoom(room) {
  await mutateData("/api/rooms", "POST", room);
  await writeAuditLog("ADD_ROOM", "room", room.id, "", JSON.stringify(room));
}

export async function updateRoom(roomId, updates) {
  const old = store.rooms.find((r) => r.id === roomId);
  await mutateData(`/api/rooms/${roomId}`, "PUT", updates);
  await writeAuditLog("UPDATE_ROOM", "room", roomId, old ? JSON.stringify(old) : "", JSON.stringify(updates));
}

export async function deleteRoom(roomId) {
  const old = store.rooms.find((r) => r.id === roomId);
  await mutateData(`/api/rooms/${roomId}`, "DELETE");
  await writeAuditLog("DELETE_ROOM", "room", roomId, old ? JSON.stringify(old) : "", "");
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function addUser(user) {
  if (!store.users.some((u) => u.uid === user.uid)) {
    const newUser = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString().split("T")[0]
    };
    await mutateData("/api/users", "POST", newUser);
  }
}

export async function updateUserProfile(uid, updates) {
  const old = store.users.find((u) => u.uid === uid);
  await mutateData(`/api/users/${uid}`, "PUT", updates);
  await writeAuditLog("UPDATE_USER", "user", uid, old ? JSON.stringify(old) : "", JSON.stringify(updates));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function addReview(review) {
  review.reviewId = "rev_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  review.createdAt = new Date().toISOString();
  review.status = "pending";
  review.replyText = review.replyText || "";
  await mutateData("/api/reviews", "POST", review);
  await writeAuditLog("ADD_REVIEW", "review", review.reviewId, "", JSON.stringify(review));
}

export async function recalculateHotelRating(hotelId) {
  // The backend API does this rating recalculation dynamically inside review updates,
  // but we can trigger a reload to fetch the updated hotel ratings.
  await refreshAllData();
}

export async function updateReviewStatus(reviewId, status) {
  const old = store.reviews.find((r) => r.reviewId === reviewId);
  await mutateData(`/api/reviews/${reviewId}/status`, "PUT", { status });
  await writeAuditLog("UPDATE_REVIEW_STATUS", "review", reviewId, old ? JSON.stringify(old) : "", status);
}

export async function replyToReview(reviewId, replyText) {
  const old = store.reviews.find((r) => r.reviewId === reviewId);
  await mutateData(`/api/reviews/${reviewId}/reply`, "PUT", { replyText });
  await writeAuditLog("REPLY_REVIEW", "review", reviewId, old ? JSON.stringify(old) : "", replyText);
}

export async function deleteReview(reviewId) {
  const old = store.reviews.find((r) => r.reviewId === reviewId);
  await mutateData(`/api/reviews/${reviewId}`, "DELETE");
  await writeAuditLog("DELETE_REVIEW", "review", reviewId, old ? JSON.stringify(old) : "", "");
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
export async function addCoupon(coupon) {
  coupon.code = coupon.code.toUpperCase();
  coupon.usageCount = coupon.usageCount || 0;
  await mutateData("/api/coupons", "POST", coupon);
  await writeAuditLog("ADD_COUPON", "coupon", coupon.code, "", JSON.stringify(coupon));
}

export async function updateCoupon(code, updates) {
  const old = store.coupons.find((c) => c.code === code);
  await mutateData(`/api/coupons/${code}`, "PUT", updates);
  await writeAuditLog("UPDATE_COUPON", "coupon", code, old ? JSON.stringify(old) : "", JSON.stringify(updates));
}

export async function deleteCoupon(code) {
  const old = store.coupons.find((c) => c.code === code);
  await mutateData(`/api/coupons/${code}`, "DELETE");
  await writeAuditLog("DELETE_COUPON", "coupon", code, old ? JSON.stringify(old) : "", "");
}

// ─── System users ─────────────────────────────────────────────────────────────
export async function addSystemUser(user) {
  const id = "sys_" + Date.now();
  await mutateData("/api/system-users", "POST", { ...user, id });
  await writeAuditLog("ADD_SYSTEM_USER", "system_user", id, "", JSON.stringify(user));
}

export async function deleteSystemUser(id) {
  const old = store.system_users.find((u) => u.id === id);
  await mutateData(`/api/system-users/${id}`, "DELETE");
  await writeAuditLog("DELETE_SYSTEM_USER", "system_user", id, old ? JSON.stringify(old) : "", "");
}

// ─── Favorites ────────────────────────────────────────────────────────────────
export async function getFavorites(userId) {
  const res = await fetch(`/api/favorites/${userId}`);
  if (res.ok) {
    return await res.json();
  }
  return [];
}

export function subscribeFavorites(userId, callback) {
  let active = true;
  const poll = async () => {
    try {
      const list = await getFavorites(userId);
      if (active) callback(list);
    } catch (e) {
      console.warn("Favorites sync error:", e);
    }
  };
  poll();
  const interval = setInterval(poll, 4000);
  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function addFavorite(userId, hotelId) {
  const fav = {
    id: `${userId}_${hotelId}`,
    userId,
    hotelId,
    createdAt: new Date().toISOString()
  };
  await mutateData("/api/favorites", "POST", fav);
}

export async function removeFavorite(userId, hotelId) {
  await mutateData(`/api/favorites/${userId}/${hotelId}`, "DELETE");
}
