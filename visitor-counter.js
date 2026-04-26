// Visitor Counter with Firebase Database Storage
(function() {
  // Firebase Configuration - Loaded from separate file
  const firebaseConfig = typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : {
    // Fallback - replace with your config if not using separate file
    apiKey: "AIzaSyDCmsbN-x2KyGM4lY-FqtDunKTQHjQX7ls",
    authDomain: "portfolio-25b4d.firebaseapp.com",
    projectId: "portfolio-25b4d",
    databaseURL: "https://portfolio-25b4d-default-rtdb.firebaseio.com",
    storageBucket: "portfolio-25b4d.firebasestorage.app",
    messagingSenderId: "379528017404",
    appId: "1:379528017404:web:cad1cccbce4be0613fae79",
    measurementId: "G-PWN01TJ6MV"
  };

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
