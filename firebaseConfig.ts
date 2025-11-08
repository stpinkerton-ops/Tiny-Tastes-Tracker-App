// firebaseConfig.ts

// This is the Firebase configuration. The apiKey here is a public identifier for your
// Firebase project and is NOT the secret key used for the Gemini API.
// It's safe to have this in your client-side code because security is handled
// by Firebase Security Rules, not this key.

// --- INSTRUCTIONS ---
// 1. Go to your Firebase Project Settings > General > Your Apps.
// 2. Click "Add App", select "Web", and register a new app.
// 3. Copy the entire `firebaseConfig` object it gives you.
// 4. Paste it here, replacing this entire object.

const firebaseConfig = {
  apiKey: "AIzaSyC_xeE4wQXpGvlYJwBVbbyXH1AH7x8baJc",
    authDomain: "tiny-tastes-tracker.firebaseapp.com",
    projectId: "tiny-tastes-tracker",
    storageBucket: "tiny-tastes-tracker.firebasestorage.app",
    messagingSenderId: "87950543929",
    appId: "1:87950543929:web:2e63d2392fd65b596411e8",
    measurementId: "G-4WGBFJBMGL"
};

export default firebaseConfig;
