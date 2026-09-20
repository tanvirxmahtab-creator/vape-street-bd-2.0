// version-check.js
// Forcefully unregisters legacy service workers, clears browser CacheStorage,
// and guarantees old users receive fresh site updates on deploy.

(async function checkVersion() {
  // 1. Unregister any legacy Service Workers from previous deploys
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    } catch (e) {
      console.warn('Service worker unregister error:', e);
    }
  }

  // 2. Fetch latest version.json bypassing browser & CDN caches
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) return;

    const data = await response.json();
    const currentVersion = String(data.version || '');
    if (!currentVersion) return;

    const storedVersion = localStorage.getItem('site_version');

    // If version changed OR if storedVersion is not set yet for returning user
    if (storedVersion !== currentVersion) {
      localStorage.setItem('site_version', currentVersion);

      // Clear any stored CacheStorage
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        } catch (e) {}
      }

      // If this is a returning user updating from an old version (or first time seeing version-check)
      // Force reload with cache-busting query parameter
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('_v') !== currentVersion) {
        currentUrl.searchParams.set('_v', currentVersion);
        window.location.replace(currentUrl.toString());
      }
    }
  } catch (error) {
    console.error('Failed to check site version:', error);
  }
})();
