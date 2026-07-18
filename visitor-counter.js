// Private Visitor Counter with Google Sheets Backend
(function() {
  // Google Apps Script Web App URL (the same one used for your contact form)
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOTTcZXe5e5JGbC1aHWXTINU-TGmwpgSvi_dEmYdKUQh5wHPzJGsCMQC-gXhYj8z-H/exec";

  // Increment visit count only once per browser session to prevent inflating stats on refresh
  if (!sessionStorage.getItem('portfolio_visit_counted')) {
    // Send POST request to Apps Script with action 'track_visit' as FormData
    const formData = new FormData();
    formData.append('action', 'track_visit');

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
  } else {
    console.log('ℹ️ Visit already counted this session');
  }
})();
