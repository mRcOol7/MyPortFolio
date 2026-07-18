// Private Visitor Counter with Google Sheets Backend
(function() {
  // Google Apps Script Web App URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOTTcZXe5e5JGbC1aHWXTINU-TGmwpgSvi_dEmYdKUQh5wHPzJGsCMQC-gXhYj8z-H/exec";

  // Helper to extract clean Browser & OS details
  function getBrowserOS() {
    const ua = navigator.userAgent;
    let browser = "Other Browser";
    let os = "Other OS";
    
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident")) browser = "IE";
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    if (ua.includes("Windows NT")) os = "Windows";
    else if (ua.includes("Macintosh")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";
    
    return `${browser} on ${os}`;
  }

  // Helper to detect Device Type
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      return "Mobile";
    }
    if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      return "Tablet";
    }
    return "Desktop";
  }

  // Increment visit count only once per browser session to prevent inflating stats on refresh
  if (!sessionStorage.getItem('portfolio_visit_counted')) {
    // 1. Gather basic stats
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown Timezone";
    const referrer = document.referrer || "Direct / None";
    const query = window.location.search || "None";
    const device = getDeviceType();
    const browserOs = getBrowserOS();

    // 2. Attempt to fetch location with a short timeout, then post tracking data
    let locationStr = "Unknown Location";

    // Set up a promise to fetch geolocation (timeout at 1.5 seconds so we don't delay the tracking write)
    const fetchLocation = new Promise((resolve) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);

      fetch("https://ipapi.co/json/", { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          clearTimeout(id);
          if (data && (data.city || data.country_name)) {
            resolve(`${data.city || 'Unknown City'}, ${data.country_name || 'Unknown Country'}`);
          } else {
            resolve("Unknown Location");
          }
        })
        .catch(() => {
          clearTimeout(id);
          resolve("Unknown Location");
        });
    });

    fetchLocation.then((resolvedLocation) => {
      locationStr = resolvedLocation;

      // Send POST request as FormData
      const formData = new FormData();
      formData.append('action', 'track_visit');
      formData.append('location', locationStr);
      formData.append('timezone', timezone);
      formData.append('device', device);
      formData.append('browserOs', browserOs);
      formData.append('referrer', referrer);
      formData.append('query', query);

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Use no-cors for write-only requests to prevent CORS blocks
        body: formData
      })
      .then(() => {
        sessionStorage.setItem('portfolio_visit_counted', 'true');
        console.log('✅ Visit tracked successfully in Google Sheets');
      })
      .catch((error) => {
        console.error('❌ Error tracking visit:', error);
      });
    });

  } else {
    console.log('ℹ️ Visit already counted this session');
  }
})();
