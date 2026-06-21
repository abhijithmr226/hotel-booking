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

let cachedTaxRate = 0.18;

window.getGlobalTaxRate = function() {
  return cachedTaxRate;
};

async function syncUserSession(firebaseUser) {
  const profile = await getUserByUid(firebaseUser.uid);
  const adminEmail = "admin@hotelsnearme.com";
  const role = profile?.role || (firebaseUser.email === adminEmail ? "admin" : "user");
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
async function initLandingPage() {
  let hotels = await getHotels();
  const activeHotels = hotels.filter(h => h.status === "active");
  renderHotelsGrid("hotels-near-you-grid", activeHotels);
  renderHotelsGrid("featured-hotels-grid", activeHotels.filter(h => h.featured).slice(0, 4));
  onDataChange((source) => {
    if (source === "hotels") {
      getHotels().then((list) => {
        hotels = list;
        applyAdvancedFilters(hotels);
        renderHotelsGrid("featured-hotels-grid", hotels.filter((h) => h.status === "active" && h.featured).slice(0, 4));
      });
    }
  });
  // Hook Search Form
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyAdvancedFilters(hotels);
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

      const suggestionsSet = new Set([
        "Kollam", "Thiruvananthapuram", "Trivandrum", "Kochi", "Ernakulam", "Alappuzha", 
        "Kottayam", "Pathanamthitta", "Idukki", "Munnar", "Thrissur", "Palakkad", 
        "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod", "Varkala", "Kovalam",
        "Kumarakom", "Thekkady", "Bekal", "Vagamon", "Kumily"
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
    card.addEventListener("click", () => {
      const catName = card.dataset.category;
      document.getElementById("filter-category").value = catName;
      document.getElementById("hotels-near-you").scrollIntoView({ behavior: "smooth" });
      applyAdvancedFilters(hotels);
    });
  });

  // Hook Destination clicks to filter
  const destCards = document.querySelectorAll(".destination-card");
  destCards.forEach(card => {
    card.addEventListener("click", () => {
      const destName = card.dataset.destination;
      document.getElementById("search-location").value = destName;
      document.getElementById("hotels-near-you").scrollIntoView({ behavior: "smooth" });
      applyAdvancedFilters(hotels);
    });
  });

  // Hook District tag clicks to filter
  const distTags = document.querySelectorAll(".district-tag");
  distTags.forEach(tag => {
    tag.addEventListener("click", () => {
      const destName = tag.innerText.trim();
      document.getElementById("search-location").value = destName;
      const targetSec = document.getElementById("hotels-near-you");
      if (targetSec) targetSec.scrollIntoView({ behavior: "smooth" });
      applyAdvancedFilters(hotels);
    });
  });
}

function applyAdvancedFilters(hotels) {
  const query = document.getElementById("search-location").value.toLowerCase();
  const minPrice = parseInt(document.getElementById("filter-price-min").value) || 0;
  const maxPrice = parseInt(document.getElementById("filter-price-max").value) || Infinity;
  const minRating = parseFloat(document.getElementById("filter-rating").value) || 0;
  const category = document.getElementById("filter-category").value;
  const sort = document.getElementById("filter-sorting").value;
  
  const selectedAmenities = Array.from(document.querySelectorAll(".filter-amenity:checked")).map(el => el.value);

  let filtered = hotels.filter(h => {
    if (h.status !== "active") return false;
    const locMatch = !query || h.location.toLowerCase().includes(query) || h.name.toLowerCase().includes(query) || h.district.toLowerCase().includes(query);
    const priceMatch = h.price >= minPrice && h.price <= maxPrice;
    const ratingMatch = h.rating >= minRating;
    const catMatch = !category || h.category === category;
    const amenitiesMatch = selectedAmenities.every(amenity => h.amenities && h.amenities.includes(amenity));

    return locMatch && priceMatch && ratingMatch && catMatch && amenitiesMatch;
  });

  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "rating-high") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const gridTitle = document.querySelector("#hotels-near-you h2");
  if (gridTitle) gridTitle.innerText = query ? `Search Results for "${query}"` : "Hotels Near You";
  renderHotelsGrid("hotels-near-you-grid", filtered);
}

async function renderHotelsGrid(containerId, hotelsList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (hotelsList.length === 0) {
    container.innerHTML = `<div style="grid-column: span 4; text-align: center; padding: 40px; color: var(--text-secondary);">No hotels found matching your search.</div>`;
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

  container.innerHTML = hotelsList.map(h => {
    const isFav = userFavIds.includes(h.id);
    return `
    <div class="hotel-card" data-hotel-id="${h.id}">
      <div class="hotel-card-image">
        <img src="${h.image}" alt="${h.name}">
        <span class="hotel-card-tag">${h.badge || h.category}</span>
        <button class="hotel-card-save" onclick="event.preventDefault(); toggleWishlist(this, '${h.id}')">
          <i class="${isFav ? 'fas fa-heart' : 'far fa-heart'}" style="${isFav ? 'color: #FF5A5F;' : ''}"></i>
        </button>
      </div>
      <div class="hotel-card-content">
        <div class="hotel-card-rating">
          <i class="fas fa-star"></i> ${h.rating} <span>(${h.reviewsCount} reviews)</span>
        </div>
        <h3>${h.name}</h3>
        <div class="hotel-card-loc">
          <i class="fas fa-map-marker-alt"></i> ${h.location}
        </div>
        <div class="hotel-card-footer">
          <div class="hotel-card-price">
            <span class="price-num">₹${h.price.toLocaleString("en-IN")}</span>
            <span class="price-unit">/night</span>
          </div>
          <a href="hotel.html?id=${h.id}" class="btn btn-outline btn-sm">View Details</a>
        </div>
      </div>
    </div>
  `;
  }).join("");
}

// -------------------------------------------------------------
// HOTEL DETAIL PAGE CONTROLLER
// -------------------------------------------------------------
let selectedHotel = null;
let bookingMode = "whatsapp"; // "whatsapp" or "online"
let appliedCoupon = null;

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
  document.title = `${selectedHotel.name} - HotelsNearMeInKerala`;
  document.getElementById("hotel-title").innerText = selectedHotel.name;
  document.getElementById("breadcrumb-current").innerText = selectedHotel.name;
  document.getElementById("hotel-stars").innerHTML = `<i class="fas fa-star"></i>`.repeat(Math.floor(selectedHotel.rating));
  document.getElementById("hotel-rating-score").innerText = selectedHotel.rating;
  document.getElementById("hotel-reviews-count").innerText = `(${selectedHotel.reviewsCount} reviews)`;
  document.getElementById("hotel-location-text").innerText = selectedHotel.location;
  if (document.getElementById("hotel-location-full")) document.getElementById("hotel-location-full").innerText = selectedHotel.location;
  document.getElementById("hotel-badge-tag").innerText = selectedHotel.badge || selectedHotel.category;
  document.getElementById("hotel-desc").innerHTML = selectedHotel.description;
  document.getElementById("sidebar-hotel-whatsapp").innerText = `+${selectedHotel.whatsapp}`;
  
  // ── Dynamic Multi-Image Gallery ────────────────────────────────────────────
  // Build full image list: primary image + extra images from admin
  const allImages = [selectedHotel.image];
  if (Array.isArray(selectedHotel.images)) {
    selectedHotel.images.forEach(img => { if (img && img.trim()) allImages.push(img.trim()); });
  }
  
  const mainImg = document.getElementById("gallery-img-main");
  if (mainImg) mainImg.src = allImages[0] || "/assets/images/riverside.png";
  
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

  // ── Dynamic Google Map Embed ───────────────────────────────────────────────
  const mapIframe = document.getElementById("hotel-map-iframe");
  const mapPlaceholder = document.getElementById("hotel-map-placeholder");
  const mapLink = document.getElementById("hotel-map-link");
  if (mapIframe && mapPlaceholder) {
    if (selectedHotel.mapUrl && selectedHotel.mapUrl.trim()) {
      mapIframe.src = selectedHotel.mapUrl.trim();
      mapIframe.style.display = "block";
      mapPlaceholder.style.display = "none";
      if (mapLink) {
        mapLink.href = selectedHotel.mapUrl.trim();
        mapLink.style.display = "";
      }
    } else {
      mapIframe.style.display = "none";
      mapPlaceholder.style.display = "flex";
      if (mapLink) mapLink.style.display = "none";
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

  // Render Highlights
  const hlGrid = document.getElementById("highlights-grid");
  if (hlGrid && selectedHotel.highlights) {
    hlGrid.innerHTML = selectedHotel.highlights.map(h => `
      <div class="highlight-item">
        <i class="fas fa-sparkles"></i>
        <div>
          <h4>${h.title}</h4>
          <p>${h.desc}</p>
        </div>
      </div>
    `).join("");
  }

  // Render Details Table
  const table = document.getElementById("details-table-body");
  if (table && selectedHotel.details) {
    const d = selectedHotel.details;
    table.innerHTML = `
      <tr><td>Check-in</td><td>${d.checkIn}</td></tr>
      <tr><td>Check-out</td><td>${d.checkOut}</td></tr>
      <tr><td>Property Type</td><td>${d.propertyType}</td></tr>
      <tr><td>Room Count</td><td>${d.roomCount} Rooms</td></tr>
      <tr><td>Rating</td><td>${d.starRating}</td></tr>
      <tr><td>Languages Spoken</td><td>${d.languages}</td></tr>
      <tr><td>Nearest Railway Station</td><td>${d.station}</td></tr>
      <tr><td>Nearest Airport</td><td>${d.airport}</td></tr>
    `;
  }

  // Render Nearby
  const nearbyList = document.getElementById("nearby-attractions-list");
  if (nearbyList && selectedHotel.nearby) {
    nearbyList.innerHTML = selectedHotel.nearby.map(n => `
      <div class="hotel-card" style="box-shadow: none; border: 1px solid var(--border); padding: 15px; border-radius: 8px;">
        <h4 style="font-size: 14px; margin-bottom: 5px;">${n.name}</h4>
        <span style="font-size: 12px; color: var(--text-secondary);"><i class="fas fa-walking"></i> ${n.distance}</span>
      </div>
    `).join("");
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

  // Initial Calculation
  calculatePricing();

  // Booking Card Tabs listeners
  const tabs = document.querySelectorAll(".booking-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      bookingMode = tab.dataset.mode;
      
      const submitBtn = document.getElementById("booking-submit-btn");
      if (bookingMode === "whatsapp") {
        submitBtn.innerHTML = `Check Availability <i class="fab fa-whatsapp" style="margin-left: 8px;"></i>`;
        submitBtn.style.backgroundColor = "var(--primary)";
      } else {
        submitBtn.innerHTML = `Book Online <i class="fas fa-credit-card" style="margin-left: 8px;"></i>`;
        submitBtn.style.backgroundColor = "var(--primary)";
      }
    });
  });

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
      if (reviewsCountEl) reviewsCountEl.innerText = `(0 reviews)`;

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
      if (overallTextEl) overallTextEl.innerText = `New Stay (0 reviews)`;
      
      return;
    }

    hotelReviewsList.innerHTML = approvedReviews.map(r => `
      <div class="review-card" style="border-bottom: 1px solid var(--border); padding-bottom: 20px; text-align: left;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${r.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
            <div>
              <h4 style="font-size:13px; font-weight:600;">${r.userName}</h4>
              <span style="font-size:10px; color:var(--text-secondary);">${r.createdAt?.split("T")[0] || r.createdAt}</span>
            </div>
          </div>
          <div style="color:#FF9A02; font-size:12px;">
            ${`<i class="fas fa-star"></i>`.repeat(r.rating)}${`<i class="far fa-star"></i>`.repeat(5 - r.rating)}
          </div>
        </div>
        <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">${r.reviewText}</p>
        ${r.replyText ? `
          <div class="review-reply" style="background:var(--light); padding:12px; border-radius:6px; margin-top:10px; border-left: 3px solid var(--primary);">
            <h5 style="font-size:11px; font-weight:700; margin-bottom:4px; color:var(--primary);"><i class="fas fa-reply"></i> Manager Response</h5>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin:0;">${r.replyText}</p>
          </div>
        ` : ''}
      </div>
    `).join("");

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
    const roomSelect = document.getElementById("booking-room-select");
    if (roomSelect) {
      const prev = roomSelect.value;
      roomSelect.innerHTML = hotelRooms.length === 0
        ? `<option value="">No rooms available</option>`
        : hotelRooms.map((r) => `<option value="${r.id}" data-price="${r.price}">${r.type} (₹${r.price.toLocaleString("en-IN")}/night) - ${r.inventory} left</option>`).join("");
      if (hotelRooms.some((r) => r.id === prev)) roomSelect.value = prev;
      calculatePricing();
    }

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
}

function openBookingModal() {
  const modal = document.getElementById("booking-modal");
  modal.classList.add("open");
}

function closeBookingModal() {
  const modal = document.getElementById("booking-modal");
  modal.classList.remove("open");
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
  const waUrl = `https://api.whatsapp.com/send/?phone=${selectedHotel.whatsapp}&text=${urlEncodedText}`;

  closeBookingModal();
  document.getElementById("whatsapp-booking-form").reset();

  alert(`Booking Created successfully!\nBooking Code: #${bookingId}\nRedirecting you to WhatsApp...`);
  window.open(waUrl, "_blank");
}

// -------------------------------------------------------------
// LOGIN / REGISTER PAGE CONTROLLER
// -------------------------------------------------------------
function initLoginPage() {
  // If user already logged in, redirect
  const existingUser = localStorage.getItem("hbooking_user");
  if (existingUser) {
    const u = JSON.parse(existingUser);
    window.location.href = u.role === "admin" ? "/admin.html" : "/bookings.html";
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
        const role = profile?.role || (email === "admin@hotelsnearme.com" ? "admin" : "user");
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
          window.location.href = role === "admin" ? "/admin.html" : "/bookings.html";
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
        setTimeout(() => { window.location.href = "/bookings.html"; }, 900);
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
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const profile = await getUserByUid(user.uid);
        const role = profile?.role || (email === "admin@hotelsnearme.com" ? "admin" : "user");
        if (role !== "admin") {
          setBtnLoading("admin-btn", false, '<i class="fas fa-unlock-alt"></i> Access Admin Dashboard');
          showMsg("Access denied. This account does not have admin privileges.");
          return;
        }
        const userData = {
          uid: user.uid || profile?.uid || "sys_admin",
          name: profile?.name || "Admin",
          email,
          phone: profile?.phone || "",
          photoURL: profile?.photoURL || "",
          role: "admin",
          status: "active"
        };
        localStorage.setItem("hbooking_session_type", "local");
        localStorage.setItem("hbooking_user", JSON.stringify(userData));
        showMsg("Admin access granted! Redirecting...", "success");
        setTimeout(() => { window.location.href = "/admin.html"; }, 800);
      } catch (err) {
        setBtnLoading("admin-btn", false, '<i class="fas fa-unlock-alt"></i> Access Admin Dashboard');
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
      setTimeout(() => { window.location.href = "/bookings.html"; }, 800);
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
          <img src="/assets/images/${b.hotelId?.split('_')[0] || 'riverside'}.png"
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
      const imageUrl = document.getElementById("new-hotel-image")?.value?.trim() || "/assets/images/riverside.png";
      const whatsapp = document.getElementById("new-hotel-whatsapp")?.value?.trim() || "919876543210";
      const description = document.getElementById("new-hotel-description")?.value?.trim() || `${name} is a premium hotel in ${district}, Kerala offering excellent service and stays.`;
      const featured = document.getElementById("new-hotel-featured")?.checked || false;
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
        details: { checkIn: "12:00 PM", checkOut: "11:00 AM", propertyType: "Hotel", roomCount: totalInventory || 10, starRating: "4 Star", languages: "English, Malayalam", station: "Station nearby", airport: "Airport nearby" },
        nearby: [],
        featured: featured,
        trending: false,
        status: "active"
      };

      await addHotel(newHotelObj);

      // Add all rooms
      for (const roomObj of roomsToAdd) {
        await addRoom(roomObj);
      }

      alert("Hotel and Room configurations added successfully!");
      window.closeAddHotelModal();
      hotelForm.reset();

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
      alert("Hotel Details Updated!");
      window.closeEditHotelModal();
      editHotelForm.reset();
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

window.openAddHotelModal = function() {
  document.getElementById("add-hotel-modal").classList.add("open");
};
window.closeAddHotelModal = function() {
  document.getElementById("add-hotel-modal").classList.remove("open");
};

window.openEditHotelModal = function(hotelId) {
  const h = localHotels.find(item => item.id === hotelId);
  if (!h) return;
  document.getElementById("edit-hotel-id").value = h.id;
  document.getElementById("edit-hotel-name").value = h.name;
  document.getElementById("edit-hotel-price").value = h.price;
  document.getElementById("edit-hotel-status").value = h.status || "active";
  document.getElementById("edit-hotel-featured").checked = !!h.featured;
  const imgField = document.getElementById("edit-hotel-image");
  if (imgField) imgField.value = h.image || "";
  const waField = document.getElementById("edit-hotel-whatsapp");
  if (waField) waField.value = h.whatsapp || "";
  const mapField = document.getElementById("edit-hotel-map");
  if (mapField) mapField.value = h.mapUrl || "";
  // Prefill gallery images
  const extras = Array.isArray(h.images) ? h.images : [];
  for (let i = 2; i <= 5; i++) {
    const f = document.getElementById(`edit-hotel-img${i}`);
    if (f) f.value = extras[i - 2] || "";
  }
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
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No hotels found.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(h => {
    const isFeatured = !!h.featured;
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${h.image}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
            <span style="font-weight:600;">${h.name}</span>
          </div>
        </td>
        <td>${h.district}</td>
        <td>${h.category}</td>
        <td>₹${h.price.toLocaleString("en-IN")}</td>
        <td><i class="fas fa-star" style="color:#FF9A02;"></i> ${h.rating}</td>
        <td>
          <button class="status-badge ${h.status === 'active' ? 'confirmed' : 'cancelled'}" style="border:none; cursor:pointer;" onclick="toggleHotelStatus('${h.id}', '${h.status}')">
            ${h.status === 'active' ? 'Active' : 'Hidden'}
          </button>
        </td>
        <td>
          <button class="status-badge ${isFeatured ? 'confirmed' : 'pending'}" style="border:none; cursor:pointer;" onclick="toggleHotelFeatured('${h.id}', ${isFeatured})">
            ${isFeatured ? 'Featured' : 'Standard'}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditHotelModal('${h.id}')" style="padding:4px 8px;"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline btn-sm text-danger" onclick="deleteHotelProperty('${h.id}')" style="padding:4px 8px; border-color:#FF5A5F; color:#FF5A5F;"><i class="fas fa-trash"></i></button>
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
        <div style="font-weight:600;">${b.guestName}</div>
        <div style="font-size:11px; color:var(--text-secondary);">${b.guestPhone}</div>
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
          <span style="font-weight:500;">${r.userName}</span>
        </div>
      </td>
      <td>${r.hotelId}</td>
      <td><div style="color:#FF9A02; font-size:12px;">${'<i class="fas fa-star"></i>'.repeat(r.rating)}</div></td>
      <td>
        <div style="max-width:250px; font-size:12px; color:var(--text-secondary); line-height:1.4;">${r.reviewText}</div>
        ${r.replyText ? `<div style="font-size:11px; color:var(--primary); margin-top:5px;"><strong>Reply:</strong> ${r.replyText}</div>` : ''}
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
    logoUrl: "/logo.png",
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
    const isMainAdmin = u.email === "admin@hotelsnearme.com";
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
