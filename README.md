# Nehal Chauhan Portfolio

A modern portfolio website with Firebase visitor tracking - HTML/CSS/JavaScript only.

## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Realtime Database in **locked mode**
4. Add security rules:
```json
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
```

### 2. Configure Firebase Credentials
For security, Firebase credentials are stored separately:

**Option A: Create your own config file**
1. Copy `firebase-config.example.js` to `firebase-config.js`
2. Replace with your Firebase config:
```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

**Option B: Get credentials from Firebase Console**
1. Go to Firebase Console → Project Settings → General
2. Copy the Firebase config object
3. Create `firebase-config.js` with your credentials

### 3. Deploy
Upload your files to your hosting service. The `firebase-config.js` file is excluded from Git for security.

## Security Notes
- ✅ `firebase-config.js` is excluded from Git (see `.gitignore`)
- ✅ Firebase credentials are in a separate file
- ✅ Database is in locked mode with minimal access rules
- ✅ Only the `visits` path is publicly accessible

## File Structure
```
├── index.html              # Main portfolio page
├── css.css                 # Styles
├── firebase-config.js      # Firebase credentials (excluded from Git)
├── visitor-counter.js      # Visitor tracking logic
├── preloader.html          # Loading screen
└── .gitignore              # Excludes sensitive files
```

## Features
- 📊 Real-time visitor tracking
- 🔥 Firebase database storage
- 🛡️ Secure configuration with separate config file
- 📱 Responsive design
- 💬 AI-powered chatbot
- 🎯 Project showcase with impact metrics

## Firebase Database Rules
The database uses locked mode with these rules:
```json
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
```

This ensures:
- All data is private by default
- Only the visitor counter can be accessed publicly
- Your other Firebase data remains secure

## For GitHub Deployment
1. Don't commit `firebase-config.js` (it's in `.gitignore`)
2. After cloning the repo, create your own `firebase-config.js`
3. Deploy to your hosting service
