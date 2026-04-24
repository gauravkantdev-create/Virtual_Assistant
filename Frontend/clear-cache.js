// Cache clearing script for development
// Run this in browser console to clear all caches and service workers

if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('Deleted cache:', name);
    }
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Unregistered service worker:', registration.scope);
    }
  });
}

// Clear localStorage
localStorage.clear();
console.log('Local storage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('Session storage cleared');

console.log('All caches and storage cleared! Refresh the page.');
