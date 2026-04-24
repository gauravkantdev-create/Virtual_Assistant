// Service Worker - COMPLETELY DISABLED FOR DEVELOPMENT
// This service worker does nothing to avoid development conflicts

const CACHE_NAME = 'ai-assistant-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// Do not cache anything in development - let all requests pass through
self.addEventListener('fetch', () => {
  // In development, let all requests go through normally without caching
  return;
});
