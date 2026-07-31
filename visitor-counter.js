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

    // Robust, zero-prompt IP-based geolocation, IP, and Lat/Long resolver
    const fetchLocation = new Promise((resolve) => {
      const timeoutMs = 1500;
      
      function fetchWithTimeout(url) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { signal: controller.signal })
          .then(res => res.json())
          .then(data => {
            clearTimeout(id);
            return data;
          });
      }

      // Try freeipapi.com first (highly accurate database for city matching)
      fetchWithTimeout("https://freeipapi.com/api/json")
        .then(data => {
          if (data && (data.cityName || data.countryName)) {
            const loc = `${data.cityName || 'Unknown City'}, ${data.countryName || 'Unknown Country'}`;
            const ip = data.ipAddress || data.ip || "Unknown IP";
            const lat = data.latitude !== undefined ? data.latitude : "N/A";
            const lng = data.longitude !== undefined ? data.longitude : "N/A";
            resolve({ location: loc, ip: ip, latitude: lat, longitude: lng });
          } else {
            throw new Error("Invalid freeipapi data");
          }
        })
        .catch(() => {
          // Fallback to ipapi.co
          fetchWithTimeout("https://ipapi.co/json/")
            .then(data => {
              if (data && (data.city || data.country_name)) {
                const loc = `${data.city || 'Unknown City'}, ${data.country_name || 'Unknown Country'}`;
                const ip = data.ip || "Unknown IP";
                const lat = data.latitude !== undefined ? data.latitude : "N/A";
                const lng = data.longitude !== undefined ? data.longitude : "N/A";
                resolve({ location: loc, ip: ip, latitude: lat, longitude: lng });
              } else {
                throw new Error("Invalid ipapi data");
              }
            })
            .catch(() => {
              // Fallback to ip-api.com
              fetchWithTimeout("https://ip-api.com/json/")
                .then(data => {
                  if (data && data.status === "success") {
                    const loc = `${data.city || 'Unknown City'}, ${data.country || 'Unknown Country'}`;
                    const ip = data.query || "Unknown IP";
                    const lat = data.lat !== undefined ? data.lat : "N/A";
                    const lng = data.lon !== undefined ? data.lon : "N/A";
                    resolve({ location: loc, ip: ip, latitude: lat, longitude: lng });
                  } else {
                    throw new Error("Invalid ip-api data");
                  }
                })
                .catch(() => {
                  // Fallback to ipinfo.io
                  fetchWithTimeout("https://ipinfo.io/json")
                    .then(data => {
                      if (data && data.city) {
                        const loc = `${data.city || 'Unknown City'}, ${data.country || 'Unknown Country'}`;
                        const ip = data.ip || "Unknown IP";
                        let lat = "N/A", lng = "N/A";
                        if (data.loc) {
                          const parts = data.loc.split(",");
                          lat = parts[0] || "N/A";
                          lng = parts[1] || "N/A";
                        }
                        resolve({ location: loc, ip: ip, latitude: lat, longitude: lng });
                      } else {
                        resolve({ location: "Unknown Location", ip: data.ip || "Unknown IP", latitude: "N/A", longitude: "N/A" });
                      }
                    })
                    .catch(() => {
                      resolve({ location: "Unknown Location", ip: "Unknown IP", latitude: "N/A", longitude: "N/A" });
                    });
                });
            });
        });
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
