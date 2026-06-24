import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail } from "./firebase";
import {
  initRealtimeData, onDataChange, getHotels, getBookings, addBooking, addHotel, updateHotel, deleteHotel,
  DESTINATIONS, CATEGORIES, addUser, updateUserProfile, getUsers, getFavorites,
  removeFavorite, addFavorite, getRooms, addRoom, updateRoom, deleteRoom,
  updateBookingStatus, deleteBooking, getReviews, addReview, updateReviewStatus,
  replyToReview, deleteReview, getCoupons, addCoupon, updateCoupon, deleteCoupon,
  getAuditLogs, getSettings, getSeo, saveSettings, saveSeo, saveGatewaySettings,
  getSystemUsers, addSystemUser, deleteSystemUser, getUserByUid
} from "./data";
import { supabase } from "./supabase";

// Native browser hashing utility (SHA-256)
async function hashPassword(password) {
  if (!password) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Native browser HMAC-SHA1 signature generator for ImageKit
async function generateImageKitSignature(token, expire, privateKey) {
  const textToSign = token + expire;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const data = encoder.encode(textToSign);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    data
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}


function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let cachedTaxRate = 0.18;

window.getGlobalTaxRate = function() {
  return cachedTaxRate;
};

async function syncUserSession(firebaseUser) {
  const profile = await getUserByUid(firebaseUser.uid);
  const adminEmail = "directrajeev@gmail.com";
  const role = (firebaseUser.email === adminEmail || firebaseUser.email === "admin@hotelsnearme.com" || profile?.role === "admin") ? "admin" : "user";
  const userData = {
    uid: firebaseUser.uid,
    name: profile?.name || firebaseUser.displayName || firebaseUser.email.split("@")[0],
    email: firebaseUser.email,
    phone: profile?.phone || firebaseUser.phoneNumber || "",
    photoURL: profile?.photoURL || firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    role,
    status: profile?.status || "active"
  };
  if (!profile) {
    await addUser(userData);
  }
  localStorage.setItem("hbooking_user", JSON.stringify(userData));
  return userData;
}

// -------------------------------------------------------------
// Initialization & Global Event Handlers
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initRealtimeData();

    const seo = await getSeo();
    const heroTitle = document.querySelector(".hero h1");
    if (heroTitle && seo.heroTitle) {
      heroTitle.innerHTML = seo.heroTitle.replace(/\n/g, "<br>");
    }
    const heroSubtext = document.querySelector(".hero p");
    if (heroSubtext && seo.heroSubtext) {
      heroSubtext.innerText = seo.heroSubtext;
    }
    const trustBadge = document.getElementById("trust-badge-text");
    if (trustBadge && seo.trustBadge) {
      trustBadge.innerText = seo.trustBadge;
    }

    const settings = await getSettings();
    cachedTaxRate = (settings.taxRate ?? 18) / 100;
    const logoSpan = document.querySelector(".logo span");
    if (logoSpan && settings.platformName) {
      logoSpan.innerText = settings.platformName;
    }
    const logoImg = document.querySelector(".logo img");
    if (logoImg && settings.logoUrl) {
      logoImg.src = settings.logoUrl;
    }

    onDataChange((source) => {
      if (source === "settings") {
        getSettings().then((s) => {
          cachedTaxRate = (s.taxRate ?? 18) / 100;
          const span = document.querySelector(".logo span");
          if (span && s.platformName) span.innerText = s.platformName;
          const img = document.querySelector(".logo img");
          if (img && s.logoUrl) img.src = s.logoUrl;
        });
      }
      if (source === "seo") {
        getSeo().then((s) => {
          const ht = document.querySelector(".hero h1");
          if (ht && s.heroTitle) ht.innerHTML = s.heroTitle.replace(/\n/g, "<br>");
          const hs = document.querySelector(".hero p");
          if (hs && s.heroSubtext) hs.innerText = s.heroSubtext;
          const tb = document.getElementById("trust-badge-text");
          if (tb && s.trustBadge) tb.innerText = s.trustBadge;
        });
      }
    });
  } catch (err) {
    console.error("Failed to connect to Firebase:", err);
    document.body.insertAdjacentHTML("afterbegin",
      `<div style="background:#FCEAEA;color:#D32F2F;padding:12px 20px;text-align:center;font-size:14px;font-weight:600;">
        Unable to connect to Firebase. Please check your internet connection and refresh the page.
      </div>`
    );
  }

  if (auth) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem("hbooking_session_type");
        await syncUserSession(user);
      } else {
        if (localStorage.getItem("hbooking_session_type") !== "local") {
          localStorage.removeItem("hbooking_user");
        }
      }
      setupHeaderAuth();
      setupSavedHotelsCount();
    });
  } else {
    setupHeaderAuth();
    setupSavedHotelsCount();
  }

  // 3. Routing check to run page-specific functions
  const path = window.location.pathname;
  if (path.endsWith("index.html") || path === "/" || path.endsWith("/")) {
    initLandingPage();
  } else if (path.endsWith("hotel.html")) {
    initHotelDetailPage();
  } else if (path.endsWith("login.html")) {
    initLoginPage();
  } else if (path.endsWith("admin.html")) {
    initAdminPage();
  } else if (path.endsWith("bookings.html")) {
    initBookingsPage();
  }

  // Mobile nav toggle
  initMobileNav();

  // Init global elements (Modals, Drawer)
  initGlobalModals();
});

// Helper: Setup Login/Logout states in Header
function setupHeaderAuth() {
  const headerMenu = document.getElementById("header-user-menu");
  if (!headerMenu) return;

  const userJson = localStorage.getItem("hbooking_user");

  // Wire up bottom nav account button for logged-in user options
  const mobAccountBtn = document.getElementById("mob-account-btn");
  if (mobAccountBtn) {
    if (userJson) {
      mobAccountBtn.href = "#";
      if (!mobAccountBtn.dataset.hasListener) {
        mobAccountBtn.dataset.hasListener = "true";
        mobAccountBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.openMobileAccountMenu();
        });
      }
    } else {
      mobAccountBtn.href = "/login.html";
    }
  }

  if (userJson) {
    const user = JSON.parse(userJson);
    const displayName = user.name ? user.name.split(" ")[0] : user.email.split('@')[0];
    const isAdmin = user.role === "admin";
    const avatar = user.photoURL
      ? `<img src="${user.photoURL}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${displayName[0].toUpperCase()}</span>`
      : `<span style="display:flex;width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${displayName[0].toUpperCase()}</span>`;

    const adminItems = isAdmin ? `<a href="/admin.html" class="dropdown-item"><i class="fas fa-chart-line"></i> Admin Dashboard</a><div class="dropdown-divider"></div>` : "";

    headerMenu.outerHTML = `
      <div class="user-dropdown-wrapper" id="header-user-menu">
        <button class="btn btn-secondary dropdown-trigger" style="display:flex;align-items:center;gap:8px;border-radius:20px;padding:6px 14px;border:1.5px solid var(--border);">
          ${avatar}
          <span style="font-size:14px;font-weight:600;">${displayName}</span>
          <i class="fas fa-chevron-down" style="font-size:10px;color:var(--text-secondary);"></i>
        </button>
        <div class="dropdown-menu">
          ${adminItems}
          <a href="/bookings.html" class="dropdown-item"><i class="fas fa-calendar-check"></i> My Bookings</a>
          <a href="#" class="dropdown-item" id="header-profile-btn"><i class="fas fa-user-circle"></i> My Profile</a>
          <a href="#" class="dropdown-item" id="header-wishlist-btn"><i class="fas fa-heart"></i> Saved Hotels</a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" style="color:#dc3545;" id="header-logout-btn"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
        </div>
      </div>
    `;

    setTimeout(() => {
      const trigger = document.querySelector(".dropdown-trigger");
      const menu = document.querySelector(".dropdown-menu");
      if (trigger && menu) {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          menu.classList.toggle("show");
        });
        document.addEventListener("click", () => menu.classList.remove("show"));
      }
      document.getElementById("header-logout-btn")?.addEventListener("click", async (e) => {
        e.preventDefault();
        localStorage.removeItem("hbooking_user");
        localStorage.removeItem("hbooking_session_type");
        if (auth) { try { await signOut(auth); } catch (err) {} }
        window.location.href = "/index.html";
      });
      document.getElementById("header-profile-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        openProfileModal();
      });
      document.getElementById("header-wishlist-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        openWishlistDrawer();
      });
    }, 100);

  } else {
    headerMenu.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm" style="border-radius:30px;padding:8px 18px;font-size:13px;">Sign In</a>
      <a href="/login.html" class="btn btn-primary btn-sm" style="border-radius:30px;padding:8px 18px;font-size:13px;" id="header-login-btn">Register</a>
    `;
  }
}

// Mobile nav toggle
function initMobileNav() {
  const btn = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("main-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    nav.classList.toggle("mobile-open");
    const icon = btn.querySelector("i");
    icon.className = nav.classList.contains("mobile-open") ? "fas fa-times" : "fas fa-bars";
  });
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("mobile-open");
      btn.querySelector("i").className = "fas fa-bars";
    });
  });
}


// -------------------------------------------------------------
// LANDING PAGE CONTROLLER
// -------------------------------------------------------------
// Kerala district → approximate coordinates mapping
const KERALA_DISTRICT_COORDS = {
  "Thiruvananthapuram": { lat: 8.5241, lon: 76.9366 },
  "Trivandrum":         { lat: 8.5241, lon: 76.9366 },
  "Kollam":             { lat: 8.8932, lon: 76.6141 },
  "Pathanamthitta":     { lat: 9.2648, lon: 76.7870 },
  "Alappuzha":          { lat: 9.4981, lon: 76.3388 },
  "Kottayam":           { lat: 9.5916, lon: 76.5222 },
  "Idukki":             { lat: 9.9189, lon: 77.1025 },
  "Munnar":             { lat: 10.0889, lon: 77.0595 },
  "Ernakulam":          { lat: 10.0105, lon: 76.3527 },
  "Kochi":              { lat: 9.9312, lon: 76.2673 },
  "Thrissur":           { lat: 10.5276, lon: 76.2144 },
  "Palakkad":           { lat: 10.7867, lon: 76.6548 },
  "Malappuram":         { lat: 11.0730, lon: 76.0740 },
  "Kozhikode":          { lat: 11.2588, lon: 75.7804 },
  "Wayanad":            { lat: 11.6854, lon: 76.1320 },
  "Kannur":             { lat: 11.8745, lon: 75.3704 },
  "Kasaragod":          { lat: 12.4996, lon: 74.9869 },
  "Varkala":            { lat: 8.7379, lon: 76.7163 },
  "Kovalam":            { lat: 8.4004, lon: 76.9782 },
  "Kumarakom":          { lat: 9.6160, lon: 76.4323 },
  "Thekkady":           { lat: 9.5979, lon: 77.1700 },
  "Bekal":              { lat: 12.3972, lon: 75.0395 },
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function initNearbyHotels(allHotels) {
  const section = document.getElementById("nearby-hotels-section");
  const label = document.getElementById("nearby-hotels-label");
  const grid = document.getElementById("nearby-hotels-grid");
  if (!section || !grid) return;

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const active = allHotels.filter(h => h.status === "active");

      const withDist = active.map(h => {
        const coords = KERALA_DISTRICT_COORDS[h.district] || KERALA_DISTRICT_COORDS[h.location?.split(",")[0]?.trim()];
        const dist = coords ? haversineKm(latitude, longitude, coords.lat, coords.lon) : 9999;
        return { ...h, _dist: dist };
      }).sort((a, b) => a._dist - b._dist).slice(0, 6);

      if (withDist.length === 0) return;

      const nearest = withDist[0];
      const distKm = Math.round(nearest._dist);
      if (label) label.textContent = `Showing hotels near your location${distKm < 500 ? ` (closest: ${distKm} km away)` : " in Kerala"}`;

      section.style.display = "block";
      renderHotelsGrid("nearby-hotels-grid", withDist);
    },
    () => {},
    { timeout: 8000, maximumAge: 300000 }
  );
}

async function initLandingPage() {
  let hotels = await getHotels();
  window._currentHotelsRef = hotels;
  const activeHotels = hotels.filter(h => h.status === "active");
  await renderHotelsGrid("hotels-near-you-grid", activeHotels);
  await renderHotelsGrid("featured-hotels-grid", activeHotels.filter(h => h.featured).slice(0, 4));

  // Handle URL params: ?category= or ?district= from categories.html or external links
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get("category");
  const urlDistrict = urlParams.get("district");
  if (urlCategory) {
    const catEl = document.getElementById("filter-category");
    if (catEl) {
      const cleanParam = urlCategory.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedOption = Array.from(catEl.options).find(opt => {
        const cleanVal = opt.value.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanVal.includes(cleanParam) || cleanParam.includes(cleanVal)) return true;
        if (cleanVal.length >= 5 && cleanParam.length >= 5 && cleanVal.substring(0, 5) === cleanParam.substring(0, 5)) return true;
        return false;
      });
      if (matchedOption) {
        catEl.value = matchedOption.value;
      } else {
        catEl.value = urlCategory;
      }
    }
    const fp = document.getElementById("advanced-filters-panel");
    if (fp) fp.style.display = "block";
    await applyAdvancedFilters(hotels);
    setTimeout(() => document.getElementById("hotels-near-you")?.scrollIntoView({ behavior: "smooth" }), 300);
  } else if (urlDistrict) {
    const locEl = document.getElementById("search-location");
    if (locEl) locEl.value = urlDistrict;
    await applyAdvancedFilters(hotels);
    setTimeout(() => document.getElementById("hotels-near-you")?.scrollIntoView({ behavior: "smooth" }), 300);
  }
  initNearbyHotels(hotels);
  onDataChange((source) => {
    if (source === "hotels") {
      getHotels().then(async (list) => {
        hotels = list;
        window._currentHotelsRef = hotels;
        await applyAdvancedFilters(hotels);
        await renderHotelsGrid("featured-hotels-grid", hotels.filter((h) => h.status === "active" && h.featured).slice(0, 4));
      });
    }
  });
  // Hook Search Form
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await applyAdvancedFilters(hotels);
      document.getElementById("hotels-near-you")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Hook Toggle Filters
  const toggleFiltersBtn = document.getElementById("btn-toggle-filters");
  const filtersPanel = document.getElementById("advanced-filters-panel");
  if (toggleFiltersBtn && filtersPanel) {
    toggleFiltersBtn.addEventListener("click", () => {
      const showing = filtersPanel.style.display === "block";
      filtersPanel.style.display = showing ? "none" : "block";
      toggleFiltersBtn.classList.toggle("active", !showing);
    });
  }

  // Hook Filters Inputs Change events
  const filterInputs = [
    document.getElementById("filter-price-min"),
    document.getElementById("filter-price-max"),
    document.getElementById("filter-rating"),
    document.getElementById("filter-category"),
    document.getElementById("filter-sorting")
  ];
  filterInputs.forEach(el => {
    if (el) el.addEventListener("change", () => applyAdvancedFilters(hotels));
    if (el) el.addEventListener("input", () => updateFilterBadge());
  });
  document.querySelectorAll(".filter-amenity").forEach(el => {
    el.addEventListener("change", () => applyAdvancedFilters(hotels));
  });

  // Autocomplete Location Search
  const searchInput = document.getElementById("search-location");
  const autoBox = document.getElementById("search-autocomplete-box");
  if (searchInput && autoBox) {
    searchInput.addEventListener("input", () => {
      const val = searchInput.value.toLowerCase().trim();
      if (!val) {
        autoBox.style.display = "none";
        return;
      }

      // All 14 Kerala districts + popular sub-destinations
      const suggestionsSet = new Set([
        // 14 Official Kerala Districts
        "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
        "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
        "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
        // Aliases & popular sub-destinations
        "Trivandrum", "Kochi", "Fort Kochi", "Mattancherry",
        "Munnar", "Thekkady", "Kumily", "Varkala", "Kovalam",
        "Kumarakom", "Alleppey", "Bekal", "Vagamon", "Thrissur",
        "Guruvayur", "Kozhikode", "Calicut", "Thalassery", "Kannur",
        "Kalpetta", "Sultan Bathery", "Mananthavady", "Nelliyampathy",
        "Palani", "Chalakudy", "Irinjalakuda", "Thrippunithura",
        "Marari", "Cherai", "Vypeen", "Periyar", "Athirapally"
      ]);
      hotels.forEach(h => {
        if (h.status === "active") {
          suggestionsSet.add(h.district);
          suggestionsSet.add(h.name);
          if (h.location) suggestionsSet.add(h.location.split(",")[0].trim());
        }
      });
      const suggestions = Array.from(suggestionsSet);

      const matches = suggestions.filter(s => s.toLowerCase().includes(val)).slice(0, 5);
      if (matches.length === 0) {
        autoBox.style.display = "none";
        return;
      }
      autoBox.innerHTML = matches.map(m => `
        <div class="autocomplete-suggestion" style="padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--border); font-size:13px; font-weight:500;" onclick="selectAutocompleteSuggestion('${m.replace(/'/g, "\\'")}')">
          <i class="fas fa-search" style="margin-right: 8px; color:var(--text-secondary); font-size:11px;"></i> ${m}
        </div>
      `).join("");
      autoBox.style.display = "block";
    });

    window.selectAutocompleteSuggestion = function(val) {
      searchInput.value = val;
      autoBox.style.display = "none";
      applyAdvancedFilters(hotels);
    };

    document.addEventListener("click", (e) => {
      if (e.target !== searchInput) {
        autoBox.style.display = "none";
      }
    });
  }

  // Hook Category clicks to filter
  const catCards = document.querySelectorAll(".category-card");
  catCards.forEach(card => {
    card.addEventListener("click", async () => {
      const catName = card.dataset.category;
      document.getElementById("filter-category").value = catName;
      await applyAdvancedFilters(hotels);
      document.getElementById("hotels-near-you").scrollIntoView({ behavior: "smooth" });
    });
  });

  // Hook Destination clicks to filter
  const destCards = document.querySelectorAll(".destination-card");
  destCards.forEach(card => {
    card.addEventListener("click", async () => {
      const destName = card.dataset.destination;
      document.getElementById("search-location").value = destName;
      await applyAdvancedFilters(hotels);
      document.getElementById("hotels-near-you").scrollIntoView({ behavior: "smooth" });
    });
  });

  // Hook District tag clicks to filter
  const distTags = document.querySelectorAll(".district-tag");
  distTags.forEach(tag => {
    tag.addEventListener("click", async () => {
      const destName = tag.innerText.trim();
      document.getElementById("search-location").value = destName;
      await applyAdvancedFilters(hotels);
      const targetSec = document.getElementById("hotels-near-you");
      if (targetSec) targetSec.scrollIntoView({ behavior: "smooth" });
    });
  });
}

async function applyAdvancedFilters(hotels) {
  const query = (document.getElementById("search-location")?.value || "").toLowerCase().trim();
  const minPrice = parseInt(document.getElementById("filter-price-min")?.value) || 0;
  const maxPriceRaw = parseInt(document.getElementById("filter-price-max")?.value);
  const maxPrice = maxPriceRaw > 0 ? maxPriceRaw : Infinity;
  const minRating = parseFloat(document.getElementById("filter-rating")?.value) || 0;
  const category = document.getElementById("filter-category")?.value || "";
  const sort = document.getElementById("filter-sorting")?.value || "recommended";
  
  const selectedAmenities = Array.from(document.querySelectorAll(".filter-amenity:checked")).map(el => el.value);

  let filtered = hotels.filter(h => {
    if (h.status !== "active") return false;
    const loc = (h.location || "").toLowerCase();
    const name = (h.name || "").toLowerCase();
    const district = (h.district || "").toLowerCase();
    const locMatch = !query || loc.includes(query) || name.includes(query) || district.includes(query);
    const priceMatch = (h.price || 0) >= minPrice && (h.price || 0) <= maxPrice;
    const ratingMatch = (h.rating || 0) >= minRating;
    const catMatch = !category || h.category === category;
    const amenitiesMatch = selectedAmenities.every(amenity => h.amenities && h.amenities.includes(amenity));

    return locMatch && priceMatch && ratingMatch && catMatch && amenitiesMatch;
  });

  if (sort === "price-low") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price-high") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "rating-high") {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const gridTitle = document.querySelector("#hotels-near-you h2");
  if (gridTitle) gridTitle.innerText = query ? `Search Results for "${query}"` : "Hotels Near You";

  // Update results count
  const countEl = document.getElementById("filter-results-count");
  const totalActive = hotels.filter(h => h.status === "active").length;
  const hasActiveFilters = query || minPrice > 0 || maxPrice < Infinity || minRating > 0 || category || selectedAmenities.length > 0;
  if (countEl) {
    if (hasActiveFilters) {
      countEl.style.display = "inline";
      countEl.innerHTML = filtered.length === totalActive
        ? `<span style="color:var(--primary);font-weight:600;">${filtered.length}</span> hotels`
        : `<span style="color:var(--primary);font-weight:600;">${filtered.length}</span> of ${totalActive} hotels`;
    } else {
      countEl.style.display = "none";
    }
  }

  // Update filter badge on Filters button
  updateFilterBadge();

  await renderHotelsGrid("hotels-near-you-grid", filtered);
}

function updateFilterBadge() {
  const query = (document.getElementById("search-location")?.value || "").trim();
  const minPrice = parseInt(document.getElementById("filter-price-min")?.value) || 0;
  const maxPrice = parseInt(document.getElementById("filter-price-max")?.value) || 0;
  const minRating = document.getElementById("filter-rating")?.value || "";
  const category = document.getElementById("filter-category")?.value || "";
  const selectedAmenities = document.querySelectorAll(".filter-amenity:checked").length;

  let count = 0;
  if (minPrice > 0) count++;
  if (maxPrice > 0) count++;
  if (minRating) count++;
  if (category) count++;
  count += selectedAmenities;

  const btn = document.getElementById("btn-toggle-filters");
  if (!btn) return;
  const existingBadge = btn.querySelector(".filter-badge");
  if (existingBadge) existingBadge.remove();
  if (count > 0) {
    const badge = document.createElement("span");
    badge.className = "filter-badge";
    badge.style.cssText = "background:var(--primary);color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;";
    badge.textContent = count;
    btn.appendChild(badge);
  }
}

window.clearAllFilters = function() {
  const searchInput = document.getElementById("search-location");
  const priceMin = document.getElementById("filter-price-min");
  const priceMax = document.getElementById("filter-price-max");
  const rating = document.getElementById("filter-rating");
  const category = document.getElementById("filter-category");
  const sorting = document.getElementById("filter-sorting");
  if (searchInput) searchInput.value = "";
  if (priceMin) priceMin.value = "";
  if (priceMax) priceMax.value = "";
  if (rating) rating.value = "";
  if (category) category.value = "";
  if (sorting) sorting.value = "recommended";
  document.querySelectorAll(".filter-amenity:checked").forEach(el => el.checked = false);
  // Re-run filters with no criteria (shows all)
  if (window._currentHotelsRef) applyAdvancedFilters(window._currentHotelsRef);
};

function getHotelCardHtml(h, isFav) {
  const price = h.price || 0;
  const rating = h.rating || 0;
  const reviewsCount = h.reviewsCount || 0;
  return `
    <div class="hotel-card" data-hotel-id="${h.id}" onclick="window.location.href='/hotel.html?id=${h.id}'">
      <div class="hotel-card-image">
        <img src="${h.image || '/assets/images/riverside.webp'}" alt="${h.name}" onerror="this.src='https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80'">
        <span class="hotel-card-tag">${h.badge || h.category || ''}</span>
        <button class="hotel-card-save" onclick="event.stopPropagation(); event.preventDefault(); toggleWishlist(this, '${h.id}')">
          <i class="${isFav ? 'fas fa-heart' : 'far fa-heart'}" style="${isFav ? 'color: #FF5A5F;' : ''}"></i>
        </button>
      </div>
      <div class="hotel-card-content">
        <div class="hotel-card-rating">
          <i class="fas fa-star"></i> ${rating.toFixed(1)} <span>(${reviewsCount} reviews)</span>
        </div>
        <h3>${h.name}</h3>
        <div class="hotel-card-loc">
          <i class="fas fa-map-marker-alt"></i> ${h.location || h.district || 'Kerala'}
        </div>
        <div class="hotel-card-footer">
          <div class="hotel-card-price">
            <span class="price-num">₹${price.toLocaleString("en-IN")}</span>
            <span class="price-unit">/night</span>
          </div>
          <a href="/hotel.html?id=${h.id}" class="btn btn-outline btn-sm" onclick="event.stopPropagation();">View Details</a>
        </div>
      </div>
    </div>
  `;
}

async function renderHotelsGrid(containerId, hotelsList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (hotelsList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: span 4; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <div style="font-size:48px; margin-bottom:16px;">🔍</div>
        <h3 style="font-size:18px; color:var(--text-main); margin-bottom:8px;">No hotels found</h3>
        <p style="font-size:14px; margin-bottom:20px;">Try adjusting your filters or search for a different destination.</p>
        <button onclick="clearAllFilters()" style="background:var(--primary); color:#fff; border:none; border-radius:30px; padding:10px 24px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit;">
          <i class="fas fa-times" style="margin-right:6px;"></i> Clear Filters
        </button>
      </div>`;
    return;
  }

  let userFavIds = [];
  const userJson = localStorage.getItem("hbooking_user");
  if (userJson) {
    const user = JSON.parse(userJson);
    const userKey = user.uid || user.email;
    try {
      const favs = await getFavorites(userKey);
      userFavIds = favs.map(f => f.hotelId);
    } catch (e) {
      console.warn("Could not retrieve favorites for user:", e);
    }
  }

  container.innerHTML = hotelsList.map(h => getHotelCardHtml(h, userFavIds.includes(h.id))).join("");
}

// -------------------------------------------------------------
// HOTEL DETAIL PAGE CONTROLLER
// -------------------------------------------------------------
let selectedHotel = null;
let bookingMode = "whatsapp"; // "whatsapp" or "online"
let appliedCoupon = null;
let currentHotelRooms = [];

function getRoomImage(roomType) {
  const type = (roomType || "").toLowerCase();
  if (type.includes("suite")) {
    return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80";
  }
  if (type.includes("deluxe") || type.includes("premium")) {
    return "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80";
  }
  if (type.includes("villa")) {
    return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80";
  }
  if (type.includes("houseboat")) {
    return "https://images.unsplash.com/photo-1593692909825-44b7b37a4d76?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80";
}

function renderRoomCards(hotelRooms, activeRoomId) {
  const roomsContainer = document.getElementById("rooms-list-container");
  if (!roomsContainer) return;
  
  if (hotelRooms.length === 0) {
    roomsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-secondary); border: 1.5px dashed var(--border); border-radius: 8px;">
        <i class="fas fa-bed" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px;"></i>
        <p>No rooms currently available at this property.</p>
      </div>
    `;
    return;
  }

  roomsContainer.innerHTML = hotelRooms.map((r) => {
    const isSelected = r.id === activeRoomId;
    const roomImg = getRoomImage(r.type);
    const capacityText = `${r.capacity} Guest${r.capacity > 1 ? 's' : ''}`;
    const bedText = `${r.beds} Bed${r.beds > 1 ? 's' : ''}`;
    const amHtml = (r.amenities || []).map(a => `<span class="room-amenity-tag">${a}</span>`).join("");
    
    return `
      <div class="room-card ${isSelected ? 'selected' : ''}" data-room-id="${r.id}">
        <div class="room-card-image">
          <img src="${roomImg}" alt="${r.type}" onerror="this.src='https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'">
        </div>
        <div class="room-card-content">
          <div>
            <div class="room-card-header">
              <h3>${r.type}</h3>
              <span class="room-inventory-badge">${r.inventory} left</span>
            </div>
            <div class="room-card-details">
              <span><i class="fas fa-user-friends"></i> Max ${capacityText}</span>
              <span><i class="fas fa-bed"></i> ${bedText}</span>
            </div>
            <div class="room-card-amenities">
              ${amHtml}
            </div>
          </div>
          <div class="room-card-footer">
            <div class="room-card-price">
              <span class="price">₹${r.price.toLocaleString("en-IN")}</span>
              <span class="tax-info">/ night + taxes</span>
            </div>
            <button type="button" class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} room-select-btn" onclick="selectRoomCard('${r.id}')">
              ${isSelected ? 'Selected <i class="fas fa-check"></i>' : 'Select Room'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function renderSimilarHotels() {
  const similarContainer = document.getElementById("similar-hotels-grid");
  if (!similarContainer) return;

  const allHotels = await getHotels();
  let similar = allHotels.filter(h => h.id !== selectedHotel.id && h.status === "active" && (h.category === selectedHotel.category || h.district === selectedHotel.district));
  
  if (similar.length < 4) {
    const extra = allHotels.filter(h => h.id !== selectedHotel.id && h.status === "active" && !similar.some(s => s.id === h.id));
    similar = similar.concat(extra);
  }
  
  similar = similar.slice(0, 4);

  if (similar.length === 0) {
    similarContainer.innerHTML = `<div style="grid-column: span 4; text-align: center; color: var(--text-secondary);">No similar hotels found.</div>`;
    return;
  }

  let userFavIds = [];
  const userJson = localStorage.getItem("hbooking_user");
  if (userJson) {
    const user = JSON.parse(userJson);
    const userKey = user.uid || user.email;
    try {
      const favs = await getFavorites(userKey);
      userFavIds = favs.map(f => f.hotelId);
    } catch (e) {
      console.warn("Could not retrieve favorites for user:", e);
    }
  }

  similarContainer.innerHTML = similar.map(h => getHotelCardHtml(h, userFavIds.includes(h.id))).join("");
}

window.selectRoomCard = function(roomId) {
  const roomSelect = document.getElementById("booking-room-select");
  if (roomSelect) {
    roomSelect.value = roomId;
    roomSelect.dispatchEvent(new Event("change"));
  }
  
  renderRoomCards(currentHotelRooms, roomId);
};

async function initHotelDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const hotelId = params.get("id") || "riverside";
  const hotels = await getHotels();
  
  selectedHotel = hotels.find(h => h.id === hotelId) || hotels[0];
  if (!selectedHotel) return;

  // Save button detail page listener
  const detailSaveBtn = document.getElementById("btn-save-hotel-detail");
  if (detailSaveBtn) {
    const userJson = localStorage.getItem("hbooking_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      const userKey = user.uid || user.email;
      const favs = await getFavorites(userKey);
      const isFav = favs.some(f => f.hotelId === selectedHotel.id);
      if (isFav) {
        detailSaveBtn.innerHTML = `<i class="fas fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Saved`;
      } else {
        detailSaveBtn.innerHTML = `<i class="far fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Save`;
      }
    }
    
    detailSaveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const userJson = localStorage.getItem("hbooking_user");
      if (!userJson) {
        alert("Please log in to save properties to your wishlist!");
        window.location.href = "/login.html";
        return;
      }
      const user = JSON.parse(userJson);
      const userKey = user.uid || user.email;
      
      const favs = await getFavorites(userKey);
      const isFav = favs.some(f => f.hotelId === selectedHotel.id);

      if (isFav) {
        await removeFavorite(userKey, selectedHotel.id);
        detailSaveBtn.innerHTML = `<i class="far fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Save`;
      } else {
        await addFavorite(userKey, selectedHotel.id);
        detailSaveBtn.innerHTML = `<i class="fas fa-heart" style="margin-right: 8px; color: #FF5A5F;"></i> Saved`;
      }
      setupSavedHotelsCount();
    });
  }

  // Render hotel details text
  // Dynamic SEO Updates for Hotel Detail Page
  const dist = selectedHotel.district || "Kerala";
  document.title = `${selectedHotel.name} | Book Hotels in ${dist}, Kerala`;

  // Set meta description dynamically
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  const cleanDescription = selectedHotel.description ? selectedHotel.description.replace(/<[^>]*>/g, '').substring(0, 150) : "";
  metaDesc.setAttribute('content', `Book a stay at ${selectedHotel.name} in ${selectedHotel.location}, ${dist}, Kerala. ${cleanDescription}... Read reviews, check rates and book.`);

  // Set canonical URL dynamically
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', `https://hotelsnearmeinkera.la/hotel.html?id=${selectedHotel.id}`);

  // Inject Hotel schema markup dynamically
  let hotelSchema = document.getElementById("hotel-schema-ld");
  if (!hotelSchema) {
    hotelSchema = document.createElement('script');
    hotelSchema.id = "hotel-schema-ld";
    hotelSchema.type = "application/ld+json";
    document.head.appendChild(hotelSchema);
  }
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": selectedHotel.name,
    "description": selectedHotel.description ? selectedHotel.description.replace(/<[^>]*>/g, '') : "",
    "image": selectedHotel.image ? `https://hotelsnearmeinkera.la${selectedHotel.image.startsWith('/') ? '' : '/'}${selectedHotel.image}` : "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": selectedHotel.location,
      "addressRegion": dist,
      "addressCountry": "IN"
    },
    "telephone": selectedHotel.whatsapp ? `+${selectedHotel.whatsapp}` : "",
    "starRating": {
      "@type": "Rating",
      "ratingValue": selectedHotel.rating
    }
  };
  hotelSchema.textContent = JSON.stringify(schemaObj, null, 2);

  document.getElementById("hotel-title").innerText = selectedHotel.name;
  document.getElementById("breadcrumb-current").innerText = selectedHotel.name;
  const bDistrict = document.getElementById("breadcrumb-district");
  const bHotelsIn = document.getElementById("breadcrumb-hotels-in");
  if (bDistrict) { bDistrict.innerText = dist; bDistrict.href = `/?district=${encodeURIComponent(dist)}`; }
  if (bHotelsIn) { bHotelsIn.innerText = `Hotels in ${dist}`; bHotelsIn.href = `/?district=${encodeURIComponent(dist)}`; }
  

  document.getElementById("hotel-stars").innerHTML = `<i class="fas fa-star"></i>`.repeat(Math.floor(selectedHotel.rating));
  document.getElementById("hotel-rating-score").innerText = selectedHotel.rating;
  document.getElementById("hotel-reviews-count").innerText = `(${selectedHotel.reviewsCount} reviews)`;
  document.getElementById("hotel-location-text").innerText = selectedHotel.location;
  if (document.getElementById("hotel-location-full")) document.getElementById("hotel-location-full").innerText = selectedHotel.location;
  document.getElementById("hotel-badge-tag").innerText = selectedHotel.badge || selectedHotel.category;
  document.getElementById("hotel-desc").innerHTML = selectedHotel.description;
  document.getElementById("sidebar-hotel-whatsapp").innerText = `+${selectedHotel.whatsapp}`;
  const sidebarWaBtn = document.getElementById("sidebar-hotel-whatsapp-btn");
  if (sidebarWaBtn && selectedHotel.whatsapp) {
    const waNum = String(selectedHotel.whatsapp).replace(/\D/g, "");
    sidebarWaBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(`Hello, I need help booking a stay at ${selectedHotel.name}.`)}`;
  }

  // Set floating WhatsApp button for hotel-specific number
  const floatWa = document.getElementById("float-whatsapp-btn");
  if (floatWa && selectedHotel.whatsapp) {
    const waNum = String(selectedHotel.whatsapp).replace(/\D/g, "");
    const waMsg = encodeURIComponent(`Hi! I found ${selectedHotel.name} on HotelsNearMeInKerala.com and would like to enquire about availability and rates.`);
    floatWa.href = `https://wa.me/${waNum}?text=${waMsg}`;
    floatWa.title = `WhatsApp ${selectedHotel.name}`;
  }

  // Update mobile WhatsApp nav button to open booking modal instead
  const mobWaBtn = document.getElementById("mob-wa-btn");
  if (mobWaBtn) {
    mobWaBtn.onclick = (e) => { e.preventDefault(); openBookingModal(); };
  }
  
  // ── Dynamic Multi-Image Gallery ────────────────────────────────────────────
  // Build full image list: primary image + extra images from admin
  const allImages = [selectedHotel.image];
  if (Array.isArray(selectedHotel.images)) {
    selectedHotel.images.forEach(img => { if (img && img.trim()) allImages.push(img.trim()); });
  }
  
  const mainImg = document.getElementById("gallery-img-main");
  if (mainImg) {
    mainImg.src = allImages[0] || "/assets/images/riverside.webp";
    mainImg.alt = `${selectedHotel.name} - Main Hotel Image, ${selectedHotel.location}, ${dist}`;
  }
  
  for (let i = 1; i <= 4; i++) {
    const img = document.getElementById(`gallery-img-${i}`);
    if (!img) continue;
    if (allImages[i]) {
      img.src = allImages[i];
      img.style.display = "";
      img.alt = `${selectedHotel.name} photo ${i+1}`;
    } else {
      img.style.display = "none";
      const parent = img.parentElement;
      if (parent) parent.style.background = "var(--light)";
    }
  }
  
  const moreBtn = document.getElementById("gallery-more-btn");
  if (moreBtn) {
    if (allImages.length > 5) {
      moreBtn.style.display = "";
      moreBtn.innerText = `+${allImages.length - 5} Photos`;
    } else {
      moreBtn.style.display = "none";
    }
  }

  // ── Dynamic Map Embed (OpenStreetMap, no API key needed) ──────────────────
  const mapIframe = document.getElementById("hotel-map-iframe");
  const mapPlaceholder = document.getElementById("hotel-map-placeholder");
  const mapLink = document.getElementById("hotel-map-link");
  if (mapIframe && mapPlaceholder) {
    // Build embed URL: extract query from mapUrl or use hotel location
    let rawUrl = (selectedHotel.mapUrl || "").trim();
    let locationQuery = selectedHotel.location || selectedHotel.name;
    // Try to extract the ?q= param from a Google Maps URL
    try {
      const urlObj = new URL(rawUrl);
      const q = urlObj.searchParams.get("q");
      if (q) locationQuery = q;
    } catch(e) { /* invalid URL, use location */ }
    // Build an OpenStreetMap embed URL (works without API key)
    const osmQuery = encodeURIComponent(locationQuery + ", Kerala, India");
    const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=74.0,8.0,78.0,13.0&layer=mapnik&marker=&query=${osmQuery}`;
    // Use Google Maps embed format (works without API key)
    const googleEmbedSrc = `https://maps.google.com/maps?q=${osmQuery}&output=embed&hl=en&z=14`;
    mapIframe.src = googleEmbedSrc;
    mapIframe.style.display = "block";
    mapIframe.style.width = "100%";
    mapIframe.style.height = "320px";
    mapIframe.style.border = "none";
    mapIframe.style.borderRadius = "8px";
    mapPlaceholder.style.display = "none";
    if (mapLink) {
      mapLink.href = rawUrl || `https://maps.google.com/?q=${osmQuery}`;
      mapLink.style.display = "";
      mapLink.innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right:6px;"></i> Open in Google Maps`;
    }
  }

  // Render Amenities
  const amGrid = document.getElementById("amenities-grid");
  if (amGrid && selectedHotel.amenities) {
    amGrid.innerHTML = selectedHotel.amenities.map(a => `
      <div class="amenity-item">
        <i class="fas fa-check-circle"></i>
        <span>${a}</span>
      </div>
    `).join("");
  }

  // Render Highlights (handles both string[] and {title,desc}[] formats)
  const hlGrid = document.getElementById("highlights-grid");
  if (hlGrid && selectedHotel.highlights) {
    hlGrid.innerHTML = selectedHotel.highlights.map(h => {
      const title = typeof h === "string" ? h : (h.title || h);
      const desc = typeof h === "string" ? "" : (h.desc || "");
      return `
      <div class="highlight-item">
        <i class="fas fa-check-circle" style="color:var(--primary);margin-right:8px;"></i>
        <div>
          <h4>${title}</h4>
          ${desc ? `<p style="font-size:12px;color:var(--text-secondary);margin:2px 0 0;">${desc}</p>` : ""}
        </div>
      </div>`;
    }).join("");
  }

  // Render Details Table
  const table = document.getElementById("details-table-body");
  if (table && selectedHotel.details) {
    const d = selectedHotel.details;
    const rows = [
      ["Check-in", d.checkIn],
      ["Check-out", d.checkOut],
      ["Property Type", d.propertyType],
      ["Rooms", d.roomCount ? `${d.roomCount} Rooms` : null],
      ["Star Rating", d.starRating],
      ["Languages", d.languages],
      ["Nearest Railway Station", d.station],
      ["Nearest Airport", d.airport],
    ].filter(([, v]) => v != null && v !== "undefined");
    table.innerHTML = rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
  }

  // Render Nearby (handles both string[] and {name,distance}[] formats)
  const nearbyList = document.getElementById("nearby-attractions-list");
  if (nearbyList && selectedHotel.nearby) {
    nearbyList.innerHTML = selectedHotel.nearby.map(n => {
      const name = typeof n === "string" ? n : (n.name || n);
      const dist = typeof n === "string" ? "" : (n.distance || "");
      return `
      <div style="box-shadow:none; border:1px solid var(--border); padding:14px 16px; border-radius:10px; background:var(--white);">
        <div style="font-size:18px; margin-bottom:6px;">🏛️</div>
        <h4 style="font-size: 13px; font-weight:600; margin-bottom: 4px; color:var(--text-main);">${name}</h4>
        ${dist ? `<span style="font-size: 11px; color: var(--text-secondary);"><i class="fas fa-walking"></i> ${dist}</span>` : ""}
      </div>`;
    }).join("");
  }

  // Set initial dates for widget
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatInputDate = (date) => date.toISOString().split("T")[0];
  document.getElementById("checkin-input").value = formatInputDate(today);
  document.getElementById("checkout-input").value = formatInputDate(tomorrow);

  // Load Hotel Rooms
  const rooms = await getRooms();
  const hotelRooms = rooms.filter(r => r.hotelId === selectedHotel.id && r.availability !== "maintenance");
  currentHotelRooms = hotelRooms;
  
  const roomSelect = document.getElementById("booking-room-select");
  if (roomSelect) {
    if (hotelRooms.length === 0) {
      roomSelect.innerHTML = `<option value="">No rooms available</option>`;
    } else {
      roomSelect.innerHTML = hotelRooms.map(r => `
        <option value="${r.id}" data-price="${r.price}">${r.type} (₹${r.price.toLocaleString("en-IN")}/night) - ${r.inventory} left</option>
      `).join("");
    }
    roomSelect.addEventListener("change", calculatePricing);
  }

  // Render room cards with photos
  renderRoomCards(hotelRooms, hotelRooms.length > 0 ? hotelRooms[0].id : "");

  // Render similar hotels
  renderSimilarHotels();

  // Tab links active state handling
  const tabLinks = document.querySelectorAll(".tab-link");
  tabLinks.forEach(link => {
    link.addEventListener("click", () => {
      tabLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Initial Calculation
  calculatePricing();

  // Calculate pricing when form changes
  document.getElementById("checkin-input").addEventListener("change", calculatePricing);
  document.getElementById("checkout-input").addEventListener("change", calculatePricing);
  document.getElementById("guests-rooms").addEventListener("change", calculatePricing);

  // Hook Apply Coupon Button
  const applyCouponBtn = document.getElementById("btn-apply-coupon");
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", async () => {
      const codeInput = document.getElementById("coupon-code-input").value.trim().toUpperCase();
      const msg = document.getElementById("coupon-message");
      if (!codeInput) {
        msg.innerText = "Please enter a coupon code.";
        msg.style.color = "#FF5A5F";
        msg.style.display = "block";
        return;
      }
      
      const coupons = await getCoupons();
      const coupon = coupons.find(c => c.code === codeInput && c.status === "active");
      
      if (!coupon) {
        msg.innerText = "Invalid or expired coupon code.";
        msg.style.color = "#FF5A5F";
        msg.style.display = "block";
        appliedCoupon = null;
        calculatePricing();
        return;
      }
      
      const expiry = new Date(coupon.expiryDate);
      if (expiry < new Date()) {
        msg.innerText = "This coupon code has expired.";
        msg.style.color = "#FF5A5F";
        msg.style.display = "block";
        appliedCoupon = null;
        calculatePricing();
        return;
      }

      const tempGrandTotal = getEstimatedGrandTotalBeforeCoupon();
      if (tempGrandTotal < (coupon.minBookingAmount || 0)) {
        msg.innerText = `Minimum booking amount of ₹${coupon.minBookingAmount.toLocaleString("en-IN")} required.`;
        msg.style.color = "#FF5A5F";
        msg.style.display = "block";
        appliedCoupon = null;
        calculatePricing();
        return;
      }
      
      appliedCoupon = coupon;
      msg.innerText = `Coupon ${coupon.code} applied! ${coupon.discountPercent}% Discount.`;
      msg.style.color = "#108569";
      msg.style.display = "block";
      calculatePricing();
    });
  }

  // Dynamic Reviews Helper function
  function renderReviewsAndCalculateRating(approvedReviews) {
    const hotelReviewsList = document.getElementById("hotel-reviews-list");
    if (!hotelReviewsList) return;

    if (approvedReviews.length === 0) {
      hotelReviewsList.innerHTML = `<p style="font-size:13px; color:var(--text-secondary); text-align:center; padding: 20px;">No reviews yet. Be the first to share your experience!</p>`;
      
      const ratingScoreEl = document.getElementById("hotel-rating-score");
      if (ratingScoreEl) ratingScoreEl.innerText = selectedHotel.rating || "4.5";
      
      const hotelStarsEl = document.getElementById("hotel-stars");
      if (hotelStarsEl) {
        const r = selectedHotel.rating || 4.5;
        hotelStarsEl.innerHTML = `<i class="fas fa-star"></i>`.repeat(Math.floor(r)) + 
          (r % 1 >= 0.5 ? `<i class="fas fa-star-half-alt"></i>` : "") + 
          `<i class="far fa-star"></i>`.repeat(Math.max(0, 5 - Math.ceil(r)));
      }
      
      const reviewsCountEl = document.getElementById("hotel-reviews-count");
      const storedCount = selectedHotel.reviewsCount || 0;
      if (reviewsCountEl) reviewsCountEl.innerText = `(${storedCount} reviews)`;

      const overallScoreEl = document.getElementById("detail-overall-score");
      if (overallScoreEl) overallScoreEl.innerText = selectedHotel.rating || "4.5";

      const starsRowEl = document.getElementById("detail-stars-row");
      if (starsRowEl) {
        const r = selectedHotel.rating || 4.5;
        starsRowEl.innerHTML = `<i class="fas fa-star"></i>`.repeat(Math.floor(r)) + 
          (r % 1 >= 0.5 ? `<i class="fas fa-star-half-alt"></i>` : "") + 
          `<i class="far fa-star"></i>`.repeat(Math.max(0, 5 - Math.ceil(r)));
      }

      const overallTextEl = document.getElementById("detail-overall-text");
      const rLabel = (selectedHotel.rating || 4.5) >= 4.5 ? "Excellent" : (selectedHotel.rating || 4.5) >= 4.0 ? "Very Good" : "Good";
      if (overallTextEl) overallTextEl.innerText = storedCount > 0 ? `${rLabel} (${storedCount} reviews)` : `New Stay (0 reviews)`;
      
      return;
    }

    hotelReviewsList.innerHTML = approvedReviews.map(r => {
      const reviewText = r.comment || r.reviewText || "";
      const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "";
      const initials = (r.userName || "G").charAt(0).toUpperCase();
      const avatarColors = ["#4285F4","#EA4335","#34A853","#FBBC05","#AA46BB","#0097A7"];
      const avatarColor = avatarColors[(r.userName || "G").charCodeAt(0) % avatarColors.length];
      const hasPhoto = r.userPhoto && !r.userPhoto.includes("pravatar");
      const avatarHtml = hasPhoto
        ? `<img src="${r.userPhoto}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'">`
        : `<div style="width:42px;height:42px;border-radius:50%;background:${avatarColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;">${initials}</div>`;
      const stars = `<span style="color:#FF9A02;font-size:13px;">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span>`;
      return `
      <div style="padding:18px 0; border-bottom:1px solid var(--border); display:flex; gap:14px; align-items:flex-start;">
        ${avatarHtml}
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
            <span style="font-size:14px;font-weight:600;color:var(--text-main);">${escapeHTML(r.userName)}</span>
            <span style="background:#E8F5E9;color:#2E7D32;font-size:10px;font-weight:700;padding:2px 7px;border-radius:12px;"><i class="fas fa-check-circle" style="margin-right:3px;"></i>Verified Stay</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            ${stars}
            ${dateStr ? `<span style="font-size:11px;color:var(--text-secondary);">${dateStr}</span>` : ""}
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin:0;">${escapeHTML(reviewText)}</p>
          ${r.replyText ? `
            <div style="background:#F8F9FA;padding:12px 14px;border-radius:8px;margin-top:12px;border-left:3px solid var(--primary);">
              <div style="font-size:11px;font-weight:700;color:var(--primary);margin-bottom:4px;"><i class="fas fa-hotel" style="margin-right:4px;"></i>Response from Management</div>
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin:0;">${escapeHTML(r.replyText)}</p>
            </div>` : ""}
        </div>
      </div>`;
    }).join("");

    const count = approvedReviews.length;
    const avg = parseFloat((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1));

    const ratingScoreEl = document.getElementById("hotel-rating-score");
    if (ratingScoreEl) ratingScoreEl.innerText = avg.toFixed(1);
    
    const hotelStarsEl = document.getElementById("hotel-stars");
    if (hotelStarsEl) {
      hotelStarsEl.innerHTML = `<i class="fas fa-star"></i>`.repeat(Math.floor(avg)) + 
        (avg % 1 >= 0.5 ? `<i class="fas fa-star-half-alt"></i>` : "") + 
        `<i class="far fa-star"></i>`.repeat(Math.max(0, 5 - Math.ceil(avg)));
    }
    
    const reviewsCountEl = document.getElementById("hotel-reviews-count");
    if (reviewsCountEl) reviewsCountEl.innerText = `(${count} reviews)`;

    const overallScoreEl = document.getElementById("detail-overall-score");
    if (overallScoreEl) overallScoreEl.innerText = avg.toFixed(1);

    const starsRowEl = document.getElementById("detail-stars-row");
    if (starsRowEl) {
      starsRowEl.innerHTML = `<i class="fas fa-star"></i>`.repeat(Math.floor(avg)) + 
        (avg % 1 >= 0.5 ? `<i class="fas fa-star-half-alt"></i>` : "") + 
        `<i class="far fa-star"></i>`.repeat(Math.max(0, 5 - Math.ceil(avg)));
    }

    const overallTextEl = document.getElementById("detail-overall-text");
    if (overallTextEl) {
      let label = "Excellent";
      if (avg < 4.0) label = "Good";
      else if (avg < 4.5) label = "Very Good";
      overallTextEl.innerText = `${label} (${count} reviews)`;
    }

    const cleanVal = Math.min(5, avg + 0.1);
    const locVal = avg;
    const servVal = avg;
    const valVal = Math.max(1, avg - 0.2);

    const cleanScoreEl = document.getElementById("detail-clean-score");
    if (cleanScoreEl) cleanScoreEl.innerText = cleanVal.toFixed(1);
    const cleanFillEl = document.getElementById("detail-clean-fill");
    if (cleanFillEl) cleanFillEl.style.width = `${Math.round(cleanVal * 20)}%`;

    const locScoreEl = document.getElementById("detail-location-score");
    if (locScoreEl) locScoreEl.innerText = locVal.toFixed(1);
    const locFillEl = document.getElementById("detail-location-fill");
    if (locFillEl) locFillEl.style.width = `${Math.round(locVal * 20)}%`;

    const servScoreEl = document.getElementById("detail-service-score");
    if (servScoreEl) servScoreEl.innerText = servVal.toFixed(1);
    const servFillEl = document.getElementById("detail-service-fill");
    if (servFillEl) servFillEl.style.width = `${Math.round(servVal * 20)}%`;

    const valueScoreEl = document.getElementById("detail-value-score");
    if (valueScoreEl) valueScoreEl.innerText = valVal.toFixed(1);
    const valueFillEl = document.getElementById("detail-value-fill");
    if (valueFillEl) valueFillEl.style.width = `${Math.round(valVal * 20)}%`;
  }

  // Load and Render Reviews
  const hotelReviewsList = document.getElementById("hotel-reviews-list");
  if (hotelReviewsList) {
    const reviews = await getReviews();
    const approvedReviews = reviews.filter(r => r.hotelId === selectedHotel.id && r.status === "approved");
    renderReviewsAndCalculateRating(approvedReviews);
  }

  // Star Rating Input click handler
  const starsContainer = document.getElementById("review-stars-input");
  const ratingInput = document.getElementById("review-rating-value");
  if (starsContainer && ratingInput) {
    const stars = starsContainer.querySelectorAll("i");
    stars.forEach(star => {
      star.addEventListener("click", () => {
        const val = parseInt(star.dataset.value);
        ratingInput.value = val;
        stars.forEach(s => {
          const sVal = parseInt(s.dataset.value);
          s.style.color = sVal <= val ? "#FF9A02" : "#E2ECE8";
        });
      });
    });
  }

  // Review Submit Form
  const reviewForm = document.getElementById("form-submit-review");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userJson = localStorage.getItem("hbooking_user");
      if (!userJson) {
        alert("Please log in to submit a review.");
        window.location.href = "/login.html";
        return;
      }
      const user = JSON.parse(userJson);
      
      const rating = parseInt(document.getElementById("review-rating-value").value) || 5;
      const reviewText = document.getElementById("review-text").value.trim();
      
      if (!reviewText) return;

      const reviewObj = {
        userId: user.uid || user.email,
        userName: user.name || user.email.split("@")[0],
        userPhoto: user.photoURL,
        hotelId: selectedHotel.id,
        rating,
        reviewText
      };

      await addReview(reviewObj);
      alert("Thank you! Your review has been submitted successfully and is pending moderation.");
      reviewForm.reset();
      ratingInput.value = "5";
      starsContainer.querySelectorAll("i").forEach(s => s.style.color = "#FF9A02");
    });
  }

  // Checkout modal control exposed globally
  window.openCheckoutModal = function() {
    const modal = document.getElementById("checkout-modal");
    if (!modal) return;

    // Fill summary details
    const inDate = new Date(document.getElementById("checkin-input").value);
    const outDate = new Date(document.getElementById("checkout-input").value);
    let nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    if (isNaN(nights) || nights <= 0) nights = 1;
    const numRooms = parseInt(document.getElementById("guests-rooms").value.split(",")[1]) || 1;

    let baseRate = selectedHotel.price;
    let roomType = selectedHotel.name;
    const roomSelect = document.getElementById("booking-room-select");
    if (roomSelect && roomSelect.value) {
      const selectedOption = roomSelect.options[roomSelect.selectedIndex];
      baseRate = parseInt(selectedOption.dataset.price) || selectedHotel.price;
      roomType = selectedOption.text.split(" (")[0];
    }
    const taxRate = selectedHotel.tax || (baseRate * window.getGlobalTaxRate());
    let grandTotal = (baseRate + taxRate) * nights * numRooms;
    if (appliedCoupon) {
      grandTotal -= Math.floor(grandTotal * (appliedCoupon.discountPercent / 100));
    }

    document.getElementById("checkout-summary-hotel").innerText = selectedHotel.name;
    document.getElementById("checkout-summary-room").innerText = roomType;
    document.getElementById("checkout-summary-checkin").innerText = document.getElementById("checkin-input").value;
    document.getElementById("checkout-summary-checkout").innerText = document.getElementById("checkout-input").value;
    document.getElementById("checkout-summary-amount").innerText = `₹${grandTotal.toLocaleString("en-IN")}`;

    // Autofill guest details from logged in session
    const userJson = localStorage.getItem("hbooking_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      document.getElementById("checkout-guest-name").value = user.name || "";
      document.getElementById("checkout-guest-phone").value = user.phone || "";
      document.getElementById("checkout-guest-email").value = user.email || "";
    }

    // Reset card fields
    document.getElementById("checkout-payment-form").reset();
    document.getElementById("card-brand-icon").className = "far fa-credit-card";
    document.getElementById("card-brand-icon").style.color = "var(--text-secondary)";

    modal.classList.add("open");
  };

  window.closeCheckoutModal = function() {
    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.remove("open");
  };

  window.closeSuccessModal = function() {
    const modal = document.getElementById("booking-success-modal");
    if (modal) modal.classList.remove("open");
    window.location.reload();
  };

  // Credit Card formatting listeners
  const cardNumberInput = document.getElementById("checkout-card-number");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      let formattedValue = "";
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += " ";
        }
        formattedValue += value[i];
      }
      e.target.value = formattedValue;

      const icon = document.getElementById("card-brand-icon");
      if (value.startsWith("4")) {
        icon.className = "fab fa-cc-visa";
        icon.style.color = "#1A1F71";
      } else if (/^(5[1-5]|2[2-7])/.test(value)) {
        icon.className = "fab fa-cc-mastercard";
        icon.style.color = "#EB001B";
      } else if (/^(3[47])/.test(value)) {
        icon.className = "fab fa-cc-amex";
        icon.style.color = "#016FD0";
      } else {
        icon.className = "far fa-credit-card";
        icon.style.color = "var(--text-secondary)";
      }
    });
  }

  const cardExpiryInput = document.getElementById("checkout-card-expiry");
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 2) {
        e.target.value = value.slice(0, 2) + "/" + value.slice(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }

  const cardCvvInput = document.getElementById("checkout-card-cvv");
  if (cardCvvInput) {
    cardCvvInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
    });
  }

  // Submit action (WhatsApp Modal or Secure Online Checkout)
  document.getElementById("booking-submit-btn").addEventListener("click", () => {
    if (bookingMode === "whatsapp") {
      openBookingModal();
    } else {
      window.openCheckoutModal();
    }
  });

  // Modal actions
  document.getElementById("modal-close-btn").addEventListener("click", closeBookingModal);
  document.getElementById("whatsapp-booking-form").addEventListener("submit", submitWhatsAppBooking);

  // Submit secure credit card booking
  const checkoutPaymentForm = document.getElementById("checkout-payment-form");
  if (checkoutPaymentForm) {
    checkoutPaymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const cardNum = document.getElementById("checkout-card-number").value.replace(/\s+/g, "");
      const cardExp = document.getElementById("checkout-card-expiry").value;
      const cardCvv = document.getElementById("checkout-card-cvv").value;

      if (cardNum.length !== 16) {
        alert("Please enter a valid 16-digit credit card number.");
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
        alert("Please enter a valid expiry date in MM/YY format.");
        return;
      }

      const parts = cardExp.split("/");
      const month = parseInt(parts[0]);
      const year = parseInt("20" + parts[1]);
      if (month < 1 || month > 12) {
        alert("Expiry month must be between 01 and 12.");
        return;
      }

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        alert("Your card is expired.");
        return;
      }

      if (cardCvv.length !== 3) {
        alert("CVV must be 3 digits.");
        return;
      }

      // Show loader
      const loader = document.getElementById("checkout-loading");
      if (loader) loader.style.display = "flex";

      // Simulate payment processing delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get booking values
      const guestName = document.getElementById("checkout-guest-name").value;
      const guestPhone = document.getElementById("checkout-guest-phone").value;
      const guestEmail = document.getElementById("checkout-guest-email").value;
      const checkin = document.getElementById("checkin-input").value;
      const checkout = document.getElementById("checkout-input").value;
      const guestsRooms = document.getElementById("guests-rooms").value;

      const inDate = new Date(checkin);
      const outDate = new Date(checkout);
      let nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
      if (isNaN(nights) || nights <= 0) nights = 1;
      const numRooms = parseInt(guestsRooms.split(",")[1]) || 1;

      let baseRate = selectedHotel.price;
      let roomType = selectedHotel.name;
      let roomId = "";
      const roomSelect = document.getElementById("booking-room-select");
      if (roomSelect && roomSelect.value) {
        roomId = roomSelect.value;
        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        baseRate = parseInt(selectedOption.dataset.price) || selectedHotel.price;
        roomType = selectedOption.text.split(" (")[0];
      }

      // Live inventory validation
      if (roomId) {
        const roomsList = await getRooms();
        const activeRoom = roomsList.find(r => r.id === roomId);
        if (activeRoom) {
          if (activeRoom.inventory < numRooms || activeRoom.availability === "maintenance") {
            if (loader) loader.style.display = "none";
            alert("Not enough rooms available for the selected type!");
            return;
          }
          // Decrement room inventory
          const newInventory = activeRoom.inventory - numRooms;
          await updateRoom(roomId, {
            inventory: Math.max(0, newInventory),
            availability: newInventory <= 0 ? "booked" : "available"
          });
        }
      }

      const taxRate = selectedHotel.tax || (baseRate * window.getGlobalTaxRate());
      let grandTotal = (baseRate + taxRate) * nights * numRooms;
      if (appliedCoupon) {
        grandTotal -= Math.floor(grandTotal * (appliedCoupon.discountPercent / 100));
        await updateCoupon(appliedCoupon.code, {
          usageCount: (appliedCoupon.usageCount || 0) + 1
        });
      }

      const randNum = Math.floor(1000 + Math.random() * 9000);
      const yearStr = new Date().getFullYear();
      const bookingId = `BK-${yearStr}-${randNum}`;

      const userJson = localStorage.getItem("hbooking_user");
      const userId = userJson ? JSON.parse(userJson).uid || JSON.parse(userJson).email : "guest";

      const bookingObject = {
        bookingId: bookingId,
        guestName: guestName,
        guestPhone: guestPhone,
        guestEmail: guestEmail,
        userId: userId,
        hotelId: selectedHotel.id,
        hotelName: selectedHotel.name,
        roomId: roomId,
        roomType: roomType,
        checkIn: checkin,
        checkOut: checkout,
        guestsRooms: guestsRooms,
        amount: grandTotal,
        status: "Confirmed",
        specialRequests: "Online Checkout Booking",
        paymentStatus: "Paid",
        paymentMethod: "Credit Card",
        createdAt: new Date().toISOString()
      };

      await addBooking(bookingObject);

      // Hide loader and close modal
      if (loader) loader.style.display = "none";
      document.getElementById("checkout-modal").classList.remove("open");

      // Show success modal details
      document.getElementById("success-booking-id").innerText = bookingId;
      document.getElementById("success-hotel-name").innerText = selectedHotel.name;
      document.getElementById("success-room-type").innerText = roomType;
      document.getElementById("success-check-in").innerText = checkin;
      document.getElementById("success-check-out").innerText = checkout;
      document.getElementById("success-amount").innerText = `₹${grandTotal.toLocaleString("en-IN")}`;

      // Wire success actions
      document.getElementById("success-print-invoice-btn").onclick = () => {
        window.openInvoiceViewerModal(bookingId);
      };
      document.getElementById("success-view-bookings-btn").onclick = () => {
        document.getElementById("booking-success-modal").classList.remove("open");
        openMyBookingsModal();
      };

      // Open success modal
      document.getElementById("booking-success-modal").classList.add("open");
    });
  }

  async function refreshHotelLiveData() {
    const hotels = await getHotels();
    const updated = hotels.find((h) => h.id === hotelId);
    if (updated) selectedHotel = updated;

    const rooms = await getRooms();
    const hotelRooms = rooms.filter((r) => r.hotelId === selectedHotel.id && r.availability !== "maintenance");
    currentHotelRooms = hotelRooms;
    
    const roomSelect = document.getElementById("booking-room-select");
    let activeRoomId = "";
    if (roomSelect) {
      const prev = roomSelect.value;
      roomSelect.innerHTML = hotelRooms.length === 0
        ? `<option value="">No rooms available</option>`
        : hotelRooms.map((r) => `<option value="${r.id}" data-price="${r.price}">${r.type} (₹${r.price.toLocaleString("en-IN")}/night) - ${r.inventory} left</option>`).join("");
      if (hotelRooms.some((r) => r.id === prev)) {
        roomSelect.value = prev;
      } else if (hotelRooms.length > 0) {
        roomSelect.value = hotelRooms[0].id;
      }
      activeRoomId = roomSelect.value;
      calculatePricing();
    }

    // Re-render room cards with photos
    renderRoomCards(hotelRooms, activeRoomId);

    // Re-render similar hotels
    renderSimilarHotels();

    const hotelReviewsList = document.getElementById("hotel-reviews-list");
    if (hotelReviewsList) {
      const reviews = await getReviews();
      const approvedReviews = reviews.filter((r) => r.hotelId === selectedHotel.id && r.status === "approved");
      renderReviewsAndCalculateRating(approvedReviews);
    }
  }

  onDataChange((source) => {
    if (source === "rooms" || source === "reviews" || source === "hotels") {
      refreshHotelLiveData();
    }
  });
}

function getEstimatedGrandTotalBeforeCoupon() {
  const inDate = new Date(document.getElementById("checkin-input").value);
  const outDate = new Date(document.getElementById("checkout-input").value);
  let nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights <= 0) nights = 1;
  const numRooms = parseInt(document.getElementById("guests-rooms").value.split(",")[1]) || 1;
  let baseRate = selectedHotel.price;
  const roomSelect = document.getElementById("booking-room-select");
  if (roomSelect && roomSelect.value) {
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    baseRate = parseInt(selectedOption.dataset.price) || selectedHotel.price;
  }
  const taxRate = selectedHotel.tax || (baseRate * window.getGlobalTaxRate());
  return (baseRate + taxRate) * nights * numRooms;
}

function calculatePricing() {
  if (!selectedHotel) return;

  const inDate = new Date(document.getElementById("checkin-input").value);
  const outDate = new Date(document.getElementById("checkout-input").value);
  
  let nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights <= 0) nights = 1;

  const roomsVal = document.getElementById("guests-rooms").value;
  const numRooms = parseInt(roomsVal.split(",")[1]) || 1;

  let baseRate = selectedHotel.price;
  let roomName = selectedHotel.name;
  const roomSelect = document.getElementById("booking-room-select");
  if (roomSelect && roomSelect.value) {
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    baseRate = parseInt(selectedOption.dataset.price) || selectedHotel.price;
    roomName = selectedOption.text.split(" (")[0];
  }

  const taxRate = selectedHotel.tax || (baseRate * window.getGlobalTaxRate());
  
  const roomPriceTotal = baseRate * nights * numRooms;
  const taxTotal = taxRate * nights * numRooms;
  let grandTotal = roomPriceTotal + taxTotal;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (grandTotal >= (appliedCoupon.minBookingAmount || 0)) {
      discountAmount = Math.floor(grandTotal * (appliedCoupon.discountPercent / 100));
      grandTotal -= discountAmount;
    } else {
      appliedCoupon = null;
      const msg = document.getElementById("coupon-message");
      if (msg) {
        msg.innerText = `Coupon removed. Min spend required: ₹${appliedCoupon.minBookingAmount}`;
        msg.style.color = "#FF5A5F";
        msg.style.display = "block";
      }
    }
  }

  const costBreakdownContainer = document.querySelector(".booking-cost-breakdown");
  if (costBreakdownContainer) {
    let couponRowHtml = "";
    if (discountAmount > 0) {
      couponRowHtml = `
        <div class="cost-row" id="breakdown-coupon-row" style="color: #108569; font-weight: 600;">
          <span>Promo Discount (${appliedCoupon.code})</span>
          <span>- ₹${discountAmount.toLocaleString("en-IN")}</span>
        </div>
      `;
    }
    costBreakdownContainer.innerHTML = `
      <div class="cost-row">
        <span id="breakdown-nights">${roomName} (x${nights} nights, ${numRooms} room${numRooms > 1 ? 's' : ''})</span>
        <span id="breakdown-nights-cost">₹${roomPriceTotal.toLocaleString("en-IN")}</span>
      </div>
      <div class="cost-row">
        <span>Taxes & Fees</span>
        <span id="breakdown-tax-cost">₹${taxTotal.toLocaleString("en-IN")}</span>
      </div>
      ${couponRowHtml}
      <div class="cost-row total">
        <span>Estimated Total</span>
        <span id="breakdown-grand-total">₹${grandTotal.toLocaleString("en-IN")}</span>
      </div>
    `;
  }
  
  document.getElementById("booking-header-price").innerText = `₹${baseRate.toLocaleString("en-IN")}`;
  document.getElementById("booking-header-tax").innerText = `+ ₹${taxRate.toLocaleString("en-IN")} taxes & fees`;
  
  const stickyPriceDisplay = document.getElementById("sticky-price-display");
  if (stickyPriceDisplay) {
    stickyPriceDisplay.innerText = `₹${baseRate.toLocaleString("en-IN")}`;
  }
}

function openBookingModal() {
  const modal = document.getElementById("booking-modal");
  modal.classList.add("open");
}

function closeBookingModal() {
  const modal = document.getElementById("booking-modal");
  modal.classList.remove("open");
}

function showBookingToast(message) {
  let toast = document.getElementById("booking-toast-popup");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "booking-toast-popup";
    toast.style.cssText = "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#10B981;color:#fff;padding:14px 24px;border-radius:30px;font-size:14px;font-weight:600;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:opacity 0.4s;font-family:inherit;max-width:90vw;text-align:center;";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
}

async function submitWhatsAppBooking(e) {
  e.preventDefault();

  const name = document.getElementById("guest-name").value;
  const phone = document.getElementById("guest-phone").value;
  const requests = document.getElementById("guest-requests").value;

  const checkin = document.getElementById("checkin-input").value;
  const checkout = document.getElementById("checkout-input").value;
  const guestsRooms = document.getElementById("guests-rooms").value;

  const inDate = new Date(checkin);
  const outDate = new Date(checkout);
  let nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights <= 0) nights = 1;
  const numRooms = parseInt(guestsRooms.split(",")[1]) || 1;

  let baseRate = selectedHotel.price;
  let roomType = selectedHotel.name;
  let roomId = "";
  const roomSelect = document.getElementById("booking-room-select");
  if (roomSelect && roomSelect.value) {
    roomId = roomSelect.value;
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    baseRate = parseInt(selectedOption.dataset.price) || selectedHotel.price;
    roomType = selectedOption.text.split(" (")[0];
  }

  // Live availability verification
  if (roomId) {
    const roomsList = await getRooms();
    const activeRoom = roomsList.find(r => r.id === roomId);
    if (activeRoom) {
      if (activeRoom.inventory < numRooms || activeRoom.availability === "maintenance") {
        alert("Not enough rooms available for the selected type!");
        return;
      }
      // Decrement availability
      const newInventory = activeRoom.inventory - numRooms;
      const updatePatch = {
        inventory: Math.max(0, newInventory),
        availability: newInventory <= 0 ? "booked" : "available"
      };
      await updateRoom(roomId, updatePatch);
    }
  }

  const taxRate = selectedHotel.tax || (baseRate * window.getGlobalTaxRate());
  let grandTotal = (baseRate + taxRate) * nights * numRooms;
  if (appliedCoupon) {
    grandTotal -= Math.floor(grandTotal * (appliedCoupon.discountPercent / 100));
  }

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  const bookingId = `BK-${year}-${randNum}`;

  const userJson = localStorage.getItem("hbooking_user");
  const userId = userJson ? JSON.parse(userJson).uid || JSON.parse(userJson).email : "guest";

  const newBooking = {
    bookingId: bookingId,
    guestName: name,
    guestPhone: phone,
    userId: userId,
    hotelId: selectedHotel.id,
    hotelName: selectedHotel.name,
    roomId: roomId,
    roomType: roomType,
    checkIn: checkin,
    checkOut: checkout,
    guestsRooms: guestsRooms,
    amount: grandTotal,
    status: "Pending",
    specialRequests: requests || "None",
    paymentStatus: "Unpaid",
    paymentMethod: "WhatsApp Inquiry",
    createdAt: new Date().toISOString()
  };

  try {
    await addBooking(newBooking);
  } catch (err) {
    console.warn("Failed to log WhatsApp booking:", err);
  }

  const message = `Hello! I would like to book a stay at ${selectedHotel.name}.

Here are my booking details:
- *Guest Name*: ${name}
- *Contact*: ${phone}
- *Room*: ${roomType}
- *Check-in*: ${checkin}
- *Check-out*: ${checkout}
- *Guests & Rooms*: ${guestsRooms.split(",")[0]} Guests, ${numRooms} Room(s)
- *Special Requests*: ${requests || "None"}
- *Estimated Total*: ₹${grandTotal.toLocaleString("en-IN")} (taxes & coupon incl.)

Please confirm availability. Thank you!`;

  const urlEncodedText = encodeURIComponent(message);
  const cleanWaNumber = String(selectedHotel.whatsapp || "919876543210").replace(/\D/g, "");
  const waUrl = `https://api.whatsapp.com/send/?phone=${cleanWaNumber}&text=${urlEncodedText}`;

  closeBookingModal();
  document.getElementById("whatsapp-booking-form").reset();

  showBookingToast(`✅ Booking #${bookingId} created! Opening WhatsApp...`);
  setTimeout(() => window.open(waUrl, "_blank"), 600);
}

// -------------------------------------------------------------
// LOGIN / REGISTER PAGE CONTROLLER
// -------------------------------------------------------------
function initLoginPage() {
  const getRedirectUrl = (role) => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get("redirect");
    if (redirectParam) {
      return decodeURIComponent(redirectParam);
    }
    if (document.referrer && document.referrer.includes("hotel.html")) {
      return document.referrer;
    }
    return role === "admin" ? "/admin.html" : "/index.html";
  };

  // If user already logged in, redirect
  const existingUser = localStorage.getItem("hbooking_user");
  if (existingUser) {
    const u = JSON.parse(existingUser);
    window.location.href = getRedirectUrl(u.role);
    return;
  }

  // Check if URL has #register hash
  if (window.location.hash === "#register" && typeof window.switchAuthTab === "function") {
    window.switchAuthTab("register");
  }

  const msgBox = document.getElementById("auth-message");

  function showMsg(text, type = "error") {
    if (!msgBox) return;
    msgBox.style.display = "block";
    msgBox.innerText = text;
    if (type === "error") {
      msgBox.style.cssText = "display:block;background:rgba(220,53,69,0.1);color:#dc3545;border:1px solid rgba(220,53,69,0.25);padding:12px 14px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:16px;";
    } else {
      msgBox.style.cssText = "display:block;background:rgba(16,133,105,0.1);color:#108569;border:1px solid rgba(16,133,105,0.25);padding:12px 14px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:16px;";
    }
  }

  function setBtnLoading(btnId, loading, defaultHtml) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Please wait...' : defaultHtml;
  }

  // SIGN IN FORM
  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msgBox) msgBox.style.display = "none";
      const email = document.getElementById("signin-email").value.trim();
      const password = document.getElementById("signin-password").value;
      if (!email || !password) { showMsg("Please fill in all fields."); return; }
      setBtnLoading("signin-btn", true, '<i class="fas fa-sign-in-alt"></i> Sign In');
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const profile = await getUserByUid(user.uid);
        const role = (email === "directrajeev@gmail.com" || email === "admin@hotelsnearme.com" || profile?.role === "admin") ? "admin" : "user";
        const userData = {
          uid: user.uid || profile?.uid,
          name: profile?.name || user.displayName || email.split("@")[0],
          email: user.email || email,
          phone: profile?.phone || "",
          photoURL: profile?.photoURL || user.photoURL || "",
          role,
          status: "active"
        };
        localStorage.setItem("hbooking_session_type", "local");
        localStorage.setItem("hbooking_user", JSON.stringify(userData));
        showMsg("Welcome back! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = getRedirectUrl(role);
        }, 800);
      } catch (err) {
        setBtnLoading("signin-btn", false, '<i class="fas fa-sign-in-alt"></i> Sign In');
        showMsg(formatFirebaseError(err.code || err.message));
      }
    });
  }

  // REGISTER FORM
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msgBox) msgBox.style.display = "none";
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const phone = document.getElementById("reg-phone")?.value?.trim() || "";
      if (!name || !email || !password) { showMsg("Please fill in all required fields."); return; }
      if (password.length < 6) { showMsg("Password must be at least 6 characters."); return; }
      setBtnLoading("register-btn", true, '<i class="fas fa-user-plus"></i> Create Account');
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userData = {
          uid: user.uid,
          name,
          email,
          phone,
          photoURL: "",
          role: "user",
          status: "active"
        };
        await addUser({ ...userData, uid: user.uid });
        localStorage.setItem("hbooking_session_type", "local");
        localStorage.setItem("hbooking_user", JSON.stringify(userData));
        showMsg("Account created! Welcome to HotelsNearMeInKerala!", "success");
        setTimeout(() => { window.location.href = getRedirectUrl("user"); }, 900);
      } catch (err) {
        setBtnLoading("register-btn", false, '<i class="fas fa-user-plus"></i> Create Account');
        showMsg(formatFirebaseError(err.code || err.message));
      }
    });
  }

  // FORGOT PASSWORD FORM
  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msgBox) msgBox.style.display = "none";
      const email = document.getElementById("forgot-email").value.trim();
      if (!email) { showMsg("Please enter your email address."); return; }
      setBtnLoading("forgot-btn", true, '<i class="fas fa-paper-plane"></i> Send Reset Link');
      try {
        await sendPasswordResetEmail(auth, email);
        showMsg("If an account exists with that email, a reset link has been sent.", "success");
        setBtnLoading("forgot-btn", false, '<i class="fas fa-paper-plane"></i> Send Reset Link');
      } catch (err) {
        setBtnLoading("forgot-btn", false, '<i class="fas fa-paper-plane"></i> Send Reset Link');
        showMsg(formatFirebaseError(err.code || err.message));
      }
    });
  }

  // ADMIN ACCESS FORM
  const adminForm = document.getElementById("admin-form");
  if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msgBox) msgBox.style.display = "none";
      const email = document.getElementById("admin-email").value.trim();
      const password = document.getElementById("admin-password").value;
      if (!email || !password) { showMsg("Please enter admin email and password."); return; }
      setBtnLoading("admin-btn", true, '<i class="fas fa-unlock-alt"></i> Access Admin Dashboard');
      try {
        // Authenticate using Firebase Auth directly
        const result = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = result.user;

        // Fetch user profile from Supabase to check role
        const profile = await getUserByUid(firebaseUser.uid);
        const role = (email === "directrajeev@gmail.com" || email === "admin@hotelsnearme.com" || profile?.role === "admin") ? "admin" : "user";

        if (role !== "admin") {
          // Sign out immediately if role is not admin
          await signOut(auth);
          setBtnLoading("admin-btn", false, '<i class="fas fa-unlock-alt"></i> Access Admin Dashboard');
          showMsg("Access denied. This account does not have admin privileges.");
          return;
        }

        const userData = {
          uid: firebaseUser.uid,
          name: profile?.name || firebaseUser.displayName || "Admin",
          email: firebaseUser.email,
          phone: profile?.phone || "",
          photoURL: profile?.photoURL || firebaseUser.photoURL || "",
          role: "admin",
          status: "active"
        };

        // Sync admin user profile in Supabase
        await addUser(userData);

        localStorage.setItem("hbooking_session_type", "local");
        localStorage.setItem("hbooking_user", JSON.stringify(userData));

        showMsg("Admin access granted! Redirecting...", "success");
        setTimeout(() => { window.location.href = "/admin.html"; }, 800);
      } catch (err) {
        setBtnLoading("admin-btn", false, '<i class="fas fa-unlock-alt"></i> Access Admin Dashboard');
        console.error("Admin Auth Error:", err);
        showMsg(formatFirebaseError(err.code || err.message));
      }
    });
  }

  // Expose switchAuthTab globally for the inline HTML onclick calls
  window.switchAuthTab = function(tab) {
    document.querySelectorAll(".auth-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
    document.getElementById("panel-" + tab)?.classList.add("active");
    if (tab === "signin") document.getElementById("tab-signin")?.classList.add("active");
    if (tab === "register") document.getElementById("tab-register")?.classList.add("active");
    if (msgBox) msgBox.style.display = "none";
  };

  window.togglePw = function(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    icon.className = input.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
  };

  window.handleGoogleSignIn = async function() {
    try {
      showMsg("Connecting with Google...", "success");
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const u = result.user;
      const userData = {
        uid: u.uid,
        name: u.displayName || u.email.split("@")[0],
        email: u.email,
        phone: "",
        photoURL: u.photoURL || "",
        role: "user",
        status: "active"
      };
      await addUser(userData);
      localStorage.setItem("hbooking_session_type", "local");
      localStorage.setItem("hbooking_user", JSON.stringify(userData));
      showMsg("Signed in successfully! Redirecting...", "success");
      setTimeout(() => { window.location.href = getRedirectUrl("user"); }, 800);
    } catch (err) {
      showMsg(formatFirebaseError(err.code || err.message));
    }
  };

  // Handle hash navigation to register tab
  if (window.location.hash === "#register") {
    window.switchAuthTab("register");
  }
}

// -------------------------------------------------------------
// BOOKINGS PAGE CONTROLLER
// -------------------------------------------------------------
async function initBookingsPage() {
  const listEl = document.getElementById("bookings-list");
  if (!listEl) return;

  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) { window.location.href = "/login.html"; return; }
  const user = JSON.parse(userJson);

  setupHeaderAuth();

  let allBookings = [];
  let currentFilter = "all";

  async function loadBookings() {
    try {
      const bookings = await getBookings();
      const userKey = user.uid || user.email;
      const userName = (user.name || "").toLowerCase();

      allBookings = bookings.filter(b => {
        const bookingName = (b.guestName || b.userName || "").toLowerCase();
        return b.userId === userKey ||
          b.userEmail === user.email ||
          (userName && bookingName && bookingName === userName) ||
          (user.phone && b.guestPhone === user.phone) ||
          (user.phone && b.userPhone === user.phone);
      });

      updateStats(allBookings);
      renderBookings(allBookings, currentFilter);
    } catch (err) {
      listEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary);"><i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:12px;"></i><p>Failed to load bookings. Please refresh the page.</p></div>`;
    }
  }

  function updateStats(bookings) {
    const confirmed = bookings.filter(b => b.status === "Confirmed" || b.status === "Checked In" || b.status === "Completed").length;
    const pending = bookings.filter(b => b.status === "Pending").length;
    const total = bookings.reduce((sum, b) => sum + (b.amount || b.totalPrice || 0), 0);
    document.getElementById("stat-total").innerText = bookings.length;
    document.getElementById("stat-confirmed").innerText = confirmed;
    document.getElementById("stat-pending").innerText = pending;
    document.getElementById("stat-amount").innerText = `₹${total.toLocaleString("en-IN")}`;
  }

  function renderBookings(bookings, filter) {
    const filtered = filter === "all" ? bookings : bookings.filter(b => b.status?.toLowerCase() === filter);

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="bookings-empty">
          <i class="fas fa-calendar-times"></i>
          <h3>${filter === "all" ? "No bookings yet" : `No ${filter} bookings`}</h3>
          <p>${filter === "all" ? "Book your first stay in Kerala and it will appear here." : `You have no ${filter} bookings right now.`}</p>
          <a href="/index.html" class="btn btn-primary" style="border-radius:30px;">Explore Hotels</a>
        </div>`;
      return;
    }

    listEl.innerHTML = filtered.map(b => {
      const statusClass = (b.status || "pending").toLowerCase().replace(" ", "-");
      const nights = b.checkIn && b.checkOut
        ? Math.max(1, Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000*60*60*24)))
        : 1;
      const canCancel = b.status === "Confirmed" || b.status === "Pending";
      return `
        <div class="booking-card">
          <img src="/assets/images/${b.hotelId?.split('_')[0] || 'riverside'}.webp"
            class="booking-card-img"
            onerror="this.src='https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=200&q=80'"
            alt="${b.hotelName}">
          <div class="booking-card-body">
            <h3>${b.hotelName || "Hotel"}</h3>
            <div class="booking-card-meta">
              <span><i class="fas fa-map-marker-alt"></i> Kerala, India</span>
              <span><i class="fas fa-sign-in-alt"></i> Check-in: ${b.checkIn || "-"}</span>
              <span><i class="fas fa-sign-out-alt"></i> Check-out: ${b.checkOut || "-"}</span>
              <span><i class="fas fa-moon"></i> ${nights} night${nights > 1 ? "s" : ""}</span>
              ${b.roomType ? `<span><i class="fas fa-door-open"></i> ${b.roomType}</span>` : ""}
            </div>
            <span class="booking-card-id">Booking ID: #${b.bookingId}</span>
          </div>
          <div class="booking-card-actions">
            <div>
              <div class="booking-card-amount">₹${(b.amount || b.totalPrice || 0).toLocaleString("en-IN")}</div>
              <div style="font-size:11px;color:var(--text-secondary);text-align:right;">total paid</div>
            </div>
            <span class="status-pill ${statusClass}">${b.status || "Pending"}</span>
            ${canCancel ? `<button class="btn btn-outline btn-sm" style="border-color:#dc3545;color:#dc3545;border-radius:20px;padding:6px 14px;font-size:12px;" onclick="cancelBookingFromPage('${b.bookingId}')">Cancel</button>` : ""}
          </div>
        </div>`;
    }).join("");
  }

  // Filter tab clicks
  document.querySelectorAll(".booking-filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".booking-filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderBookings(allBookings, currentFilter);
    });
  });

  window.cancelBookingFromPage = async function(bookingId) {
    if (confirm(`Are you sure you want to cancel booking #${bookingId}? This action cannot be undone.`)) {
      await updateBookingStatus(bookingId, { status: "Cancelled", paymentStatus: "Refunded" });
      await loadBookings();
    }
  };

  await loadBookings();
}

function formatFirebaseError(code) {
  const messages = {
    "auth/user-not-found": "No account found with this email. Please register first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please check and try again.",
    "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
  };
  return messages[code] || `Authentication error: ${code}`;
}


// -------------------------------------------------------------
// ADMIN DASHBOARD CONTROLLER
// -------------------------------------------------------------
// Global admin database state variables
let localHotels = [];
let localBookings = [];
let localRooms = [];
let localUsers = [];
let localReviews = [];
let localCoupons = [];
let localAuditLogs = [];
let localSystemUsers = [];
let cachedSeo = null;
let cachedSettings = null;

async function refreshAdminData() {
  localHotels = await getHotels();
  localBookings = await getBookings();
  localRooms = await getRooms();
  localUsers = await getUsers();
  localReviews = await getReviews();
  localCoupons = await getCoupons();
  localAuditLogs = await getAuditLogs();
  localSystemUsers = await getSystemUsers();
  cachedSeo = await getSeo();
  cachedSettings = await getSettings();

  // Populate HTML dropdown select menus dynamically
  populateHotelDropdowns();

  // Populate Dashboard Metrics
  calculateDashboardMetrics(localHotels, localBookings);

  // Draw Dashboard SVG Charts
  drawSVGCharts(localBookings);

  // Render recent bookings on dashboard
  renderBookingsTable(localBookings);

  // Render top performing hotels on dashboard
  renderTopHotels(localHotels, localBookings);

  // Update active tab table rendering
  const activeLi = document.querySelector(".sidebar-menu li.active");
  const activeTab = activeLi ? activeLi.dataset.tab : "dashboard";
  triggerTabRender(activeTab);
}

function populateHotelDropdowns() {
  const filterRoomsHotel = document.getElementById("filter-rooms-hotel");
  const addRoomHotelSelect = document.getElementById("add-room-hotel-select");
  const bookingHotelSelect = document.getElementById("booking-hotel-select");

  const hotelOptions = localHotels.map(h => `<option value="${h.id}">${h.name}</option>`).join("");

  if (filterRoomsHotel) {
    const prev = filterRoomsHotel.value;
    filterRoomsHotel.innerHTML = `<option value="">All Hotels</option>` + hotelOptions;
    filterRoomsHotel.value = prev;
  }
  if (addRoomHotelSelect) {
    addRoomHotelSelect.innerHTML = `<option value="">Select Hotel...</option>` + hotelOptions;
  }
  if (bookingHotelSelect) {
    bookingHotelSelect.innerHTML = `<option value="">Select Hotel...</option>` + hotelOptions;
  }
}

function triggerTabRender(tabId) {
  if (tabId === "hotels") { if (typeof window.renderAdminHotelsTable === "function") window.renderAdminHotelsTable(); }
  else if (tabId === "rooms") { if (typeof window.renderAdminRoomsTable === "function") window.renderAdminRoomsTable(); }
  else if (tabId === "bookings") { if (typeof window.renderAdminBookingsTable === "function") window.renderAdminBookingsTable(); }
  else if (tabId === "users") { if (typeof window.renderAdminUsersTable === "function") window.renderAdminUsersTable(); }
  else if (tabId === "reviews") { if (typeof window.renderAdminReviewsTable === "function") window.renderAdminReviewsTable(); }
  else if (tabId === "offers") { if (typeof window.renderAdminCouponsTable === "function") window.renderAdminCouponsTable(); }
  else if (tabId === "payments") {
    if (typeof window.renderAdminPaymentsTable === "function") window.renderAdminPaymentsTable();
    if (typeof window.renderGatewaySettingsForm === "function") window.renderGatewaySettingsForm();
  }
  else if (tabId === "reports") {
    if (typeof window.renderDistrictPerformance === "function") window.renderDistrictPerformance();
  }
  else if (tabId === "audit-logs") { if (typeof window.renderAdminAuditLogsTable === "function") window.renderAdminAuditLogsTable(); }
  else if (tabId === "seo") { if (typeof window.renderAdminSEOTab === "function") window.renderAdminSEOTab(); }
  else if (tabId === "settings") { if (typeof window.renderAdminSettingsTab === "function") window.renderAdminSettingsTab(); }
  else if (tabId === "system-users") { if (typeof window.renderAdminSystemUsersTable === "function") window.renderAdminSystemUsersTable(); }
}

async function initAdminPage() {
  const localUserJson = localStorage.getItem("hbooking_user");
  const localUser = localUserJson ? JSON.parse(localUserJson) : null;
  const isLocalSession = localStorage.getItem("hbooking_session_type") === "local";

  let user = null;
  if (isLocalSession && localUser) {
    user = localUser;
  } else {
    const firebaseUser = await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
    });

    if (!firebaseUser) {
      window.location.href = "/login.html";
      return;
    }

    user = await syncUserSession(firebaseUser);
  }

  if (user.role !== "admin") {
    window.location.href = "/index.html";
    return;
  }

  document.getElementById("admin-profile-name").innerText = user.name || user.email.split('@')[0];

  await refreshAdminData();

  onDataChange(() => {
    refreshAdminData();
  });

  // Sidebar Menu Tab switching listeners
  const menuItems = document.querySelectorAll(".sidebar-menu li[data-tab]");
  menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;
      window.switchAdminTab(tabId);
    });
  });

  // Mobile menu sidebar toggler
  const toggleSidebarBtn = document.querySelector(".sidebar-toggle");
  const adminSidebar = document.querySelector(".admin-sidebar");
  if (toggleSidebarBtn && adminSidebar) {
    toggleSidebarBtn.addEventListener("click", () => {
      adminSidebar.classList.toggle("open");
    });
  }

  // Global Header Search Listener
  const globalSearchInput = document.querySelector(".admin-search input");
  if (globalSearchInput) {
    globalSearchInput.addEventListener("input", () => {
      const query = globalSearchInput.value.toLowerCase().trim();
      
      const activeLi = document.querySelector(".sidebar-menu li.active");
      const activeTab = activeLi ? activeLi.dataset.tab : "dashboard";
      
      if (!query) {
        triggerTabRender(activeTab);
        return;
      }

      if (activeTab === "hotels") {
        const filtered = localHotels.filter(h => h.name.toLowerCase().includes(query) || h.location.toLowerCase().includes(query) || h.category.toLowerCase().includes(query));
        renderHotelsTableData(filtered);
      } else if (activeTab === "rooms") {
        const filtered = localRooms.filter(r => r.type.toLowerCase().includes(query) || r.roomNumber.includes(query) || (r.hotelName && r.hotelName.toLowerCase().includes(query)));
        renderRoomsTableData(filtered);
        window.renderRoomsTableData(filtered);
      } else if (activeTab === "bookings") {
        const filtered = localBookings.filter(b => b.bookingId.toLowerCase().includes(query) || b.guestName.toLowerCase().includes(query) || b.guestPhone.includes(query));
        window.renderBookingsTableData(filtered);
      } else if (activeTab === "users") {
        const filtered = localUsers.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
        window.renderUsersTableData(filtered);
      }
    });
  }

  // Logout listener
  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      localStorage.removeItem("hbooking_user");
      localStorage.removeItem("hbooking_session_type");
      if (auth) {
        try {
          await signOut(auth);
        } catch (err) {
          console.warn("Firebase SignOut error:", err);
        }
      }
      window.location.href = "/login.html";
    });
  }

  // Forms Submissions Listeners
  // Add Hotel Form
  const hotelForm = document.getElementById("add-hotel-form");
  if (hotelForm) {
    hotelForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("new-hotel-name").value;
      const district = document.getElementById("new-hotel-district").value;
      const price = parseInt(document.getElementById("new-hotel-price").value) || 2999;
      const category = document.getElementById("new-hotel-category").value;
      const imageUrl = document.getElementById("new-hotel-image")?.value?.trim() || "/assets/images/riverside.webp";
      const whatsapp = document.getElementById("new-hotel-whatsapp")?.value?.trim() || "919876543210";
      const description = document.getElementById("new-hotel-description")?.value?.trim() || `${name} is a premium hotel in ${district}, Kerala offering excellent service and stays.`;
      const checkInTime = document.getElementById("new-hotel-checkin")?.value?.trim() || "12:00 PM";
      const checkOutTime = document.getElementById("new-hotel-checkout")?.value?.trim() || "11:00 AM";
      const featured = document.getElementById("new-hotel-featured")?.checked || false;
      const trending = document.getElementById("new-hotel-trending")?.checked || false;
      const mapUrl = document.getElementById("new-hotel-map")?.value?.trim() || "";
      
      // Collect extra gallery images
      const extraImages = [
        document.getElementById("new-hotel-img2")?.value?.trim(),
        document.getElementById("new-hotel-img3")?.value?.trim(),
        document.getElementById("new-hotel-img4")?.value?.trim(),
        document.getElementById("new-hotel-img5")?.value?.trim()
      ].filter(Boolean);
      
      // Collect checked amenities
      const selectedAmenities = Array.from(hotelForm.querySelectorAll('input[name="amenity"]:checked')).map(el => el.value);

      const newId = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();

      // Collect room type entries
      const roomEntries = hotelForm.querySelectorAll(".room-type-entry");
      const roomsToAdd = [];
      let totalInventory = 0;
      roomEntries.forEach((entry, idx) => {
        const rtName = entry.querySelector('input[name="rt-name"]').value.trim();
        const rtPrice = parseInt(entry.querySelector('input[name="rt-price"]').value) || price;
        const rtCapacity = parseInt(entry.querySelector('input[name="rt-capacity"]').value) || 2;
        const rtBeds = parseInt(entry.querySelector('input[name="rt-beds"]').value) || 1;
        const rtInventory = parseInt(entry.querySelector('input[name="rt-inventory"]').value) || 5;

        if (rtName) {
          totalInventory += rtInventory;
          roomsToAdd.push({
            id: `rm_${newId}_${idx}_${Date.now()}`,
            hotelId: newId,
            hotelName: name,
            roomNumber: `${101 + idx}`,
            type: rtName,
            price: rtPrice,
            capacity: rtCapacity,
            beds: rtBeds,
            inventory: rtInventory,
            availability: "available",
            amenities: ["Free Wi-Fi", "Air Conditioning", "TV"]
          });
        }
      });

      let startingPrice = price;
      if (roomsToAdd.length > 0) {
        startingPrice = Math.min(...roomsToAdd.map(r => r.price));
      }

      const newHotelObj = {
        id: newId,
        name: name,
        location: `${district}, Kerala`,
        district: district,
        category: category,
        rating: 4.5,
        reviewsCount: 0,
        price: startingPrice,
        tax: Math.floor(startingPrice * window.getGlobalTaxRate()),
        image: imageUrl,
        images: extraImages,
        mapUrl: mapUrl,
        whatsapp: whatsapp,
        badge: "Newly Added",
        description: description,
        amenities: selectedAmenities,
        highlights: [{ title: "New Resort", desc: "Top quality facilities freshly set up" }],
        details: { checkIn: checkInTime, checkOut: checkOutTime, propertyType: "Hotel", roomCount: totalInventory || 10, starRating: "4 Star", languages: "English, Malayalam", station: "Station nearby", airport: "Airport nearby" },
        nearby: [],
        featured: featured,
        trending: trending,
        status: "active"
      };

      await addHotel(newHotelObj);

      // Add all rooms
      for (const roomObj of roomsToAdd) {
        await addRoom(roomObj);
      }

      window.closeAddHotelModal();
      hotelForm.reset();
      showAdminToast(`✅ "${name}" has been published to the website!`, "success");

      // Reset dynamic room rows container back to a single row
      const container = document.getElementById("room-types-container");
      if (container) {
        container.innerHTML = `
          <div class="room-type-entry" style="background:var(--light); border-radius:8px; padding:12px; margin-bottom:10px; border:1px solid var(--border);">
            <div class="form-row">
              <div class="form-group">
                <label>Room Type Name *</label>
                <input type="text" name="rt-name" placeholder="e.g. Deluxe Room, Suite" required>
              </div>
              <div class="form-group">
                <label>Price / Night (₹) *</label>
                <input type="number" name="rt-price" placeholder="e.g. 3500" min="100" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Capacity (Guests) *</label>
                <input type="number" name="rt-capacity" placeholder="2" value="2" min="1" required>
              </div>
              <div class="form-group">
                <label>Beds *</label>
                <input type="number" name="rt-beds" placeholder="1" value="1" min="1" required>
              </div>
            </div>
            <div class="form-group">
              <label>Available Rooms (Inventory) *</label>
              <input type="number" name="rt-inventory" placeholder="5" value="5" min="1" required>
            </div>
          </div>
        `;
      }

      await refreshAdminData();
    });
  }

  // Edit Hotel Form
  const editHotelForm = document.getElementById("edit-hotel-form");
  if (editHotelForm) {
    editHotelForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hotelId = document.getElementById("edit-hotel-id").value;
      const name = document.getElementById("edit-hotel-name").value;
      const price = parseInt(document.getElementById("edit-hotel-price").value) || 2999;
      const status = document.getElementById("edit-hotel-status").value;
      const featured = document.getElementById("edit-hotel-featured").checked;
      const imageUrl = document.getElementById("edit-hotel-image")?.value?.trim();
      const whatsapp = document.getElementById("edit-hotel-whatsapp")?.value?.trim();
      const mapUrl = document.getElementById("edit-hotel-map")?.value?.trim();

      // Collect extra gallery images
      const extraImages = [
        document.getElementById("edit-hotel-img2")?.value?.trim(),
        document.getElementById("edit-hotel-img3")?.value?.trim(),
        document.getElementById("edit-hotel-img4")?.value?.trim(),
        document.getElementById("edit-hotel-img5")?.value?.trim()
      ].filter(Boolean);

      const updates = {
        name,
        price,
        status,
        featured,
        tax: Math.floor(price * window.getGlobalTaxRate())
      };
      if (imageUrl) updates.image = imageUrl;
      if (whatsapp) updates.whatsapp = whatsapp;
      if (mapUrl !== undefined) updates.mapUrl = mapUrl;
      if (extraImages.length > 0) updates.images = extraImages;

      await updateHotel(hotelId, updates);
      window.closeEditHotelModal();
      editHotelForm.reset();
      showAdminToast(`✅ "${name}" updated and live on the website!`, "success");
      await refreshAdminData();
    });
  }


  // Add Room Form
  const addRoomForm = document.getElementById("add-room-form");
  if (addRoomForm) {
    addRoomForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hotelId = document.getElementById("add-room-hotel-select").value;
      const roomNumber = document.getElementById("add-room-number").value;
      const price = parseInt(document.getElementById("add-room-price").value) || 2999;
      const type = document.getElementById("add-room-type").value;
      const capacity = parseInt(document.getElementById("add-room-capacity").value) || 2;
      const beds = parseInt(document.getElementById("add-room-beds").value) || 1;
      const inventory = parseInt(document.getElementById("add-room-inventory").value) || 5;

      const hotelObj = localHotels.find(h => h.id === hotelId);
      const hotelName = hotelObj ? hotelObj.name : hotelId;

      const newRoomObj = {
        id: `rm_${hotelId}_${roomNumber}_${Date.now()}`,
        hotelId,
        hotelName,
        roomNumber,
        type,
        price,
        capacity,
        beds,
        inventory,
        availability: "available",
        amenities: ["Free Wi-Fi", "Air Conditioning", "TV"]
      };

      await addRoom(newRoomObj);
      alert("Room Config Added Successfully!");
      window.closeAddRoomModal();
      addRoomForm.reset();
      await refreshAdminData();
    });
  }

  // Manual Booking Hotel Change
  const bookingHotelSelect = document.getElementById("booking-hotel-select");
  const bookingRoomSelectAdmin = document.getElementById("booking-room-select-admin");
  if (bookingHotelSelect && bookingRoomSelectAdmin) {
    bookingHotelSelect.addEventListener("change", () => {
      const hotelId = bookingHotelSelect.value;
      const hotelRooms = localRooms.filter(r => r.hotelId === hotelId && r.availability === "available");
      if (hotelRooms.length === 0) {
        bookingRoomSelectAdmin.innerHTML = `<option value="">No rooms available</option>`;
      } else {
        bookingRoomSelectAdmin.innerHTML = hotelRooms.map(r => `
          <option value="${r.id}" data-price="${r.price}">${r.type} (Room #${r.roomNumber}) - ₹${r.price}/night</option>
        `).join("");
      }
    });
  }

  // Manual Booking Form
  const manualBookingForm = document.getElementById("manual-booking-form");
  if (manualBookingForm) {
    manualBookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hotelId = document.getElementById("booking-hotel-select").value;
      const roomId = document.getElementById("booking-room-select-admin").value;
      const name = document.getElementById("booking-guest-name").value;
      const phone = document.getElementById("booking-guest-phone").value;
      const checkin = document.getElementById("booking-checkin").value;
      const checkout = document.getElementById("booking-checkout").value;

      const hotelObj = localHotels.find(h => h.id === hotelId);
      const roomObj = localRooms.find(r => r.id === roomId);
      
      if (!hotelObj || !roomObj) {
        alert("Please select both a valid Hotel and an available Room type.");
        return;
      }

      if (roomObj.inventory <= 0) {
        alert("This room config has no vacancy left!");
        return;
      }

      // Decrement inventory
      await updateRoom(roomId, {
        inventory: Math.max(0, roomObj.inventory - 1),
        availability: roomObj.inventory - 1 <= 0 ? "booked" : "available"
      });

      const inDate = new Date(checkin);
      const outDate = new Date(checkout);
      let nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
      if (isNaN(nights) || nights <= 0) nights = 1;

      const taxRate = hotelObj.tax || Math.floor(roomObj.price * window.getGlobalTaxRate());
      const grandTotal = (roomObj.price + taxRate) * nights;

      const year = new Date().getFullYear();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const bookingId = `BK-${year}-${randNum}`;

      const newBooking = {
        bookingId: bookingId,
        guestName: name,
        guestPhone: phone,
        userId: "admin_manual",
        hotelId: hotelId,
        hotelName: hotelObj.name,
        roomId: roomId,
        roomType: roomObj.type,
        checkIn: checkin,
        checkOut: checkout,
        guestsRooms: `2 Guests, 1 Room`,
        amount: grandTotal,
        status: "Confirmed",
        specialRequests: "Manually registered by Staff",
        paymentStatus: "Paid",
        paymentMethod: "WhatsApp",
        createdAt: new Date().toISOString()
      };

      await addBooking(newBooking);
      alert(`Booking Created successfully!\nBooking Code: #${bookingId}`);
      window.closeManualBookingModal();
      manualBookingForm.reset();
      await refreshAdminData();
    });
  }

  // Create Coupon Form
  const addCouponForm = document.getElementById("add-coupon-form");
  if (addCouponForm) {
    addCouponForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = document.getElementById("new-coupon-code").value.trim().toUpperCase();
      const discountPercent = parseInt(document.getElementById("new-coupon-pct").value) || 10;
      const minBookingAmount = parseInt(document.getElementById("new-coupon-min").value) || 0;
      const usageLimit = parseInt(document.getElementById("new-coupon-limit").value) || 100;
      const expiryDate = document.getElementById("new-coupon-expiry").value;

      const newCoupon = {
        code,
        discountPercent,
        expiryDate,
        usageLimit,
        usageCount: 0,
        minBookingAmount,
        status: "active"
      };

      await addCoupon(newCoupon);
      alert("Coupon Published successfully!");
      window.closeAddCouponModal();
      addCouponForm.reset();
      await refreshAdminData();
    });
  }

  // Review Reply Form
  const reviewReplyForm = document.getElementById("review-reply-form");
  if (reviewReplyForm) {
    reviewReplyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const reviewId = document.getElementById("reply-review-id").value;
      const replyText = document.getElementById("reply-manager-text").value.trim();

      await replyToReview(reviewId, replyText);
      alert("Official reply posted!");
      window.closeReviewReplyModal();
      reviewReplyForm.reset();
      await refreshAdminData();
    });
  }

  // Open Add System User Modal
  window.openAddSystemUserModal = function() {
    const modal = document.getElementById("add-system-user-modal");
    if (modal) modal.classList.add("open");
  };
  
  // Close Add System User Modal
  window.closeAddSystemUserModal = function() {
    const modal = document.getElementById("add-system-user-modal");
    if (modal) modal.classList.remove("open");
  };

  // Add System User Form submit
  const addSysUserForm = document.getElementById("add-system-user-form");
  if (addSysUserForm) {
    addSysUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("new-sys-email").value.trim();
      const name = document.getElementById("new-sys-name").value.trim();
      const role = document.getElementById("new-sys-role").value;
      const permissions = document.getElementById("new-sys-permissions").value.trim();

      if (localSystemUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert("A system user with this email address already exists.");
        return;
      }

      await addSystemUser({ email, name, role, permissions, status: "Active" });
      alert("System Administrative User added successfully!");
      window.closeAddSystemUserModal();
      addSysUserForm.reset();
      await refreshAdminData();
    });
  }

  // SEO Editor Form submit
  const seoForm = document.getElementById("seo-editor-form");
  if (seoForm) {
    seoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const heroTitle = document.getElementById("seo-hero-title").value.trim();
      const heroSubtext = document.getElementById("seo-hero-subtext").value.trim();
      const trustBadge = document.getElementById("seo-trust-badge").value.trim();

      await saveSeo({ heroTitle, heroSubtext, trustBadge });
      alert("Homepage banner details published successfully!");
      await refreshAdminData();
    });
  }

  // Settings Editor Form submit
  const settingsForm = document.getElementById("settings-editor-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const platformName = document.getElementById("settings-platform-name").value.trim();
      const taxRate = parseInt(document.getElementById("settings-tax-rate").value) || 18;
      const logoUrl = document.getElementById("settings-logo-url").value.trim();
      const notifyEmail = document.getElementById("settings-notify-email").checked;
      const notifyWhatsapp = document.getElementById("settings-notify-whatsapp").checked;
      const enableSound = document.getElementById("settings-enable-sound").checked;

      await saveSettings({
        platformName,
        taxRate,
        logoUrl,
        notifyEmail,
        notifyWhatsapp,
        enableSound
      });
      alert("System administrative settings saved successfully!");
      await refreshAdminData();
    });
  }

  const gatewayForm = document.getElementById("gateway-settings-form");
  if (gatewayForm) {
    gatewayForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currency = document.getElementById("gateway-currency").value;
      const whatsappNumber = document.getElementById("gateway-whatsapp").value.trim();
      const autoInvoice = document.getElementById("gateway-auto-invoice").value === "yes";
      await saveGatewaySettings({ currency, whatsappNumber, autoInvoice });
      alert("Payment gateway settings saved successfully!");
      await refreshAdminData();
    });
  }
}

// -------------------------------------------------------------
// TAB SWITCHING & RENDERING UTILITIES
// -------------------------------------------------------------
window.switchAdminTab = function(tabId) {
  const tabs = document.querySelectorAll(".admin-tab-content");
  tabs.forEach(t => t.style.display = "none");

  const targetTab = document.getElementById(`tab-${targetTabMap(tabId)}`);
  if (targetTab) {
    targetTab.style.display = "block";
  }

  // Update active class in sidebar menu
  const menuItems = document.querySelectorAll(".sidebar-menu li[data-tab]");
  menuItems.forEach(item => {
    if (item.dataset.tab === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Call render function
  triggerTabRender(tabId);
};

// Help map sidebar names to DOM IDs if discrepancies exist
function targetTabMap(id) {
  const maps = {
    "offers": "offers",
    "system-users": "system-users",
    "audit-logs": "audit-logs",
    "ai-assistant": "ai-assistant"
  };
  return maps[id] || id;
}
// -------------------------------------------------------------
// MODALS ACTIONS
// -------------------------------------------------------------
window.addRoomTypeRow = function() {
  const container = document.getElementById("room-types-container");
  if (!container) return;
  const newRow = document.createElement("div");
  newRow.className = "room-type-entry";
  newRow.style.cssText = "background:var(--light); border-radius:8px; padding:12px; margin-bottom:10px; border:1px solid var(--border); position:relative;";
  newRow.innerHTML = `
    <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:8px; right:8px; background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:16px; font-weight:bold;">&times;</button>
    <div class="form-row">
      <div class="form-group">
        <label>Room Type Name *</label>
        <input type="text" name="rt-name" placeholder="e.g. Deluxe Room, Suite" required>
      </div>
      <div class="form-group">
        <label>Price / Night (₹) *</label>
        <input type="number" name="rt-price" placeholder="e.g. 3500" required min="100">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Capacity (Guests) *</label>
        <input type="number" name="rt-capacity" placeholder="2" value="2" min="1" required>
      </div>
      <div class="form-group">
        <label>Beds *</label>
        <input type="number" name="rt-beds" placeholder="1" value="1" min="1" required>
      </div>
    </div>
    <div class="form-group">
      <label>Available Rooms (Inventory) *</label>
      <input type="number" name="rt-inventory" placeholder="5" value="5" min="1" required>
    </div>
  `;
  container.appendChild(newRow);
};

window.submitAddHotelForm = function() {
  const form = document.getElementById("add-hotel-form");
  if (form) {
    form.requestSubmit();
  }
};

async function cldUploadFile(file) {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expire = Math.floor(Date.now() / 1000) + 600;
  const privateKey = "private_zNX0vX0xb1UzPkWlT+HkesDfWvY=";
  const publicKey = "public_c9MwnySW1ayJ5/b6dNbvL6JfIFU=";
  
  const signature = await generateImageKitSignature(token, expire, privateKey);
  
  const fd = new FormData();
  fd.append("file", file);
  fd.append("fileName", file.name || `upload_${Date.now()}.png`);
  fd.append("publicKey", publicKey);
  fd.append("signature", signature);
  fd.append("token", token);
  fd.append("expire", expire.toString());
  fd.append("folder", "/kerala_hotels");
  
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: fd
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Direct ImageKit upload failed:", errorText);
    throw new Error(`ImageKit upload failed: ${res.status}`);
  }
  
  const data = await res.json();
  return data.url;
}


function cldSetZoneImage(zoneId, fieldId, url) {
  const zone = document.getElementById(zoneId);
  const field = document.getElementById(fieldId);
  if (!zone) return;
  if (!url) {
    zone.classList.remove("has-image");
    const inner = zone.querySelector(".cld-drop-inner");
    if (inner) inner.style.display = "";
    const img = zone.querySelector("img");
    if (img) img.remove();
    const overlay = zone.querySelector(".cld-overlay");
    if (overlay) overlay.remove();
    if (field) field.value = "";
    return;
  }
  zone.classList.add("has-image");
  let img = zone.querySelector("img");
  if (!img) { img = document.createElement("img"); zone.appendChild(img); }
  img.src = url;
  img.alt = "Hotel photo";
  let overlay = zone.querySelector(".cld-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "cld-overlay";
    overlay.innerHTML = `<i class="fas fa-camera"></i> Change Photo`;
    zone.appendChild(overlay);
  }
  const inner = zone.querySelector(".cld-drop-inner");
  if (inner) inner.style.display = "none";
  if (field) field.value = url;
}

function cldSetSlotImage(slotId, fieldId, url) {
  const slot = document.getElementById(slotId);
  const field = document.getElementById(fieldId);
  if (!slot) return;
  if (!url) {
    slot.classList.remove("has-image");
    slot.innerHTML = `<i class="fas fa-plus"></i><span>${slot.dataset.label || ""}</span>`;
    if (field) field.value = "";
    return;
  }
  slot.classList.add("has-image");
  const label = slot.dataset.label || slot.querySelector("span")?.textContent || "";
  slot.innerHTML = `
    <img src="${url}" alt="Gallery photo">
    <div class="cld-slot-overlay"><i class="fas fa-camera"></i> Change</div>
  `;
  if (!slot.dataset.label) slot.dataset.label = label;
  if (field) field.value = url;
}

function cldShowZoneSpinner(zoneId, isZone) {
  const el = document.getElementById(zoneId);
  if (!el) return;
  if (isZone) {
    el.innerHTML = `<div class="cld-uploading"><div class="cld-spinner"></div> Uploading…</div>`;
  } else {
    el.innerHTML = `<div class="cld-spinner"></div>`;
  }
}

window.triggerCldPick = function(zoneId, fieldId, isZone) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp,image/jpg";
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    cldShowZoneSpinner(zoneId, isZone);
    try {
      const url = await cldUploadFile(file);
      if (isZone) {
        cldSetZoneImage(zoneId, fieldId, url);
        if (fieldId === "new-hotel-image") updateHotelPreview();
      } else {
        cldSetSlotImage(zoneId, fieldId, url);
      }
      showAdminToast(`<i class="fas fa-check-circle" style="font-size:16px;"></i> Photo uploaded successfully!`, "success");
    } catch(err) {
      showAdminToast(`<i class="fas fa-exclamation-circle" style="font-size:16px;"></i> Upload failed — check your ImageKit settings`, "error");
      if (isZone) {
        const zone = document.getElementById(zoneId);
        if (zone) zone.innerHTML = `<div class="cld-drop-inner"><i class="fas fa-cloud-upload-alt"></i><span>Click or drag &amp; drop to upload</span></div>`;
      } else {
        const slot = document.getElementById(zoneId);
        if (slot) slot.innerHTML = `<i class="fas fa-plus"></i><span>Photo</span>`;
      }
    }
  };
  input.click();
};

window.handleCldDrop = async function(event, zoneId, fieldId, isZone) {
  event.preventDefault();
  const el = document.getElementById(zoneId);
  if (el) el.classList.remove("drag-over");
  const file = event.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  cldShowZoneSpinner(zoneId, isZone);
  try {
    const url = await cldUploadFile(file);
    if (isZone) {
      cldSetZoneImage(zoneId, fieldId, url);
      if (fieldId === "new-hotel-image") updateHotelPreview();
    } else {
      cldSetSlotImage(zoneId, fieldId, url);
    }
    showAdminToast(`<i class="fas fa-check-circle" style="font-size:16px;"></i> Photo uploaded successfully!`, "success");
  } catch(err) {
    showAdminToast(`<i class="fas fa-exclamation-circle" style="font-size:16px;"></i> Upload failed — check your ImageKit settings`, "error");
    if (isZone) {
      const zone = document.getElementById(zoneId);
      if (zone) zone.innerHTML = `<div class="cld-drop-inner"><i class="fas fa-cloud-upload-alt"></i><span>Click or drag &amp; drop to upload</span></div>`;
    } else {
      const slot = document.getElementById(zoneId);
      if (slot) slot.innerHTML = `<i class="fas fa-plus"></i><span>Photo</span>`;
    }
  }
};

// Add Hotel modal closing and reset logic is handled globally below

// ── Admin Toast Notification ──────────────────────────────────────────────
function showAdminToast(message, type = "success") {
  let container = document.getElementById("admin-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "admin-toast-container";
    container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  const bgColor = type === "success" ? "#108569" : type === "error" ? "#dc3545" : "#1a3c34";
  toast.style.cssText = `background:${bgColor};color:#fff;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;min-width:260px;max-width:380px;animation:toastIn .3s ease;`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "opacity .3s ease, transform .3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Add Hotel Modal: Live Preview ─────────────────────────────────────────
window.updateHotelPreview = function() {
  const name = document.getElementById("new-hotel-name")?.value || "Hotel Name Preview";
  const district = document.getElementById("new-hotel-district")?.value || "District";
  const price = document.getElementById("new-hotel-price")?.value;
  const category = (document.getElementById("new-hotel-category")?.value || "Category").replace(/[^\w\s&]/g, "").trim();
  const imgUrl = document.getElementById("new-hotel-image")?.value?.trim();

  const nameEl = document.getElementById("preview-name");
  const locEl = document.getElementById("preview-location");
  const priceEl = document.getElementById("preview-price");
  const catEl = document.getElementById("preview-category");
  const imgEl = document.getElementById("preview-img");

  if (nameEl) nameEl.textContent = name || "Hotel Name Preview";
  if (locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt" style="color:var(--primary);margin-right:4px;"></i>${district}, Kerala`;
  if (priceEl) priceEl.textContent = price ? `₹${parseInt(price).toLocaleString("en-IN")}` : "₹—";
  if (catEl) catEl.textContent = category || "Category";
  if (imgEl && imgUrl) {
    const testImg = new Image();
    testImg.onload = () => { imgEl.src = imgUrl; };
    testImg.src = imgUrl;
  }
};

window.previewMainImage = function() {
  const url = document.getElementById("new-hotel-image")?.value?.trim();
  if (!url) { showAdminToast("Please paste an image URL first.", "error"); return; }
  const imgEl = document.getElementById("preview-img");
  if (imgEl) {
    imgEl.src = url;
    imgEl.onerror = () => {
      imgEl.src = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=80&q=60";
      showAdminToast("⚠️ Could not load that image URL. Please check the link.", "error");
    };
    document.getElementById("hotel-preview-strip")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showAdminToast("Image preview updated!", "success");
  }
};

window.openAddHotelModal = function() {
  document.getElementById("add-hotel-modal").classList.add("open");
};
window.closeAddHotelModal = function() {
  document.getElementById("add-hotel-modal").classList.remove("open");
  // Reset Cloudinary zone images when Add Hotel modal is closed
  ["cld-add-main"].forEach(id => cldSetZoneImage(id, id === "cld-add-main" ? "new-hotel-image" : "", ""));
  [["cld-add-g2","new-hotel-img2"],["cld-add-g3","new-hotel-img3"],
   ["cld-add-g4","new-hotel-img4"],["cld-add-g5","new-hotel-img5"]].forEach(([z,f]) => cldSetSlotImage(z,f,""));
};

window.openEditHotelModal = function(hotelId) {
  const h = localHotels.find(item => item.id === hotelId);
  if (!h) return;
  document.getElementById("edit-hotel-id").value = h.id;
  document.getElementById("edit-hotel-name").value = h.name;
  document.getElementById("edit-hotel-price").value = h.price;
  document.getElementById("edit-hotel-status").value = h.status || "active";
  document.getElementById("edit-hotel-featured").checked = !!h.featured;
  const waField = document.getElementById("edit-hotel-whatsapp");
  if (waField) waField.value = h.whatsapp || "";
  const mapField = document.getElementById("edit-hotel-map");
  if (mapField) mapField.value = h.mapUrl || "";

  // Pre-populate Cloudinary upload zones with existing images
  const imgField = document.getElementById("edit-hotel-image");
  if (imgField) imgField.value = h.image || "";
  cldSetZoneImage("cld-edit-main", "edit-hotel-image", h.image || "");

  const extras = Array.isArray(h.images) ? h.images : [];
  const zoneIds = ["cld-edit-g2","cld-edit-g3","cld-edit-g4","cld-edit-g5"];
  const fieldIds = ["edit-hotel-img2","edit-hotel-img3","edit-hotel-img4","edit-hotel-img5"];
  zoneIds.forEach((zid, i) => {
    const url = extras[i] || "";
    const f = document.getElementById(fieldIds[i]);
    if (f) f.value = url;
    cldSetSlotImage(zid, fieldIds[i], url);
  });

  document.getElementById("edit-hotel-modal").classList.add("open");
};
window.closeEditHotelModal = function() {
  document.getElementById("edit-hotel-modal").classList.remove("open");
};

window.openAddRoomModal = function() {
  document.getElementById("add-room-modal").classList.add("open");
};
window.closeAddRoomModal = function() {
  document.getElementById("add-room-modal").classList.remove("open");
};

window.openManualBookingModal = function() {
  document.getElementById("add-booking-modal").classList.add("open");
};
window.closeManualBookingModal = function() {
  document.getElementById("add-booking-modal").classList.remove("open");
};

window.openAddCouponModal = function() {
  document.getElementById("add-coupon-modal").classList.add("open");
};
window.closeAddCouponModal = function() {
  document.getElementById("add-coupon-modal").classList.remove("open");
};

window.closeReviewReplyModal = function() {
  document.getElementById("review-reply-modal").classList.remove("open");
};

window.closeInvoiceModal = function() {
  document.getElementById("view-invoice-modal").classList.remove("open");
};

// -------------------------------------------------------------
// TABLE RENDER UTILITIES
// -------------------------------------------------------------
function renderHotelsTableData(list) {
  const tbody = document.getElementById("admin-hotels-tbody");
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-secondary);">
      <i class="fas fa-hotel" style="font-size:32px; margin-bottom:12px; display:block; opacity:.3;"></i>
      No hotels found. Click <strong>Add New Hotel</strong> to add your first property.
    </td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(h => {
    const isFeatured = !!h.featured;
    const isTrending = !!h.trending;
    const isActive = h.status === 'active';
    const placeholderImg = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=80&q=60";
    return `
      <tr style="transition:background .15s;" onmouseover="this.style.background='#fafffe'" onmouseout="this.style.background=''">
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${h.image || placeholderImg}" class="hotel-admin-card-img"
              onerror="this.src='${placeholderImg}'"
              alt="${h.name}">
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--dark); line-height:1.3;">${h.name}</div>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                ${isFeatured ? '<span style="background:#FFF3CD;color:#856404;padding:1px 7px;border-radius:10px;font-weight:600;font-size:10px;margin-right:4px;">⭐ Featured</span>' : ''}
                ${isTrending ? '<span style="background:#FDECEA;color:#c0392b;padding:1px 7px;border-radius:10px;font-weight:600;font-size:10px;">🔥 Trending</span>' : ''}
              </div>
            </div>
          </div>
        </td>
        <td style="font-size:13px; color:var(--text-secondary);">${h.district || '—'}, Kerala</td>
        <td>
          <span style="background:var(--primary-light); color:var(--primary); padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap;">${h.category || '—'}</span>
        </td>
        <td style="font-weight:700; color:var(--dark); font-size:14px;">₹${(h.price || 0).toLocaleString("en-IN")}<span style="font-size:10px; font-weight:400; color:var(--text-secondary);">/night</span></td>
        <td>
          <div style="display:flex; align-items:center; gap:4px;">
            <i class="fas fa-star" style="color:#FF9A02; font-size:12px;"></i>
            <span style="font-weight:600; font-size:13px;">${h.rating || '—'}</span>
            <span style="font-size:11px; color:var(--text-secondary);">(${h.reviewsCount || 0})</span>
          </div>
        </td>
        <td>
          <button onclick="toggleHotelStatus('${h.id}', '${h.status}')"
            style="border:none; cursor:pointer; padding:5px 14px; border-radius:20px; font-size:12px; font-weight:700; transition:all .2s;
              background:${isActive ? 'rgba(16,133,105,.1)' : 'rgba(220,53,69,.08)'};
              color:${isActive ? '#108569' : '#dc3545'};">
            <i class="fas fa-${isActive ? 'check-circle' : 'eye-slash'}" style="margin-right:4px;"></i>${isActive ? 'Live' : 'Hidden'}
          </button>
        </td>
        <td>
          <button onclick="toggleHotelFeatured('${h.id}', ${isFeatured})"
            style="border:none; cursor:pointer; padding:5px 14px; border-radius:20px; font-size:12px; font-weight:700; transition:all .2s;
              background:${isFeatured ? 'rgba(245,158,11,.12)' : 'var(--light)'};
              color:${isFeatured ? '#b45309' : 'var(--text-secondary)'};">
            ${isFeatured ? '⭐ Featured' : '☆ Standard'}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            <a href="/hotel.html?id=${h.id}" target="_blank" title="View on Website"
              style="width:30px; height:30px; border-radius:8px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:var(--primary); font-size:12px; text-decoration:none; transition:all .2s;"
              onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
              <i class="fas fa-external-link-alt"></i>
            </a>
            <button onclick="openEditHotelModal('${h.id}')" title="Edit"
              style="width:30px; height:30px; border-radius:8px; border:1px solid var(--border); background:none; cursor:pointer; color:var(--text-main); font-size:12px; transition:all .2s;"
              onmouseover="this.style.background='var(--light)'" onmouseout="this.style.background=''">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button onclick="deleteHotelProperty('${h.id}')" title="Delete"
              style="width:30px; height:30px; border-radius:8px; border:1px solid #ffd0d0; background:none; cursor:pointer; color:#dc3545; font-size:12px; transition:all .2s;"
              onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background=''">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

window.renderAdminHotelsTable = function() {
  const query = (document.getElementById("search-hotels-input")?.value || "").toLowerCase().trim();
  const filtered = localHotels.filter(h => {
    return !query || h.name.toLowerCase().includes(query) || h.district.toLowerCase().includes(query) || h.category.toLowerCase().includes(query);
  });
  renderHotelsTableData(filtered);
};

window.toggleHotelStatus = async function(hotelId, currentStatus) {
  const nextStatus = currentStatus === "active" ? "hidden" : "active";
  await updateHotel(hotelId, { status: nextStatus });
  await refreshAdminData();
};

window.toggleHotelFeatured = async function(hotelId, currentFeatured) {
  await updateHotel(hotelId, { featured: !currentFeatured });
  await refreshAdminData();
};

window.deleteHotelProperty = async function(hotelId) {
  if (confirm("Are you sure you want to delete this hotel property? All listings and rooms associated will be affected.")) {
    await deleteHotel(hotelId);
    await refreshAdminData();
  }
};

function renderRoomsTableData(list) {
  const tbody = document.getElementById("admin-rooms-tbody");
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;">No rooms found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(r => `
    <tr>
      <td><span style="font-weight:600;">${r.type}</span></td>
      <td>${r.hotelName || r.hotelId}</td>
      <td>${r.roomNumber}</td>
      <td>₹${r.price.toLocaleString("en-IN")}</td>
      <td>${r.capacity} Guests</td>
      <td>${r.beds} Beds</td>
      <td>
        <div style="display:flex; align-items:center; gap:5px;">
          <button class="btn btn-outline btn-sm" onclick="adjustRoomInventory('${r.id}', -1)" style="padding:2px 6px;">-</button>
          <span style="font-weight:600; min-width:20px; text-align:center;">${r.inventory}</span>
          <button class="btn btn-outline btn-sm" onclick="adjustRoomInventory('${r.id}', 1)" style="padding:2px 6px;">+</button>
        </div>
      </td>
      <td>
        <select onchange="changeRoomStatus('${r.id}', this.value)" style="border:1px solid var(--border); padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600;">
          <option value="available" ${r.availability === 'available' ? 'selected' : ''}>Available</option>
          <option value="booked" ${r.availability === 'booked' ? 'selected' : ''}>Booked</option>
          <option value="maintenance" ${r.availability === 'maintenance' ? 'selected' : ''}>Maintenance</option>
        </select>
      </td>
      <td>
        <button class="btn btn-outline btn-sm text-danger" onclick="deleteRoomConfig('${r.id}')" style="padding:4px 8px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

window.renderAdminRoomsTable = function() {
  const query = (document.getElementById("search-rooms-input")?.value || "").toLowerCase().trim();
  const hotelId = document.getElementById("filter-rooms-hotel")?.value || "";
  const filtered = localRooms.filter(r => {
    const queryMatch = !query || r.type.toLowerCase().includes(query) || r.roomNumber.includes(query);
    const hotelMatch = !hotelId || r.hotelId === hotelId;
    return queryMatch && hotelMatch;
  });
  renderRoomsTableData(filtered);
};

window.adjustRoomInventory = async function(roomId, delta) {
  const r = localRooms.find(item => item.id === roomId);
  if (!r) return;
  const nextInv = Math.max(0, r.inventory + delta);
  await updateRoom(roomId, { inventory: nextInv });
  await refreshAdminData();
};

window.changeRoomStatus = async function(roomId, newStatus) {
  await updateRoom(roomId, { availability: newStatus });
  await refreshAdminData();
};

window.deleteRoomConfig = async function(roomId) {
  if (confirm("Are you sure you want to delete this room configuration?")) {
    await deleteRoom(roomId);
    await refreshAdminData();
  }
};

function renderBookingsTableData(list) {
  const tbody = document.getElementById("admin-bookings-tbody");
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No bookings found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(b => `
    <tr>
      <td><strong>#${b.bookingId}</strong></td>
      <td>
        <div style="font-weight:600;">${escapeHTML(b.guestName)}</div>
        <div style="font-size:11px; color:var(--text-secondary);">${escapeHTML(b.guestPhone)}</div>
      </td>
      <td>
        <div style="font-weight:500;">${b.hotelName}</div>
        <div style="font-size:11px; color:var(--text-secondary);">${b.roomType || '-'}</div>
      </td>
      <td>
        <div style="font-size:12px; font-weight:500;">In: ${b.checkIn}</div>
        <div style="font-size:12px; font-weight:500; color:var(--text-secondary);">Out: ${b.checkOut}</div>
      </td>
      <td><strong>₹${b.amount.toLocaleString("en-IN")}</strong></td>
      <td><span class="status-badge ${b.status.toLowerCase().replace(" ", "-")}">${b.status}</span></td>
      <td><span class="status-badge ${b.paymentStatus.toLowerCase()}">${b.paymentStatus}</span></td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${b.status === 'Pending' ? `<button class="btn btn-primary btn-xs" onclick="updateAdminBookingStatus('${b.bookingId}', 'Confirmed', 'Paid')" style="padding:2px 6px; font-size:11px;">Confirm</button>` : ''}
          ${b.status === 'Confirmed' ? `<button class="btn btn-secondary btn-xs" onclick="updateAdminBookingStatus('${b.bookingId}', 'Checked In', 'Paid')" style="padding:2px 6px; font-size:11px; background:#2B76D9;">Check-In</button>` : ''}
          ${b.status === 'Checked In' ? `<button class="btn btn-secondary btn-xs" onclick="updateAdminBookingStatus('${b.bookingId}', 'Completed', 'Paid')" style="padding:2px 6px; font-size:11px; background:#108569;">Check-Out</button>` : ''}
          ${(b.status !== 'Completed' && b.status !== 'Cancelled' && b.status !== 'Refunded') ? `<button class="btn btn-outline btn-xs text-danger" onclick="updateAdminBookingStatus('${b.bookingId}', 'Cancelled', 'Refunded')" style="padding:2px 6px; font-size:11px; border-color:#FF5A5F; color:#FF5A5F;">Cancel</button>` : ''}
          <button class="btn btn-outline btn-xs" onclick="openInvoiceViewerModal('${b.bookingId}')" style="padding:2px 6px; font-size:11px;"><i class="fas fa-file-invoice"></i> Invoice</button>
        </div>
      </td>
    </tr>
  `).join("");
}

window.renderAdminBookingsTable = function() {
  const query = (document.getElementById("search-bookings-input")?.value || "").toLowerCase().trim();
  const status = document.getElementById("filter-bookings-status")?.value || "";
  const filtered = localBookings.filter(b => {
    const queryMatch = !query || b.bookingId.toLowerCase().includes(query) || b.guestName.toLowerCase().includes(query) || b.guestPhone.includes(query);
    const statusMatch = !status || b.status === status;
    return queryMatch && statusMatch;
  });
  renderBookingsTableData(filtered);
};

window.updateAdminBookingStatus = async function(bookingId, nextStatus, nextPaymentStatus) {
  if (nextStatus === "Cancelled") {
    const booking = localBookings.find(b => b.bookingId === bookingId);
    if (booking && booking.roomId) {
      const activeRoom = localRooms.find(r => r.id === booking.roomId);
      if (activeRoom) {
        const numRooms = parseInt(booking.guestsRooms.split(",")[1]) || 1;
        await updateRoom(booking.roomId, {
          inventory: activeRoom.inventory + numRooms,
          availability: "available"
        });
      }
    }
  }
  await updateBookingStatus(bookingId, { status: nextStatus, paymentStatus: nextPaymentStatus });
  await refreshAdminData();
};

function renderUsersTableData(list) {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No users found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><code>${u.uid.slice(0, 8)}...</code></td>
      <td><span style="font-weight:600;">${u.name}</span></td>
      <td>${u.email}</td>
      <td>${u.phone || '-'}</td>
      <td>${u.createdAt || '-'}</td>
      <td><span class="status-badge ${u.role === 'admin' ? 'confirmed' : 'pending'}">${u.role}</span></td>
      <td><span class="status-badge ${u.status === 'active' ? 'confirmed' : 'cancelled'}">${u.status === 'active' ? 'Active' : 'Banned'}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="toggleUserBanStatus('${u.uid}', '${u.status}')" style="padding:4px 8px; font-size:11px; border-color:${u.status === 'active' ? '#FF5A5F' : '#108569'}; color:${u.status === 'active' ? '#FF5A5F' : '#108569'};">
          ${u.status === 'active' ? 'Ban User' : 'Unban User'}
        </button>
      </td>
    </tr>
  `).join("");
}

window.renderAdminUsersTable = function() {
  const query = (document.getElementById("search-users-input")?.value || "").toLowerCase().trim();
  const filtered = localUsers.filter(u => {
    return !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });
  renderUsersTableData(filtered);
};

window.toggleUserBanStatus = async function(uid, currentStatus) {
  const nextStatus = currentStatus === "active" ? "banned" : "active";
  if (confirm(`Are you sure you want to ${nextStatus === "banned" ? "ban" : "unban"} this user account?`)) {
    await updateUserProfile(uid, { status: nextStatus });
    await refreshAdminData();
  }
};

window.renderAdminReviewsTable = function() {
  const tbody = document.getElementById("admin-reviews-tbody");
  if (!tbody) return;
  if (localReviews.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No reviews found.</td></tr>`;
    return;
  }
  tbody.innerHTML = localReviews.map(r => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${r.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
          <span style="font-weight:500;">${escapeHTML(r.userName)}</span>
        </div>
      </td>
      <td>${r.hotelId}</td>
      <td><div style="color:#FF9A02; font-size:12px;">${'<i class="fas fa-star"></i>'.repeat(r.rating)}</div></td>
      <td>
        <div style="max-width:250px; font-size:12px; color:var(--text-secondary); line-height:1.4;">${escapeHTML(r.reviewText)}</div>
        ${r.replyText ? `<div style="font-size:11px; color:var(--primary); margin-top:5px;"><strong>Reply:</strong> ${escapeHTML(r.replyText)}</div>` : ''}
      </td>
      <td>${r.createdAt}</td>
      <td><span class="status-badge ${r.status === 'approved' ? 'confirmed' : r.status === 'rejected' ? 'cancelled' : 'pending'}">${r.status}</span></td>
      <td>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${r.status === 'pending' ? `
            <button class="btn btn-outline btn-xs" onclick="approveReviewStatus('${r.reviewId}', 'approved')" style="padding:2px 6px; font-size:11px; border-color:#108569; color:#108569;">Approve</button>
            <button class="btn btn-outline btn-xs" onclick="approveReviewStatus('${r.reviewId}', 'rejected')" style="padding:2px 6px; font-size:11px; border-color:#FF5A5F; color:#FF5A5F;">Reject</button>
          ` : ''}
          <button class="btn btn-primary btn-xs" onclick="openReviewReplyModalGlobal('${r.reviewId}')" style="padding:2px 6px; font-size:11px;">Reply</button>
          <button class="btn btn-outline btn-xs text-danger" onclick="deleteReviewRecord('${r.reviewId}')" style="padding:2px 6px; font-size:11px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("");
};

window.approveReviewStatus = async function(reviewId, status) {
  await updateReviewStatus(reviewId, status);
  await refreshAdminData();
};

window.openReviewReplyModalGlobal = function(reviewId) {
  const rev = localReviews.find(item => item.reviewId === reviewId);
  if (!rev) return;
  document.getElementById("reply-review-id").value = reviewId;
  document.getElementById("reply-review-text").innerText = `"${rev.reviewText}"`;
  document.getElementById("reply-manager-text").value = rev.replyText || "";
  document.getElementById("review-reply-modal").classList.add("open");
};

window.deleteReviewRecord = async function(reviewId) {
  if (confirm("Are you sure you want to delete this review?")) {
    await deleteReview(reviewId);
    await refreshAdminData();
  }
};

window.renderAdminCouponsTable = function() {
  const tbody = document.getElementById("admin-coupons-tbody");
  if (!tbody) return;
  if (localCoupons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No coupons found.</td></tr>`;
    return;
  }
  tbody.innerHTML = localCoupons.map(c => `
    <tr>
      <td><strong>${c.code}</strong></td>
      <td>${c.discountPercent}%</td>
      <td>${c.expiryDate}</td>
      <td>${c.usageLimit}</td>
      <td>${c.usageCount}</td>
      <td>₹${c.minBookingAmount.toLocaleString("en-IN")}</td>
      <td>
        <button class="status-badge ${c.status === 'active' ? 'confirmed' : 'cancelled'}" style="border:none; cursor:pointer;" onclick="toggleCouponStatus('${c.code}', '${c.status}')">
          ${c.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td>
        <button class="btn btn-outline btn-sm text-danger" onclick="deleteCouponRecord('${c.code}')" style="padding:4px 8px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
};

window.toggleCouponStatus = async function(code, currentStatus) {
  const nextStatus = currentStatus === "active" ? "inactive" : "active";
  await updateCoupon(code, { status: nextStatus });
  await refreshAdminData();
};

window.deleteCouponRecord = async function(code) {
  if (confirm("Are you sure you want to delete this coupon?")) {
    await deleteCoupon(code);
    await refreshAdminData();
  }
};

window.renderAdminPaymentsTable = function() {
  const tbody = document.getElementById("admin-payments-tbody");
  if (!tbody) return;
  const list = localBookings.filter(b => b.status !== 'Cancelled' || b.paymentStatus === 'Refunded');
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No transactions recorded.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(b => `
    <tr>
      <td><code>TXN-${b.bookingId.split('-').pop() || '0000'}</code></td>
      <td>#${b.bookingId}</td>
      <td>${b.guestName}</td>
      <td><i class="fab fa-whatsapp" style="color:#108569;"></i> ${b.paymentMethod || 'WhatsApp'}</td>
      <td><strong>₹${b.amount.toLocaleString("en-IN")}</strong></td>
      <td><span class="status-badge ${b.paymentStatus.toLowerCase()}">${b.paymentStatus}</span></td>
      <td>${b.createdAt ? b.createdAt.split('T')[0] : '-'}</td>
    </tr>
  `).join("");
};

window.renderAdminAuditLogsTable = function() {
  const tbody = document.getElementById("admin-audit-logs-tbody");
  if (!tbody) return;
  if (localAuditLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No audit logs.</td></tr>`;
    return;
  }
  tbody.innerHTML = localAuditLogs.map(l => `
    <tr>
      <td><code>${l.operatorEmail}</code></td>
      <td><span style="font-weight:600; font-size:11px;">${l.action}</span></td>
      <td><span class="status-badge pending" style="font-size:10px; padding:2px 6px;">${l.targetType}</span></td>
      <td><code>${l.targetId}</code></td>
      <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.previousValue || ''}">${l.previousValue || '-'}</td>
      <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.newValue || ''}">${l.newValue || '-'}</td>
      <td style="font-size:11px; color:var(--text-secondary);">${new Date(l.timestamp).toLocaleString()}</td>
    </tr>
  `).join("");
};

function renderDistrictPerformance() {
  const districts = ["Kollam", "Kochi", "Munnar", "Alappuzha", "Varkala", "Kovalam", "Wayanad"];
  const tbody = document.getElementById("admin-district-performance-tbody");
  if (!tbody) return;

  const occupancyEl = document.getElementById("report-occupancy-rate");
  const cancellationEl = document.getElementById("report-cancellation-rate");
  const growthEl = document.getElementById("report-user-growth");

  // Calculate Occupancy Rate
  const bookedRooms = localRooms.filter(r => r.availability === "booked").length + 
                       localBookings.filter(b => b.status === "Confirmed" || b.status === "Checked In").length;
  const totalRooms = localRooms.reduce((sum, r) => sum + (r.inventory || 0), 0) + bookedRooms;
  const occupancyVal = totalRooms > 0 ? ((bookedRooms / totalRooms) * 100).toFixed(1) : "64.8";
  if (occupancyEl) occupancyEl.innerText = `${occupancyVal}%`;

  // Calculate Cancellation Rate
  const cancelledBookings = localBookings.filter(b => b.status === "Cancelled" || b.paymentStatus === "Refunded").length;
  const totalBookings = localBookings.length;
  const cancellationVal = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : "11.2";
  if (cancellationEl) cancellationEl.innerText = `${cancellationVal}%`;

  // Calculate User Growth
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentUsers = localUsers.filter(u => {
    if (!u.createdAt) return false;
    const regDate = new Date(u.createdAt);
    return regDate >= thirtyDaysAgo;
  }).length;
  const previousUsers = localUsers.length - recentUsers;
  const growthVal = previousUsers > 0 ? ((recentUsers / previousUsers) * 100).toFixed(1) : (recentUsers * 15.3).toFixed(1);
  if (growthEl) growthEl.innerText = `+${growthVal}%`;

  tbody.innerHTML = districts.map(dist => {
    const distHotels = localHotels.filter(h => h.district.toLowerCase() === dist.toLowerCase());
    const hotelIds = distHotels.map(h => h.id);
    const distBookings = localBookings.filter(b => hotelIds.includes(b.hotelId));
    const revenue = distBookings.reduce((sum, b) => sum + b.amount, 0);
    return `
      <tr>
        <td><strong>${dist}</strong></td>
        <td>${distHotels.length} hotels</td>
        <td>${distBookings.length} bookings</td>
        <td><strong>₹${revenue.toLocaleString("en-IN")}</strong></td>
      </tr>
    `;
  }).join("");
}

// -------------------------------------------------------------
// INVOICE PRINT & PDF VIEWER
// -------------------------------------------------------------
window.openInvoiceViewerModal = function(bookingId) {
  const b = localBookings.find(item => item.bookingId === bookingId);
  if (!b) return;
  
  const printArea = document.getElementById("invoice-print-area");
  if (printArea) {
    const taxRate = window.getGlobalTaxRate();
    const vat = Math.floor(b.amount * (taxRate / (1 + taxRate)));
    const baseVal = b.amount - vat;
    printArea.innerHTML = `
==================================================
        HOTELS NEAR ME IN KERALA INVOICE
==================================================
Invoice ID  : INV-${b.bookingId.split('-').pop()}
Booking ID  : #${b.bookingId}
Date        : ${new Date(b.createdAt || Date.now()).toLocaleDateString()}
Guest Name  : ${b.guestName}
Phone       : ${b.guestPhone}
--------------------------------------------------
Hotel Name  : ${b.hotelName}
Room type   : ${b.roomType || '-'}
Check-In    : ${b.checkIn}
Check-Out   : ${b.checkOut}
Guests/Rooms: ${b.guestsRooms || '-'}
--------------------------------------------------
Subtotal    : ₹${baseVal.toLocaleString("en-IN")}
GST (${Math.round(taxRate * 100)}%)   : ₹${vat.toLocaleString("en-IN")}
--------------------------------------------------
GRAND TOTAL : ₹${b.amount.toLocaleString("en-IN")}
Payment Status: ${b.paymentStatus} (Via ${b.paymentMethod || 'WhatsApp'})
==================================================
          Thank you for booking with us!
==================================================
`;
  }
  document.getElementById("view-invoice-modal").classList.add("open");
};

window.printInvoice = function() {
  const printContent = document.getElementById("invoice-print-area").innerHTML;
  const printWindow = window.open('', '_blank', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Print Invoice</title>');
  printWindow.document.write('<style>body{font-family:"Courier New", monospace; padding:40px; white-space: pre-wrap; font-size:14px; text-align:left;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(printContent);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// -------------------------------------------------------------
// REPORT CSV EXPORT
// -------------------------------------------------------------
window.exportDataCSV = function() {
  if (localBookings.length === 0) {
    alert("No bookings available to export.");
    return;
  }
  const headers = ["Booking ID", "Guest Name", "Guest Phone", "Hotel Name", "Room Type", "Check In", "Check Out", "Amount", "Status", "Payment Status", "Created At"];
  const rows = localBookings.map(b => [
    b.bookingId,
    b.guestName,
    b.guestPhone,
    b.hotelName,
    b.roomType,
    b.checkIn,
    b.checkOut,
    b.amount,
    b.status,
    b.paymentStatus,
    b.createdAt
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `hbooking_reservations_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// -------------------------------------------------------------
// AI chat assistants
// -------------------------------------------------------------
window.handleAIChatKeyPress = function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    window.sendAIChat();
  }
};

window.sendAIChat = function() {
  const inputEl = document.getElementById("ai-chat-input");
  const outputEl = document.getElementById("ai-chat-output");
  if (!inputEl || !outputEl) return;

  const query = inputEl.value.trim();
  if (!query) return;

  const userMsg = document.createElement("div");
  userMsg.style.cssText = "background:var(--primary); color:#FFFFFF; padding:10px 14px; border-radius:12px; align-self:flex-end; max-width:80%; margin-top:8px;";
  userMsg.innerText = query;
  outputEl.appendChild(userMsg);
  inputEl.value = "";
  outputEl.scrollTop = outputEl.scrollHeight;

  const typingMsg = document.createElement("div");
  typingMsg.style.cssText = "background:var(--light); padding:10px 14px; border-radius:12px; align-self:flex-start; max-width:80%; color:var(--text-secondary); font-style:italic;";
  typingMsg.innerText = "Analyzing live data...";
  outputEl.appendChild(typingMsg);
  outputEl.scrollTop = outputEl.scrollHeight;

  setTimeout(() => {
    outputEl.removeChild(typingMsg);
    const lowerQuery = query.toLowerCase();
    const totalHotels = localHotels.length;
    const totalBookings = localBookings.length;
    const activeBookings = localBookings.filter((b) => b.status === "Confirmed" || b.status === "Pending" || b.status === "Checked In" || b.status === "Checked Out");
    const confirmed = localBookings.filter((b) => b.status === "Confirmed" || b.status === "Checked In" || b.status === "Checked Out").length;
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    let reply;

    // Check if the query asks about a specific hotel in our database
    let matchedHotel = null;
    for (const h of localHotels) {
      const cleanHotelName = h.name.toLowerCase().replace(/,.*|-/g, "").trim();
      if (lowerQuery.includes(cleanHotelName) || lowerQuery.includes(h.id.toLowerCase())) {
        matchedHotel = h;
        break;
      }
    }

    if (matchedHotel) {
      const hotelBookings = localBookings.filter(b => b.hotelId === matchedHotel.id);
      const activeHotelBookings = hotelBookings.filter(b => b.status === "Confirmed" || b.status === "Pending" || b.status === "Checked In" || b.status === "Checked Out");
      const hotelRev = activeHotelBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
      
      // Calculate occupancy specifically for this hotel
      const hotelRooms = localRooms.filter(r => r.hotelId === matchedHotel.id);
      const bookedRoomsCount = hotelRooms.filter(r => r.availability === "booked").length + 
                                activeHotelBookings.filter(b => b.status === "Confirmed" || b.status === "Checked In").length;
      const totalRoomsCount = hotelRooms.reduce((sum, r) => sum + (r.inventory || 0), 0) + bookedRoomsCount;
      const hotelOccupancy = totalRoomsCount > 0 ? (bookedRoomsCount / totalRoomsCount) * 100 : 0;

      if (lowerQuery.includes("price") || lowerQuery.includes("pricing") || lowerQuery.includes("rate") || lowerQuery.includes("suggest")) {
        if (hotelOccupancy > 70) {
          reply = `Pricing Optimization for "${matchedHotel.name}": Occupancy is high at ${hotelOccupancy.toFixed(1)}% (with ${activeHotelBookings.length} active bookings). We suggest raising the current rate of ₹${matchedHotel.price.toLocaleString("en-IN")} by 10% to 15% to maximize yield on upcoming dates.`;
        } else if (hotelOccupancy < 30) {
          reply = `Pricing Optimization for "${matchedHotel.name}": Occupancy is low at ${hotelOccupancy.toFixed(1)}%. We suggest offering a 10% to 20% discount coupon or lowering the base rate of ₹${matchedHotel.price.toLocaleString("en-IN")} temporarily to boost demand.`;
        } else {
          reply = `Pricing Optimization for "${matchedHotel.name}": Occupancy is steady at ${hotelOccupancy.toFixed(1)}% and current rate is ₹${matchedHotel.price.toLocaleString("en-IN")}. The current rate is well-optimized for the market.`;
        }
      } else if (lowerQuery.includes("occupancy") || lowerQuery.includes("booking") || lowerQuery.includes("stats") || lowerQuery.includes("revenue")) {
        reply = `Performance report for "${matchedHotel.name}": Rating is ${matchedHotel.rating} ★. It has generated ₹${hotelRev.toLocaleString("en-IN")} in active revenue across ${hotelBookings.length} total processed booking requests. Occupancy rate is ${hotelOccupancy.toFixed(1)}% with ${bookedRoomsCount} rooms currently booked.`;
      } else {
        reply = `"${matchedHotel.name}" is located in ${matchedHotel.location} (${matchedHotel.district} district) with a rating of ${matchedHotel.rating} ★. The standard price is ₹${matchedHotel.price.toLocaleString("en-IN")}/night. It has processed ${hotelBookings.length} bookings, generating ₹${hotelRev.toLocaleString("en-IN")} in revenue.`;
      }
    } else {
      const dests = ["kochi", "munnar", "alappuzha", "varkala", "kovalam", "wayanad", "kollam"];
      let matchedDest = dests.find(d => lowerQuery.includes(d));
      
      if (matchedDest) {
        const destHotels = localHotels.filter(h => h.district.toLowerCase().includes(matchedDest) || h.location.toLowerCase().includes(matchedDest));
        const destBookings = localBookings.filter(b => destHotels.some(h => h.id === b.hotelId));
        const activeDestBookings = destBookings.filter(b => b.status === "Confirmed" || b.status === "Pending" || b.status === "Checked In" || b.status === "Checked Out");
        const destRev = activeDestBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        const avgRating = destHotels.length > 0 ? (destHotels.reduce((sum, h) => sum + h.rating, 0) / destHotels.length).toFixed(1) : "4.5";
        reply = `In ${matchedDest.charAt(0).toUpperCase() + matchedDest.slice(1)}, there are ${destHotels.length} active hotel listings with an average rating of ${avgRating} ★. We've processed ${destBookings.length} booking(s) for this region, generating ₹${destRev.toLocaleString("en-IN")} in active revenue.`;
      } else if (lowerQuery.includes("top hotel") || lowerQuery.includes("best hotel") || lowerQuery.includes("performing")) {
        const stats = {};
        localBookings.filter(b => b.status !== "Cancelled").forEach(b => {
          if (!stats[b.hotelId]) stats[b.hotelId] = 0;
          stats[b.hotelId] += b.amount;
        });
        let topHotelId = "";
        let maxRev = -1;
        for (const hId in stats) {
          if (stats[hId] > maxRev) {
            maxRev = stats[hId];
            topHotelId = hId;
          }
        }
        const topHotel = localHotels.find(h => h.id === topHotelId) || localHotels.sort((a,b) => b.rating - a.rating)[0];
        if (topHotel) {
          reply = `The top performing hotel is "${topHotel.name}" in ${topHotel.location}. It has a rating of ${topHotel.rating} ★ and has generated the highest transaction volume on our platform.`;
        } else {
          reply = `No bookings recorded yet. The highest rated hotel in our database is "${localHotels[0]?.name}" at ${localHotels[0]?.rating} ★.`;
        }
      } else if (lowerQuery.includes("revenue") || lowerQuery.includes("sales") || lowerQuery.includes("earned")) {
        reply = `The platform's gross revenue is exactly ₹${totalRevenue.toLocaleString("en-IN")} across ${totalBookings} total transactions, with ${confirmed} confirmed/active bookings.`;
      } else if (lowerQuery.includes("user") || lowerQuery.includes("customer")) {
        const activeUsers = localUsers.filter(u => u.status === "active").length;
        reply = `There are currently ${localUsers.length} registered customers in the database, with ${activeUsers} active accounts and ${localUsers.length - activeUsers} banned/inactive.`;
      } else if (lowerQuery.includes("occupancy") || lowerQuery.includes("cancel")) {
        const bookedRooms = localRooms.filter(r => r.availability === "booked").length + 
                             localBookings.filter(b => b.status === "Confirmed" || b.status === "Checked In").length;
        const totalRooms = localRooms.reduce((sum, r) => sum + (r.inventory || 0), 0) + bookedRooms;
        const occupancyVal = totalRooms > 0 ? ((bookedRooms / totalRooms) * 100).toFixed(1) : "64.8";
        const cancelled = localBookings.filter(b => b.status === "Cancelled").length;
        const cancelVal = totalBookings > 0 ? ((cancelled / totalBookings) * 100).toFixed(1) : "11.2";
        reply = `The platform's average occupancy rate is ${occupancyVal}% with ${bookedRooms} active booked room configurations. Our booking cancellation rate stands at ${cancelVal}% dynamically.`;
      } else if (lowerQuery.includes("price") || lowerQuery.includes("pricing")) {
        const avgPrice = totalHotels ? Math.round(localHotels.reduce((s, h) => s + h.price, 0) / totalHotels) : 0;
        reply = `Average nightly rate across the platform is ₹${avgPrice.toLocaleString("en-IN")}. Review individual property pricing in the Hotels tab.`;
      } else {
        reply = `Live platform summary: ${totalHotels} hotels, ${totalBookings} bookings (${confirmed} confirmed), ${localUsers.length} users, ₹${totalRevenue.toLocaleString("en-IN")} active revenue. Ask about pricing, occupancy, or district performance.`;
      }
    }

    const aiMsg = document.createElement("div");
    aiMsg.style.cssText = "background:var(--light); padding:10px 14px; border-radius:12px; align-self:flex-start; max-width:80%; margin-top:8px; line-height:1.4;";
    aiMsg.innerText = reply;
    outputEl.appendChild(aiMsg);
    outputEl.scrollTop = outputEl.scrollHeight;
  }, 600);
};

// -------------------------------------------------------------
// DASHBOARD VIEW AND METRICS
// -------------------------------------------------------------
function calculateDashboardMetrics(hotels, bookings) {
  const hCountEl = document.getElementById("metric-hotels-count");
  const rCountEl = document.getElementById("metric-rooms-count");

  if (hCountEl) hCountEl.innerText = hotels.length;
  if (rCountEl) rCountEl.innerText = localRooms.length;
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById("recent-bookings-tbody");
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No bookings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.slice(0, 5).map(b => `
    <tr>
      <td>#${b.bookingId}</td>
      <td>${b.guestName}</td>
      <td>${b.hotelName}</td>
      <td>${b.checkIn}</td>
      <td>₹${b.amount.toLocaleString("en-IN")}</td>
      <td>
        <span class="status-badge ${b.status.toLowerCase().replace(" ", "-")}">${b.status}</span>
      </td>
    </tr>
  `).join("");
}

function renderTopHotels(hotels, bookings) {
  const container = document.getElementById("top-performing-hotels-list");
  if (!container) return;

  const stats = {};
  bookings.forEach(b => {
    if (!stats[b.hotelId]) stats[b.hotelId] = { count: 0, revenue: 0 };
    stats[b.hotelId].count += 1;
    stats[b.hotelId].revenue += b.amount;
  });

  const topList = hotels.map(h => {
    const s = stats[h.id] || { count: 0, revenue: 0 };
    return {
      name: h.name,
      location: h.location,
      image: h.image,
      bookings: s.count,
      revenue: s.revenue
    };
  });

  topList.sort((a,b) => b.revenue - a.revenue);

  container.innerHTML = topList.slice(0, 5).map(h => `
    <div class="top-hotel-item">
      <img src="${h.image}" alt="${h.name}">
      <div class="top-hotel-info">
        <h4>${h.name}</h4>
        <span>${h.location}</span>
      </div>
      <div class="top-hotel-stats">
        <div class="bookings-count">${h.bookings} bookings</div>
        <div class="revenue-amt">₹${h.revenue.toLocaleString("en-IN")}</div>
      </div>
    </div>
  `).join("");
}

function drawSVGCharts(bookings) {
  const lineChart = document.getElementById("bookings-line-chart");
  const donutChart = document.getElementById("bookings-donut-chart");

  if (lineChart) {
    const width = 600;
    const height = 220;
    
    // Group bookings by last 5 days
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      last5Days.push({ dateStr, label, val: 0 });
    }

    // Populate values from database bookings
    bookings.forEach(b => {
      if (b.createdAt) {
        const bDate = b.createdAt.split("T")[0];
        const match = last5Days.find(day => day.dateStr === bDate);
        if (match) {
          match.val += b.amount || 0;
        }
      }
    });

    const points = last5Days.map(day => ({
      label: day.label,
      val: day.val
    }));

    const totalRev = points.reduce((sum, p) => sum + p.val, 0);
    if (totalRev === 0) {
      points[0].val = 1500;
      points[1].val = 3200;
      points[2].val = 2400;
      points[3].val = 4900;
      points[4].val = 0;
    }

    const maxVal = Math.max(...points.map(p => p.val), 5000);
    const xStep = width / (points.length + 1);
    
    let pathD = "";
    let dots = "";
    let gridLines = "";
    let gridLabels = "";

    for (let i = 0; i <= 4; i++) {
      const yGrid = height - (i * (height - 30) / 4) - 20;
      const valLabel = Math.round(i * maxVal / 4);
      gridLines += `<line x1="40" y1="${yGrid}" x2="${width - 20}" y2="${yGrid}" stroke="#E2ECE8" stroke-width="1" stroke-dasharray="3,3" />`;
      gridLabels += `<text x="10" y="${yGrid + 4}" fill="#5A6B66" font-size="10" font-weight="500">${valLabel}</text>`;
    }

    points.forEach((pt, idx) => {
      const cx = 50 + (idx * xStep);
      const cy = height - ((pt.val / maxVal) * (height - 50)) - 30;

      gridLabels += `<text x="${cx - 15}" y="${height - 5}" fill="#5A6B66" font-size="10" font-weight="500">${pt.label}</text>`;

      if (idx === 0) {
        pathD += `M ${cx} ${cy}`;
      } else {
        pathD += ` L ${cx} ${cy}`;
      }
      dots += `<circle cx="${cx}" cy="${cy}" r="5" fill="var(--primary)" stroke="#FFFFFF" stroke-width="2" />`;
    });

    lineChart.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        ${gridLines}
        <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${dots}
        ${gridLabels}
      </svg>
    `;
  }

  if (donutChart) {
    const totalCount = bookings.length;
    const counts = { Confirmed: 0, Pending: 0, Cancelled: 0 };
    bookings.forEach(b => {
      let statusKey = "Pending";
      if (b.status === "Confirmed" || b.status === "Checked In" || b.status === "Completed") {
        statusKey = "Confirmed";
      } else if (b.status === "Cancelled" || b.status === "Refunded") {
        statusKey = "Cancelled";
      }
      if (counts[statusKey] !== undefined) counts[statusKey]++;
    });

    const c = counts.Confirmed;
    const p = counts.Pending;
    const ca = counts.Cancelled;
    
    const sum = c + p + ca;
    const cPct = sum > 0 ? c / sum : 0.6;
    const pPct = sum > 0 ? p / sum : 0.2;
    const caPct = sum > 0 ? ca / sum : 0.2;

    const r = 50;
    const circ = 2 * Math.PI * r;
    const center = 75;

    const cStroke = circ * cPct;
    const pStroke = circ * pPct;
    const caStroke = circ * caPct;

    const cOffset = 0;
    const pOffset = -cStroke;
    const caOffset = -(cStroke + pStroke);

    donutChart.innerHTML = `
      <div class="donut-chart-container">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="${center}" cy="${center}" r="${r}" fill="transparent" stroke="#E2ECE8" stroke-width="16" />
          <circle cx="${center}" cy="${center}" r="${r}" fill="transparent" 
            stroke="#108569" stroke-width="16" 
            stroke-dasharray="${cStroke} ${circ - cStroke}" 
            stroke-dashoffset="${cOffset}" 
            transform="rotate(-90 ${center} ${center})" />
          <circle cx="${center}" cy="${center}" r="${r}" fill="transparent" 
            stroke="#E58E00" stroke-width="16" 
            stroke-dasharray="${pStroke} ${circ - pStroke}" 
            stroke-dashoffset="${pOffset}" 
            transform="rotate(-90 ${center} ${center})" />
          <circle cx="${center}" cy="${center}" r="${r}" fill="transparent" 
            stroke="#FF5A5F" stroke-width="16" 
            stroke-dasharray="${caStroke} ${circ - caStroke}" 
            stroke-dashoffset="${caOffset}" 
            transform="rotate(-90 ${center} ${center})" />
          <text x="${center}" y="${center - 5}" text-anchor="middle" font-size="16" font-family="'Outfit'" font-weight="800" fill="var(--dark)">${totalCount}</text>
          <text x="${center}" y="${center + 12}" text-anchor="middle" font-size="9" fill="var(--text-secondary)" font-weight="600" text-transform="uppercase">Total</text>
        </svg>
        <div class="donut-legend">
          <div class="legend-item"><span class="legend-color" style="background:#108569"></span> Confirmed: ${Math.round(cPct*100)}% (${sum > 0 ? c : 0})</div>
          <div class="legend-item"><span class="legend-color" style="background:#E58E00"></span> Pending: ${Math.round(pPct*100)}% (${sum > 0 ? p : 0})</div>
          <div class="legend-item"><span class="legend-color" style="background:#FF5A5F"></span> Cancelled: ${Math.round(caPct*100)}% (${sum > 0 ? ca : 0})</div>
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// GLOBAL USER MODALS & DRAWER FUNCTIONS
// -------------------------------------------------------------
function initGlobalModals() {
  if (document.getElementById("modal-profile")) return;

  const modalsHtml = `
    <!-- User Profile Modal -->
    <div class="modal-overlay" id="modal-profile" style="z-index: 1001;">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Edit My Profile</h3>
          <button class="modal-close" id="profile-modal-close-btn">&times;</button>
        </div>
        <form class="modal-form" id="form-user-profile">
          <div class="form-group">
            <label for="profile-name">Full Name *</label>
            <input type="text" id="profile-name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label for="profile-phone">Phone Number</label>
            <input type="tel" id="profile-phone" placeholder="e.g. +91 98765 43210">
          </div>
          <div class="form-group">
            <label for="profile-email">Email Address</label>
            <input type="email" id="profile-email" disabled style="background: var(--light); cursor: not-allowed;">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; border-radius: 30px;">Save Changes</button>
        </form>
      </div>
    </div>

    <!-- My Bookings Modal -->
    <div class="modal-overlay" id="modal-my-bookings" style="z-index: 1000;">
      <div class="modal-box" style="max-width: 700px; width: 90%;">
        <div class="modal-header">
          <h3>My Booking History</h3>
          <button class="modal-close" id="bookings-modal-close-btn">&times;</button>
        </div>
        <div class="admin-table-wrapper" style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Hotel</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="my-bookings-list-tbody">
              <!-- Injected Dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Wishlist Drawer (Slide-out) -->
    <div class="drawer-overlay" id="drawer-wishlist" style="z-index: 1002;">
      <div class="drawer-box">
        <div class="drawer-header">
          <h3>My Wishlist (<span id="wishlist-count-badge">0</span>)</h3>
          <button class="drawer-close" id="wishlist-drawer-close-btn">&times;</button>
        </div>
        <div class="drawer-body" id="wishlist-items-container">
          <!-- Injected Dynamically -->
        </div>
      </div>
    </div>

    <!-- Mobile Account Options Bottom Sheet -->
    <div class="modal-overlay bottom-sheet" id="modal-mobile-account" style="z-index: 1003;">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Account Options</h3>
          <button class="modal-close" id="mobile-account-close-btn">&times;</button>
        </div>
        <div class="mobile-account-options" style="display:flex; flex-direction:column; gap:12px; padding: 20px 0;">
          <!-- Options will be injected dynamically -->
        </div>
      </div>
    </div>
  `;

  const div = document.createElement("div");
  div.innerHTML = modalsHtml;
  document.body.appendChild(div);

  // Wire up close buttons
  document.getElementById("profile-modal-close-btn").addEventListener("click", () => {
    document.getElementById("modal-profile").classList.remove("open");
  });
  document.getElementById("bookings-modal-close-btn").addEventListener("click", () => {
    document.getElementById("modal-my-bookings").classList.remove("open");
  });
  document.getElementById("wishlist-drawer-close-btn").addEventListener("click", () => {
    document.getElementById("drawer-wishlist").classList.remove("open");
  });
  document.getElementById("mobile-account-close-btn").addEventListener("click", () => {
    window.closeMobileAccountMenu();
  });
  document.getElementById("modal-mobile-account").addEventListener("click", (e) => {
    if (e.target.id === "modal-mobile-account") {
      window.closeMobileAccountMenu();
    }
  });

  // Hook Profile Form Submit
  const profileForm = document.getElementById("form-user-profile");
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userJson = localStorage.getItem("hbooking_user");
    if (!userJson) return;
    const user = JSON.parse(userJson);

    const updates = {
      name: document.getElementById("profile-name").value.trim(),
      phone: document.getElementById("profile-phone").value.trim()
    };

    await updateUserProfile(user.uid || user.email, updates);
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem("hbooking_user", JSON.stringify(updatedUser));
    
    alert("Profile Updated Successfully!");
    document.getElementById("modal-profile").classList.remove("open");
    setupHeaderAuth();
    
    if (window.location.pathname.endsWith("admin.html")) {
      document.getElementById("admin-profile-name").innerText = updates.name.split(" ")[0];
    }
  });

  // Hook landing page Wishlist button if it exists
  const savedBtn = document.querySelector(".saved-btn");
  if (savedBtn) {
    savedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openWishlistDrawer();
    });
  }
}

window.selectProfileAvatar = function(el, url) {
  document.querySelectorAll(".avatar-option-img").forEach(img => {
    img.style.borderColor = "transparent";
    img.style.transform = "none";
  });
  el.style.borderColor = "var(--primary)";
  el.style.transform = "scale(1.1)";
  document.getElementById("profile-photo-url").value = url;
};

async function openProfileModal() {
  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) return;
  const user = JSON.parse(userJson);

  document.getElementById("profile-name").value = user.name || "";
  document.getElementById("profile-phone").value = user.phone || "";
  document.getElementById("profile-email").value = user.email || "";

  document.getElementById("modal-profile").classList.add("open");
}

async function openMyBookingsModal() {
  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) return;
  const user = JSON.parse(userJson);
  const bookings = await getBookings();
  
  const userKey = user.uid || user.email;
  const userName = (user.name || "").toLowerCase();
  const myBookings = bookings.filter(b => {
    const bookingName = (b.guestName || "").toLowerCase();
    return b.userId === userKey ||
      (userName && bookingName && bookingName === userName) ||
      (user.phone && b.guestPhone === user.phone);
  });

  const tbody = document.getElementById("my-bookings-list-tbody");
  if (myBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No bookings found.</td></tr>`;
  } else {
    tbody.innerHTML = myBookings.map(b => `
      <tr>
        <td>#${b.bookingId}</td>
        <td>${b.hotelName}</td>
        <td>${b.checkIn}</td>
        <td>${b.checkOut}</td>
        <td>₹${b.amount.toLocaleString("en-IN")}</td>
        <td><span class="status-badge ${b.status.toLowerCase()}">${b.status}</span></td>
        <td>
          ${(b.status === 'Confirmed' || b.status === 'Pending') 
            ? `<button class="btn btn-outline btn-sm text-danger" style="border-color:#FF5A5F; color:#FF5A5F; padding:4px 10px; border-radius: 4px;" onclick="cancelUserBooking('${b.bookingId}')">Cancel</button>`
            : `-`
          }
        </td>
      </tr>
    `).join("");
  }

  document.getElementById("modal-my-bookings").classList.add("open");
}

window.cancelUserBooking = async function(bookingId) {
  if (confirm(`Are you sure you want to cancel booking #${bookingId}?`)) {
    await updateBookingStatus(bookingId, { status: "Cancelled", paymentStatus: "Refunded" });
    alert(`Booking #${bookingId} has been Cancelled and Refunded.`);
    openMyBookingsModal();
  }
};

async function openWishlistDrawer() {
  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) {
    alert("Please log in to view your Saved Hotels!");
    window.location.href = "/login.html";
    return;
  }
  const user = JSON.parse(userJson);
  const userKey = user.uid || user.email;
  const favs = await getFavorites(userKey);
  const hotels = await getHotels();

  const container = document.getElementById("wishlist-items-container");
  document.getElementById("wishlist-count-badge").innerText = favs.length;

  if (favs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 20px; color: var(--text-secondary);">
        <i class="far fa-heart" style="font-size: 40px; margin-bottom: 15px; color: #FF5A5F;"></i>
        <p>Your wishlist is empty.</p>
        <span style="font-size: 12px; display: block; margin-top: 5px;">Tap the heart icon on hotel cards to save properties!</span>
      </div>
    `;
  } else {
    const list = favs.map(f => {
      const h = hotels.find(item => item.id === f.hotelId);
      if (!h) return "";
      return `
        <div class="wishlist-item" style="display:flex; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
          <img src="${h.image}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;">
          <div style="flex:1;">
            <h4 style="font-size: 14px; margin-bottom: 4px;">${h.name}</h4>
            <span style="font-size: 11px; color: var(--text-secondary); display:block; margin-bottom: 6px;"><i class="fas fa-map-marker-alt"></i> ${h.location}</span>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; color: var(--primary); font-size:13px;">₹${h.price.toLocaleString("en-IN")}/night</span>
              <div style="display:flex; gap: 8px;">
                <a href="hotel.html?id=${h.id}" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 11px; border-radius:4px;">View</a>
                <button class="btn btn-outline btn-sm" style="padding: 4px 8px; border-radius:4px; color:#FF5A5F; border-color:#FF5A5F;" onclick="removeFavoriteHotel('${h.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
    container.innerHTML = list;
  }

  document.getElementById("drawer-wishlist").classList.add("open");
}

window.removeFavoriteHotel = async function(hotelId) {
  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) return;
  const user = JSON.parse(userJson);
  const userKey = user.uid || user.email;

  await removeFavorite(userKey, hotelId);
  setupSavedHotelsCount();
  openWishlistDrawer();
  
  const cards = document.querySelectorAll(`[data-hotel-id="${hotelId}"] .hotel-card-save i`);
  cards.forEach(i => {
    i.className = "far fa-heart";
  });
};

async function setupSavedHotelsCount() {
  const countEl = document.querySelector(".saved-btn");
  if (!countEl) return;

  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) {
    countEl.innerHTML = `<i class="fas fa-heart"></i> Saved`;
    return;
  }
  const user = JSON.parse(userJson);
  const userKey = user.uid || user.email;
  const favs = await getFavorites(userKey);
  
  countEl.innerHTML = `<i class="fas fa-heart"></i> Saved (${favs.length})`;
}

window.toggleWishlist = async function(btn, hotelId) {
  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) {
    alert("Please log in to save properties to your wishlist!");
    window.location.href = "/login.html";
    return;
  }
  const user = JSON.parse(userJson);
  const userKey = user.uid || user.email;
  
  const icon = btn.querySelector("i");
  const favs = await getFavorites(userKey);
  const isFav = favs.some(f => f.hotelId === hotelId);

  if (isFav) {
    await removeFavorite(userKey, hotelId);
    icon.className = "far fa-heart";
  } else {
    await addFavorite(userKey, hotelId);
    icon.className = "fas fa-heart";
  }
  setupSavedHotelsCount();
};

// -------------------------------------------------------------
// NEW DYNAMIC TABS & AI ASSISTANT RENDERING FUNCTIONS
// -------------------------------------------------------------
window.renderAdminSEOTab = function() {
  const seo = cachedSeo || {
    heroTitle: "Find The Perfect Stay Anywhere in Kerala",
    heroSubtext: "Search and book the best hotels, resorts, homestays, and houseboats across God's Own Country.",
    trustBadge: "Trusted by 25,000+ Happy Travelers"
  };

  const titleInput = document.getElementById("seo-hero-title");
  const subtextInput = document.getElementById("seo-hero-subtext");
  const badgeInput = document.getElementById("seo-trust-badge");

  if (titleInput) titleInput.value = seo.heroTitle;
  if (subtextInput) subtextInput.value = seo.heroSubtext;
  if (badgeInput) badgeInput.value = seo.trustBadge;
};

window.renderAdminSettingsTab = function() {
  const s = cachedSettings || {
    platformName: "HotelsNearMeInKerala.com",
    taxRate: 18,
    logoUrl: "/logo.webp",
    notifyEmail: true,
    notifyWhatsapp: true,
    enableSound: true
  };

  const nameInput = document.getElementById("settings-platform-name");
  const taxInput = document.getElementById("settings-tax-rate");
  const logoInput = document.getElementById("settings-logo-url");
  const emailCheck = document.getElementById("settings-notify-email");
  const whatsappCheck = document.getElementById("settings-notify-whatsapp");
  const soundCheck = document.getElementById("settings-enable-sound");

  if (nameInput) nameInput.value = s.platformName;
  if (taxInput) taxInput.value = s.taxRate;
  if (logoInput) logoInput.value = s.logoUrl;
  if (emailCheck) emailCheck.checked = !!s.notifyEmail;
  if (whatsappCheck) whatsappCheck.checked = !!s.notifyWhatsapp;
  if (soundCheck) soundCheck.checked = !!s.enableSound;
};

window.renderAdminSystemUsersTable = function() {
  const tbody = document.getElementById("admin-system-users-tbody");
  if (!tbody) return;

  if (localSystemUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No system administrative users configured.</td></tr>`;
    return;
  }

  tbody.innerHTML = localSystemUsers.map(u => {
    const isMainAdmin = u.email === "directrajeev@gmail.com";
    const deleteBtn = isMainAdmin ? "" : `<button class="btn btn-outline btn-sm text-danger" style="padding:2px 8px; border-color:#FFD2D2; border-radius:15px; font-size:11px;" onclick="window.removeSystemUser('${u.id}')"><i class="fas fa-trash-alt"></i> Remove</button>`;
    
    let roleBg = "#EAF3FC";
    let roleColor = "#2B76D9";
    if (u.role === "Super Admin") {
      roleBg = "#E8F7F3";
      roleColor = "#108569";
    } else if (u.role === "Hotel Manager") {
      roleBg = "#FFF5E6";
      roleColor = "#E58E00";
    }

    return `
      <tr>
        <td><strong>${u.email}</strong></td>
        <td>${u.name}</td>
        <td><span class="status-badge" style="background:${roleBg}; color:${roleColor}; font-weight:600;">${u.role}</span></td>
        <td style="font-size:12px; color:var(--text-secondary); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.permissions}</td>
        <td><span class="status-badge confirmed">${u.status}</span></td>
        <td>${deleteBtn}</td>
      </tr>
    `;
  }).join("");
};

window.removeSystemUser = async function(id) {
  const user = localSystemUsers.find((u) => u.id === id);
  if (!user) return;
  if (confirm(`Are you sure you want to remove the team member ${user.email}?`)) {
    await deleteSystemUser(id);
    await refreshAdminData();
  }
};

function renderGatewaySettingsForm() {
  const s = cachedSettings || {};
  const currencyEl = document.getElementById("gateway-currency");
  const whatsappEl = document.getElementById("gateway-whatsapp");
  const invoiceEl = document.getElementById("gateway-auto-invoice");
  if (currencyEl) currencyEl.value = s.currency || "INR";
  if (whatsappEl) whatsappEl.value = s.whatsappNumber || "919876543210";
  if (invoiceEl) invoiceEl.value = s.autoInvoice !== false ? "yes" : "no";
}

// -------------------------------------------------------------
// MOBILE BOTTOM NAV ACCOUNT CONTROLLERS
// -------------------------------------------------------------
window.openMobileAccountMenu = function() {
  const userJson = localStorage.getItem("hbooking_user");
  if (!userJson) return;
  const user = JSON.parse(userJson);
  const isAdmin = user.role === "admin";

  const optionsContainer = document.querySelector("#modal-mobile-account .mobile-account-options");
  if (!optionsContainer) return;

  const adminOption = isAdmin 
    ? `<a href="/admin.html" class="mob-opt-item" style="display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; font-weight:600; font-size:15px; background:var(--primary-light); color:var(--primary); transition:background 0.2s;"><i class="fas fa-chart-line" style="font-size:18px;"></i> Admin Dashboard</a>`
    : "";

  optionsContainer.innerHTML = `
    <div class="user-info-badge" style="display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--primary-light); border-radius:12px; margin-bottom:12px;">
      <span style="display:flex; width:36px; height:36px; border-radius:50%; background:var(--primary); color:#fff; align-items:center; justify-content:center; font-size:15px; font-weight:700;">${(user.name || user.email)[0].toUpperCase()}</span>
      <div style="display:flex; flex-direction:column;">
        <span style="font-weight:700; font-size:15px; color:var(--dark);">${user.name}</span>
        <span style="font-size:12px; color:var(--text-secondary);">${user.email}</span>
      </div>
    </div>
    ${adminOption}
    <a href="/bookings.html" class="mob-opt-item" style="display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; font-weight:600; font-size:15px; color:var(--text-main); border:1px solid var(--border);"><i class="fas fa-calendar-check" style="font-size:18px; color:var(--primary);"></i> My Bookings</a>
    <button onclick="triggerMobileProfile()" class="mob-opt-item" style="display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; font-weight:600; font-size:15px; color:var(--text-main); border:1px solid var(--border); background:none; text-align:left; cursor:pointer; width:100%;"><i class="fas fa-user-circle" style="font-size:18px; color:var(--primary);"></i> My Profile</button>
    <button onclick="triggerMobileWishlist()" class="mob-opt-item" style="display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; font-weight:600; font-size:15px; color:var(--text-main); border:1px solid var(--border); background:none; text-align:left; cursor:pointer; width:100%;"><i class="fas fa-heart" style="font-size:18px; color:#FF5A5F;"></i> Saved Hotels</button>
    <div style="height:1px; background:var(--border); margin:8px 0;"></div>
    <button onclick="triggerMobileLogout()" class="mob-opt-item" style="display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; font-weight:600; font-size:15px; color:#dc3545; border:1px solid rgba(220,53,69,0.25); background:rgba(220,53,69,0.05); text-align:left; cursor:pointer; width:100%;"><i class="fas fa-sign-out-alt" style="font-size:18px;"></i> Sign Out</button>
  `;

  const modal = document.getElementById("modal-mobile-account");
  modal.classList.add("open");
};

window.closeMobileAccountMenu = function() {
  const modal = document.getElementById("modal-mobile-account");
  if (modal) {
    modal.classList.remove("open");
  }
};

window.triggerMobileProfile = function() {
  closeMobileAccountMenu();
  setTimeout(() => {
    openProfileModal();
  }, 350);
};

window.triggerMobileWishlist = function() {
  closeMobileAccountMenu();
  setTimeout(() => {
    openWishlistDrawer();
  }, 350);
};

window.triggerMobileLogout = async function() {
  closeMobileAccountMenu();
  localStorage.removeItem("hbooking_user");
  localStorage.removeItem("hbooking_session_type");
  if (auth) { try { await signOut(auth); } catch (err) {} }
  window.location.href = "/index.html";
};
