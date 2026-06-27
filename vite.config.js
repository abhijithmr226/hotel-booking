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
        if (req.url && req.url.split('?')[0] === '/sitemap.xml') {
          try {
            const { default: handler } = await import('./api/sitemap.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) {
                res.setHeader(name, value);
              },
              status(code) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              send(body) {
                res.end(body);
              }
            };
            await handler(req, mockRes);
          } catch (err) {
            console.error("Local sitemap dev server error:", err);
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
        if (req.url && req.url.split('?')[0] === '/sitemap.xml') {
          try {
            const { default: handler } = await import('./api/sitemap.js');
            const mockRes = {
              statusCode: 200,
              setHeader(name, value) {
                res.setHeader(name, value);
              },
              status(code) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              send(body) {
                res.end(body);
              }
            };
            await handler(req, mockRes);
          } catch (err) {
            console.error("Local sitemap preview server error:", err);
            next();
          }
        } else {
          next();
        }
      });
    }
  },
  build: {
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
      },
    },
  },
});
