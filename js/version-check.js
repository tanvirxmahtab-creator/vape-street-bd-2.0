// version-check.js
// Ensures returning visitors instantly reload fresh assets whenever a new version is deployed.

(async function checkVersion() {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    const currentVersion = String(data.version);
    const storedVersion = localStorage.getItem('site_version');
    
    if (storedVersion) {
      if (currentVersion !== storedVersion) {
        localStorage.setItem('site_version', currentVersion);
        // Force hard reload from server
        window.location.reload(true);
      }
    } else {
      localStorage.setItem('site_version', currentVersion);
    }
  } catch (error) {
    console.error('Failed to check site version:', error);
  }
})();
