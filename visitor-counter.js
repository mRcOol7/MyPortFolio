// Private Visitor Counter with Google Sheets Backend
(function() {
  // Google Apps Script Web App URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOTTcZXe5e5JGbC1aHWXTINU-TGmwpgSvi_dEmYdKUQh5wHPzJGsCMQC-gXhYj8z-H/exec";

  // Generate or retrieve unique Visit ID for the session
  let visitId = sessionStorage.getItem('portfolio_visit_id');
  if (!visitId) {
    visitId = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('portfolio_visit_id', visitId);
  }

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

  // Helper to log visual events (scrolls, downloads, clicks)
  function logEvent(eventName, eventDetail = "") {
    const formData = new FormData();
    formData.append('action', 'track_event');
    formData.append('visitId', visitId);
    formData.append('eventName', eventName);
    formData.append('eventDetail', eventDetail);

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    }).catch(err => console.error("Event logging failed:", err));
  }

  // Track initial visit only once per session
  if (!sessionStorage.getItem('portfolio_visit_counted')) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown Timezone";
    const referrer = document.referrer || "Direct / None";
    const query = window.location.search || "None";
    const device = getDeviceType();
    const browserOs = getBrowserOS();

    let locationStr = "Unknown Location";
    let userIpStr = "Unknown IP";
    let userLat = "N/A";
    let userLng = "N/A";

    // Robust, zero-prompt IP-based geolocation, IP, and Lat/Long resolver for production (HTTPS + CORS)
    const fetchLocation = new Promise((resolve) => {
      const timeoutMs = 4000; // 4s timeout for production & mobile connections
      
      function fetchWithTimeout(url) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { signal: controller.signal })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then(data => {
            clearTimeout(id);
            return data;
          });
      }

      // Priority list of HTTPS-compatible, CORS-enabled zero-key APIs
      const providers = [
        // Provider 1: ipwho.is (Full HTTPS + CORS, IP, City, Country, Lat, Lng)
        async () => {
          const data = await fetchWithTimeout("https://ipwho.is/");
          if (data && data.success !== false && (data.city || data.country)) {
            const city = data.city || 'Unknown City';
            const country = data.country || 'Unknown Country';
            return {
              location: `${city}, ${country}`,
              ip: data.ip || "Unknown IP",
              latitude: data.latitude !== undefined ? data.latitude : "N/A",
              longitude: data.longitude !== undefined ? data.longitude : "N/A"
            };
          }
          throw new Error("Invalid ipwho.is data");
        },
        // Provider 2: get.geojs.io (Cloudflare global CDN, HTTPS, CORS, unlimited)
        async () => {
          const data = await fetchWithTimeout("https://get.geojs.io/v1/ip/geo.json");
          if (data && (data.city || data.country)) {
            const city = data.city || 'Unknown City';
            const country = data.country || 'Unknown Country';
            return {
              location: `${city}, ${country}`,
              ip: data.ip || "Unknown IP",
              latitude: data.latitude !== undefined ? data.latitude : "N/A",
              longitude: data.longitude !== undefined ? data.longitude : "N/A"
            };
          }
          throw new Error("Invalid geojs data");
        },
        // Provider 3: free.freeipapi.com (Direct endpoint bypassing 302 redirect)
        async () => {
          const data = await fetchWithTimeout("https://free.freeipapi.com/api/json");
          if (data && (data.cityName || data.countryName)) {
            const city = data.cityName || 'Unknown City';
            const country = data.countryName || 'Unknown Country';
            return {
              location: `${city}, ${country}`,
              ip: data.ipAddress || data.ip || "Unknown IP",
              latitude: data.latitude !== undefined ? data.latitude : "N/A",
              longitude: data.longitude !== undefined ? data.longitude : "N/A"
            };
          }
          throw new Error("Invalid freeipapi data");
        },
        // Provider 4: db-ip fallback (HTTPS, CORS, IP & City)
        async () => {
          const data = await fetchWithTimeout("https://api.db-ip.com/v2/free/self");
          if (data && data.ipAddress) {
            const city = data.city || 'Unknown City';
            const country = data.countryName || 'Unknown Country';
            return {
              location: `${city}, ${country}`,
              ip: data.ipAddress || "Unknown IP",
              latitude: "N/A",
              longitude: "N/A"
            };
          }
          throw new Error("Invalid db-ip data");
        }
      ];

      (async () => {
        for (const provider of providers) {
          try {
            const result = await provider();
            if (result && result.ip !== "Unknown IP") {
              resolve(result);
              return;
            }
          } catch (err) {
            // Silently try next provider in list
          }
        }
        resolve({ location: "Unknown Location", ip: "Unknown IP", latitude: "N/A", longitude: "N/A" });
      })();
    });

    fetchLocation.then((res) => {
      locationStr = res.location || "Unknown Location";
      userIpStr = res.ip || "Unknown IP";
      userLat = res.latitude !== undefined ? res.latitude : "N/A";
      userLng = res.longitude !== undefined ? res.longitude : "N/A";
      console.log(`📍 Geolocation resolved silently: ${locationStr} | IP: ${userIpStr} | Lat: ${userLat}, Lng: ${userLng}`);

      const formData = new FormData();
      formData.append('action', 'track_visit');
      formData.append('ip', userIpStr);
      formData.append('location', locationStr);
      formData.append('latitude', userLat);
      formData.append('longitude', userLng);
      formData.append('timezone', timezone);
      formData.append('device', device);
      formData.append('browserOs', browserOs);
      formData.append('referrer', referrer);
      formData.append('query', query);
      formData.append('visitId', visitId); // Add Visit ID to link visits and events

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      })
      .then(() => {
        sessionStorage.setItem('portfolio_visit_counted', 'true');
        console.log('✅ Visit tracked successfully with ID:', visitId);
      })
      .catch((error) => {
        console.error('❌ Error tracking visit:', error);
      });
    });
  }

  // --- Scroll Milestone Tracking ---
  const scrollMilestones = [25, 50, 75, 100];
  window.addEventListener('scroll', throttle(function() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const pct = Math.round((scrollTop / docHeight) * 100);

    scrollMilestones.forEach(milestone => {
      const sessionKey = `scroll_tracked_${milestone}`;
      if (pct >= milestone && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        logEvent('scroll', `${milestone}%`);
        console.log(`📊 Tracked scroll milestone: ${milestone}%`);
      }
    });
  }, 400));

  // Throttle helper to protect scroll performance
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // --- Link Clicks and CTA Tracking ---
  document.body.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href') || "";
    const text = anchor.innerText.trim() || anchor.getAttribute('title') || "Unnamed Link";

    // 1. Check if resume download
    if (href.toLowerCase().includes('resume') || href.toLowerCase().includes('.pdf')) {
      logEvent('download_resume', text);
      console.log('📊 Logged resume download:', text);
    }
    // 2. Check if external profiles
    else if (href.includes('github.com')) {
      logEvent('click_github', text);
      console.log('📊 Logged GitHub click:', text);
    }
    else if (href.includes('linkedin.com')) {
      logEvent('click_linkedin', text);
      console.log('📊 Logged LinkedIn click:', text);
    }
    // 3. Check contact actions
    else if (href.startsWith('mailto:')) {
      logEvent('click_email', href.replace('mailto:', ''));
    }
    else if (href.startsWith('tel:')) {
      logEvent('click_call', href.replace('tel:', ''));
    }
    // 4. Other external links
    else if (href.startsWith('http')) {
      logEvent('click_external_link', href);
    }
  });
})();
