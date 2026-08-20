import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 80,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url ? req.url.split('?')[0] : '';
        if (path === '/sitemap.xml') {
          try {
            const { default: handler } = await import('./api/sitemap.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            console.error("Local sitemap dev server error:", err);
            next();
          }
        } else if (path === '/google-hotels/hotels.xml') {
          try {
            const { default: handler } = await import('./api/google-hotels/hotels.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            next();
          }
        } else if (path === '/google-hotels/prices.xml') {
          try {
            const { default: handler } = await import('./api/google-hotels/prices.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            next();
          }
        } else if (path === '/google-hotels/pos.xml') {
          try {
            const { default: handler } = await import('./api/google-hotels/pos.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            next();
          }
        } else {
          next();
        }
      });
    }
  },
  preview: {
    port: 4173,
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url ? req.url.split('?')[0] : '';
        if (path === '/sitemap.xml') {
          try {
            const { default: handler } = await import('./api/sitemap.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            console.error("Local sitemap preview server error:", err);
            next();
          }
        } else if (path === '/google-hotels/hotels.xml') {
          try {
            const { default: handler } = await import('./api/google-hotels/hotels.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            next();
          }
        } else if (path === '/google-hotels/prices.xml') {
          try {
            const { default: handler } = await import('./api/google-hotels/prices.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            next();
          }
        } else if (path === '/google-hotels/pos.xml') {
          try {
            const { default: handler } = await import('./api/google-hotels/pos.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) { res.setHeader(name, value); },
              status(code) { this.statusCode = code; res.statusCode = code; return this; },
              send(body) { res.end(body); }
            };
            await handler(req, mockRes);
          } catch (err) {
            next();
          }
        } else {
          next();
        }
      });
    }
  },
  build: {
    target: 'es2018',           // modern browsers — smaller output than es5
    chunkSizeWarningLimit: 400, // warn when any chunk exceeds 400KB
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hotel: resolve(__dirname, 'hotel.html'),
        login: resolve(__dirname, 'login.html'),
        admin: resolve(__dirname, 'admin.html'),
        bookings: resolve(__dirname, 'bookings.html'),
        about: resolve(__dirname, 'about.html'),
        cancellation: resolve(__dirname, 'cancellation.html'),
        categories: resolve(__dirname, 'categories.html'),
        contact: resolve(__dirname, 'contact.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        kochi: resolve(__dirname, 'hotels-in-kochi.html'),
        kollam: resolve(__dirname, 'hotels-in-kollam.html'),
        varkala: resolve(__dirname, 'hotels-in-varkala.html'),
        munnar: resolve(__dirname, 'hotels-in-munnar.html'),
        trivandrum: resolve(__dirname, 'hotels-in-thiruvananthapuram.html'),
        budgetHotels: resolve(__dirname, 'budget-hotels-in-kerala.html'),
        resorts: resolve(__dirname, 'resorts-in-kerala.html'),
        kochiAirport: resolve(__dirname, 'hotels-near-kochi-airport.html'),
        luluMall: resolve(__dirname, 'hotels-near-lulu-mall.html'),
        marineDrive: resolve(__dirname, 'hotels-near-marine-drive.html'),
        technopark: resolve(__dirname, 'hotels-near-technopark-trivandrum.html'),
        jatayu: resolve(__dirname, 'hotels-near-jatayu-earth-center.html'),
        kollamBeach: resolve(__dirname, 'hotels-in-kollam-beach.html'),
        munroeIsland: resolve(__dirname, 'resorts-in-munroe-island.html'),
        wonderla: resolve(__dirname, 'hotels-near-wonderla-kochi.html'),
        listYourHotel: resolve(__dirname, 'list-your-hotel.html'),
        wayanad: resolve(__dirname, 'hotels-in-wayanad.html'),
        kumarakom: resolve(__dirname, 'resorts-in-kumarakom.html'),
        alleppeyHouseboats: resolve(__dirname, 'houseboats-in-alleppey.html'),
        thekkady: resolve(__dirname, 'resorts-in-thekkady.html'),
        kovalam: resolve(__dirname, 'hotels-in-kovalam.html'),
        vagamon: resolve(__dirname, 'resorts-in-vagamon.html'),
        treehouse: resolve(__dirname, 'treehouse-resorts-in-kerala.html'),
        ayurveda: resolve(__dirname, 'ayurveda-resorts-in-kerala.html'),
        kozhikode: resolve(__dirname, 'hotels-in-kozhikode.html'),
        thrissur: resolve(__dirname, 'hotels-in-thrissur.html'),
        bekal: resolve(__dirname, 'resorts-in-bekal.html'),
        athirappilly: resolve(__dirname, 'hotels-near-athirappilly-waterfalls.html'),
      },
      output: {
        // Split vendor libs into a shared cached chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Firebase: large, versioned — keep separate so cached across pages
            if (id.includes('firebase')) return 'vendor-firebase';
            // Supabase: also large and versioned
            if (id.includes('@supabase') || id.includes('supabase')) return 'vendor-supabase';
            // Everything else in node_modules
            return 'vendor';
          }
        },
      },
    },
  },
});
