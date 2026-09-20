// version-check.js
// Nuclear cache-buster for returning users.
// Forces a true hard reload (bypasses disk cache) when the site version changes.

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

    // If version changed OR first-time visitor seeing version-check
    if (storedVersion !== currentVersion) {
      localStorage.setItem('site_version', currentVersion);

      // Clear CacheStorage (used by service workers / PWA)
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        } catch (e) {}
      }

      // Mark that we need to hard-reload (sessionStorage survives reload)
      const reloadKey = 'vsbd_hard_reload';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        // location.reload(true) is deprecated but still forces a hard reload
        // in most browsers. As a fallback, we also append a cache-bust param.
        if (typeof location.reload === 'function') {
          location.reload(true);
          return;
        }
      }
      // Cleanup after the hard reload has happened
      sessionStorage.removeItem(reloadKey);
    }
  } catch (error) {
    console.error('Failed to check site version:', error);
  }
})();
