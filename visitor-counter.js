// Visitor Counter with Firebase Database Storage
(function() {
  // Firebase Configuration - Must be loaded from firebase-config.js
  if (typeof FIREBASE_CONFIG === 'undefined') {
    console.error('❌ Firebase configuration not found. Please include firebase-config.js before this script.');
    return;
  }
  
  const firebaseConfig = FIREBASE_CONFIG;

  // Initialize Firebase (load from CDN if not already loaded)
  if (typeof firebase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    script.onload = () => {
      const dbScript = document.createElement('script');
      dbScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
      dbScript.onload = initializeCounter;
      document.head.appendChild(dbScript);
    };
    document.head.appendChild(script);
  } else {
    initializeCounter();
  }

  function initializeCounter() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      const database = firebase.database();
      const visitsRef = database.ref('visits');

      // Increment visit count in database
      visitsRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
      });

      // Log success
      console.log('✅ Visit tracked in Firebase database');
      
      // Optional: Get current count
      visitsRef.on('value', (snapshot) => {
        const totalCount = snapshot.val();
        console.log('👁️ Total visits:', totalCount);
      });

    } catch (error) {
      console.error('❌ Firebase error:', error);
      console.log('⚠️ Make sure Realtime Database is enabled and security rules are configured');
    }
  }
})();

/*
FIREBASE SECURITY RULES FOR LOCKED MODE:

After creating the Realtime Database in locked mode, go to:
Firebase Console → Realtime Database → Rules

Replace the rules with:

{
  "rules": {
    ".read": false,
    ".write": false,
    "visits": {
      ".read": true,
      ".write": true
    }
  }
}

This allows public read/write access only to the "visits" path for the counter,
while keeping all other data private and secure.
*/
