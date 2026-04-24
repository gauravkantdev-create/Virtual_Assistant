// Service Worker - DISABLED FOR DEVELOPMENT
// This service worker does nothing to avoid conflicts with Vite HMR

self.addEventListener('install', () => {
  console.log('Service Worker: Installing (disabled mode)');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker: Activating (disabled mode)');
  self.clients.claim();
});

// Do not intercept any fetch requests - let them all pass through
self.addEventListener('fetch', () => {
  // Don't respond to fetch events - let browser handle normally
});
