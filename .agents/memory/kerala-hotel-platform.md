---
name: Kerala Hotel Booking Platform
description: Stack, data flow, key bugs fixed and lessons learned for hotel-booking-kerala project
---

## Stack
- Frontend: Vanilla JS + Vite (port 5000)
- Backend: Express.js (port 3000), proxied via Vite /api → localhost:3000
- Database: Replit built-in PostgreSQL via DATABASE_URL secret
- Auth: Firebase (client-side only, public config in src/firebase.js is safe)
- Realtime: 6-second polling in data.js initRealtimeData()

## Data Flow
Admin action → mutateData() → PUT/POST to Express API → PostgreSQL → refreshAllData() → notifyChange() → onDataChange listeners → re-render on website

## Key Bugs Fixed
- applyAdvancedFilters must be async (uses await renderHotelsGrid)
- Hotel card links must use absolute `/hotel.html?id=` (not relative `hotel.html?id=`)
- dispatchEvent for form submit needs `{bubbles:true, cancelable:true}` or e.preventDefault() is a no-op
- Hotel detail page reviews section OVERWRITES `hotel-reviews-count` with `(0 reviews)` when reviews table is empty — must use `selectedHotel.reviewsCount` as fallback
- Breadcrumb in hotel.html was hardcoded "Kollam" — fixed to dynamic via IDs `breadcrumb-district` and `breadcrumb-hotels-in`
- Admin edit form used `alert()` — replaced with `showAdminToast()`

## Database Seed
- schema.sql has NO auto-seed on startup (tables created only when missing)
- 12 hotels seeded manually via executeSql code execution tool
- schema.sql updated with INSERT ON CONFLICT DO NOTHING for all 12 hotels + 3 coupons
- Hotel data uses Unsplash image URLs (no local assets needed for hotel cards)

**Why:** Database was fresh with 0 hotels — schema.sql line 143 said "Add via Admin Dashboard" with no seed data, causing blank hotel grids on first run.
