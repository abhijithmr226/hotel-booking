/**
 * seo-enhancements.js
 * SEO, local-search & UX enhancements for HotelsNearMeInKerala.com
 * GA4: G-30NNKW9MXH
 * Safe to import after app.js — no conflicts with existing hotel card rendering.
 */

import { getHotels, getFavorites } from './data.js';

/* ─────────────────────────────────────────────────────
   1. GA4 Event Helpers
───────────────────────────────────────────────────── */
function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

/* ─────────────────────────────────────────────────────
   2. Geolocation — "Near Me" button
───────────────────────────────────────────────────── */
const KERALA_BOUNDS = { latMin: 8.0, latMax: 12.8, lngMin: 74.8, lngMax: 77.4 };

function isInKerala(lat, lng) {
  return lat >= KERALA_BOUNDS.latMin && lat <= KERALA_BOUNDS.latMax &&
         lng >= KERALA_BOUNDS.lngMin && lng <= KERALA_BOUNDS.lngMax;
}

// Haversine distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Store user's position globally so distance sort can use it
window._userGeoLat = null;
window._userGeoLng = null;

function initUseMyLocation() {
  const btn = document.getElementById('btn-use-location');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Locating…</span>';
    trackEvent('use_my_location_click');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window._userGeoLat = latitude;
        window._userGeoLng = longitude;

        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-location-arrow"></i><span>Near Me</span>';
        btn.classList.add('active');

        if (!isInKerala(latitude, longitude)) {
          // User is outside Kerala — still search with district = nearest
          const searchInput = document.getElementById('search-location');
          if (searchInput) {
            searchInput.value = 'Hotels near me in Kerala';
            const form = document.getElementById('search-form');
            if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        } else {
          // Find nearest Kerala district
          const nearestDistrict = getNearestDistrict(latitude, longitude);
          const searchInput = document.getElementById('search-location');
          if (searchInput) {
            searchInput.value = nearestDistrict;
            const form = document.getElementById('search-form');
            if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }

        // Also activate distance sort
        const sortSelect = document.getElementById('filter-sorting');
        if (sortSelect) {
          sortSelect.value = 'distance';
          sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        trackEvent('geolocation_success', {
          lat: latitude.toFixed(3),
          lng: longitude.toFixed(3),
          in_kerala: isInKerala(latitude, longitude)
        });
      },
      (err) => {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-location-arrow"></i><span>Near Me</span>';
        console.warn('Geolocation error:', err.message);
        trackEvent('geolocation_error', { error: err.message });
        if (err.code === err.PERMISSION_DENIED) {
          showGeoAlert('Location access was denied. Please enable location permission and try again.');
        }
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
}

function showGeoAlert(msg) {
  const alert = document.createElement('div');
  alert.className = 'geo-alert';
  alert.textContent = msg;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}

// Kerala district centroids (approximate)
const DISTRICT_CENTROIDS = [
  { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { name: 'Kollam', lat: 8.8932, lng: 76.6141 },
  { name: 'Pathanamthitta', lat: 9.2648, lng: 76.7870 },
  { name: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
  { name: 'Kottayam', lat: 9.5916, lng: 76.5222 },
  { name: 'Idukki', lat: 9.9167, lng: 77.1000 },
  { name: 'Ernakulam', lat: 10.0161, lng: 76.3270 },
  { name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
  { name: 'Palakkad', lat: 10.7867, lng: 76.6548 },
  { name: 'Malappuram', lat: 11.0730, lng: 76.0740 },
  { name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  { name: 'Wayanad', lat: 11.6854, lng: 76.1320 },
  { name: 'Kannur', lat: 11.8745, lng: 75.3704 },
  { name: 'Kasaragod', lat: 12.4996, lng: 74.9869 },
];

function getNearestDistrict(lat, lng) {
  let nearest = DISTRICT_CENTROIDS[0];
  let minDist = Infinity;
  for (const d of DISTRICT_CENTROIDS) {
    const dist = haversineKm(lat, lng, d.lat, d.lng);
    if (dist < minDist) { minDist = dist; nearest = d; }
  }
  return nearest.name;
}

/* ─────────────────────────────────────────────────────
   3. Distance Sort — hook into filter-sorting change
───────────────────────────────────────────────────── */
function initDistanceSort() {
  const sortSelect = document.getElementById('filter-sorting');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    if (e.target.value !== 'distance') return;
    if (window._userGeoLat === null) {
      // Prompt geolocation first
      const btn = document.getElementById('btn-use-location');
      if (btn) btn.click();
    }
  });
}

/* ─────────────────────────────────────────────────────
   4. Hero Quick-Links (data-search attribute)
───────────────────────────────────────────────────── */
function initHeroQuickLinks() {
  document.querySelectorAll('.hero-ql[data-search]').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.search;
      const input = document.getElementById('search-location');
      const form = document.getElementById('search-form');
      if (input) input.value = query;
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      trackEvent('quick_link_click', { destination: query });
    });
  });
}

/* ─────────────────────────────────────────────────────
   5. Recently Viewed Hotels (localStorage)
───────────────────────────────────────────────────── */
const RECENTLY_VIEWED_KEY = 'knm_recently_viewed';
const MAX_RECENTLY_VIEWED = 6;

function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
  } catch { return []; }
}

function saveRecentlyViewed(list) {
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch {}
}

export function addToRecentlyViewed(hotel) {
  // Called from hotel.html page
  const list = getRecentlyViewed().filter(h => h.id !== hotel.id);
  list.unshift(hotel);
  saveRecentlyViewed(list.slice(0, MAX_RECENTLY_VIEWED));
}

function renderRecentlyViewed() {
  const section = document.getElementById('recently-viewed-section');
  const grid = document.getElementById('recently-viewed-grid');
  const clearBtn = document.getElementById('clear-recently-viewed');
  if (!section || !grid) return;

  const list = getRecentlyViewed();
  if (list.length === 0) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  grid.innerHTML = list.map(h => `
    <a href="/hotel?id=${h.id}" class="rv-card" onclick="window._trackHotelClick && window._trackHotelClick('${h.id}', 'recently_viewed')">
      <img src="${h.image || '/dest/kochi.webp'}" alt="${h.name}" loading="lazy" onerror="this.src='/dest/kochi.webp'">
      <div class="rv-card-body">
        <h4>${h.name}</h4>
        <p>${h.location || 'Kerala'}</p>
        ${h.price ? `<span class="rv-price">₹${Number(h.price).toLocaleString('en-IN')}/night</span>` : ''}
      </div>
    </a>
  `).join('');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      saveRecentlyViewed([]);
      section.style.display = 'none';
    });
  }
}

/* ─────────────────────────────────────────────────────
   6. FAQ Accordion
───────────────────────────────────────────────────── */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      document.querySelectorAll('.faq-item').forEach(el => {
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        el.querySelector('.faq-answer').style.maxHeight = '0';
        el.querySelector('.faq-answer').style.opacity = '0';
        el.classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        item.classList.add('open');
        trackEvent('faq_open', { question: btn.textContent.trim().slice(0, 60) });
      }
    });
  });
}

/* ─────────────────────────────────────────────────────
   7. Dark Mode Toggle
───────────────────────────────────────────────────── */
function initDarkMode() {
  // Create toggle button if it doesn't exist
  let toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'dark-mode-toggle';
    toggle.className = 'dark-mode-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(toggle);
  }

  // Restore saved preference
  const saved = localStorage.getItem('knm_theme') || 'light';
  applyTheme(saved, toggle);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, toggle);
    localStorage.setItem('knm_theme', next);
    trackEvent('dark_mode_toggle', { theme: next });
  });
}

function applyTheme(theme, btn) {
  document.documentElement.setAttribute('data-theme', theme);
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
}

/* ─────────────────────────────────────────────────────
   8. Track Search & Hotel Card Clicks for GA4
───────────────────────────────────────────────────── */
function initSearchTracking() {
  const form = document.getElementById('search-form');
  if (form) {
    form.addEventListener('submit', () => {
      const query = document.getElementById('search-location')?.value || '';
      trackEvent('hotel_search', { search_term: query });
    });
  }
}

// Expose a global so hotel card click handlers can call it
window._trackHotelClick = function(hotelId, source = 'listing') {
  trackEvent('hotel_card_click', { hotel_id: hotelId, source });
};

/* ─────────────────────────────────────────────────────
   9. Nearby Hotels Section Enhancement
───────────────────────────────────────────────────── */
function enhanceNearbySection() {
  const section = document.getElementById('nearby-hotels-section');
  if (!section) return;
  // Add aria-live for dynamic updates
  section.setAttribute('aria-live', 'polite');
  section.setAttribute('aria-atomic', 'false');
}

/* ─────────────────────────────────────────────────────
   10. SEO Landing Pages Dynamic Loading
   ───────────────────────────────────────────────────── */
async function initSeoLandingPage() {
  const configs = [
    { id: 'kochi-hotels-grid', district: 'Ernakulam', filter: h => h.district === 'Ernakulam' },
    { id: 'kollam-hotels-grid', district: 'Kollam', filter: h => h.district === 'Kollam' },
    { id: 'varkala-hotels-grid', district: 'Thiruvananthapuram', filter: h => h.district === 'Thiruvananthapuram' && (h.name.toLowerCase().includes('varkala') || h.location.toLowerCase().includes('varkala')) },
    { id: 'munnar-hotels-grid', district: 'Idukki', filter: h => h.district === 'Idukki' && (h.name.toLowerCase().includes('munnar') || h.location.toLowerCase().includes('munnar')) },
    { id: 'trivandrum-hotels-grid', district: 'Thiruvananthapuram', filter: h => h.district === 'Thiruvananthapuram' && !h.name.toLowerCase().includes('varkala') && !h.location.toLowerCase().includes('varkala') },
    { id: 'budget-hotels-grid', filter: h => h.price <= 7000 || h.category === 'Budget Hotels' || h.category === 'Backpacker Hostels', sort: (a, b) => a.price - b.price },
    { id: 'resorts-grid', filter: h => h.category.toLowerCase().includes('resort') || h.name.toLowerCase().includes('resort') }
  ];

  const activeConfig = configs.find(c => document.getElementById(c.id));
  if (!activeConfig) return;

  const container = document.getElementById(activeConfig.id);
  container.innerHTML = `
    <div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-secondary);">
      <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px; color: var(--primary);"></i>
      <p>Loading verified hotels...</p>
    </div>
  `;

  try {
    const hotels = await getHotels();
    const active = hotels.filter(h => h.status === 'active' && activeConfig.filter(h));
    
    if (activeConfig.sort) {
      active.sort(activeConfig.sort);
    } else {
      active.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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

    if (active.length === 0) {
      container.innerHTML = `
        <div style="grid-column: span 3; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <div style="font-size:48px; margin-bottom:16px;">🔍</div>
          <h3 style="font-size:18px; color:var(--text-main); margin-bottom:8px;">No hotels found</h3>
          <p style="font-size:14px;">We are adding more verified hotels in this area soon. Check back shortly!</p>
        </div>`;
      return;
    }

    container.innerHTML = active.map(h => {
      const price = h.price || 0;
      const rating = h.rating || 0;
      const reviewsCount = h.reviewsCount || 0;
      const isFav = userFavIds.includes(h.id);
      return `
        <div class="hotel-card" data-hotel-id="${h.id}" onclick="window.location.href='/hotel.html?id=${h.id}'">
          <div class="hotel-card-image">
            <img src="${h.image || '/assets/images/riverside.webp'}" alt="${h.details?.imageAlt || h.name}" loading="lazy" onerror="this.src='/assets/images/riverside.webp'">
            <span class="hotel-card-tag">${h.badge || h.category || ''}</span>
            <button class="hotel-card-save" onclick="event.stopPropagation(); event.preventDefault(); window.toggleWishlist && window.toggleWishlist(this, '${h.id}')">
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
    }).join('');
  } catch (err) {
    console.error('Error loading SEO landing page hotels:', err);
    container.innerHTML = `
      <div style="grid-column: span 3; text-align: center; padding: 40px; color: #D32F2F;">
        <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 12px;"></i>
        <p>Error loading hotels. Please refresh the page.</p>
      </div>
    `;
  }
}

/* ─────────────────────────────────────────────────────
   11. Init all
   ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initUseMyLocation();
  initDistanceSort();
  initHeroQuickLinks();
  renderRecentlyViewed();
  initFaqAccordion();
  initDarkMode();
  initSearchTracking();
  enhanceNearbySection();
  initSeoLandingPage();
});
