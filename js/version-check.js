// version-check.js
// This script ensures that users always get the latest version of the site
// after a deploy, bypassing any aggressive caching by forcing a reload if the version changes.

(async function checkVersion() {
  try {
    // Append a timestamp to the request to bypass browser cache
    const response = await fetch(`/version.json?t=${new Date().getTime()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    const currentVersion = data.version;
    const storedVersion = localStorage.getItem('site_version');
    
    if (storedVersion) {
      if (currentVersion > parseInt(storedVersion, 10)) {
        // A new version is available! 
        // Update the stored version and force a reload from the server.
        localStorage.setItem('site_version', currentVersion);
        
        // Use true to force reload from server (deprecated in some browsers but still useful)
        // Adding a cache-busting query param to location.href might be safer,
        // but window.location.reload(true) is the standard approach for this.
        window.location.reload(true);
      }
    } else {
      // First visit, just store the version
      localStorage.setItem('site_version', currentVersion);
    }
  } catch (error) {
    console.error('Failed to check site version:', error);
  }
})();
