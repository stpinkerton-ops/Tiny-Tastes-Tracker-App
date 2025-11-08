// firebaseConfig.ts

// This is the Firebase configuration. The apiKey here is a public identifier for your
// Firebase project and is NOT the secret key used for the Gemini API.
// It's safe to have this in your client-side code because security is handled
// by Firebase Security Rules, not this key.
const firebaseConfig = {
    apiKey: "AIzaSyA3Qw1oZInrhteTAd7iOK1D2bMHMVCG4EE", // Corrected API Key
    authDomain: "tiny-tastes-tracker.firebaseapp.com",
    projectId: "tiny-tastes-tracker",
    storageBucket: "tiny-tastes-tracker.firebasestorage.app",
    messagingSenderId: "87950543929",
    appId: "1:87950543929:web:561607c04f73369f6411e8",
    measurementId: "G-5K38CPMF58"
};

export default firebaseConfig;