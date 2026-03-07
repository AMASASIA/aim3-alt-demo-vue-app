const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAKPoNf_Ou8VuYW98_5vitzu0cQMxaX-Nw",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0556123756.firebaseapp.com",
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://gen-lang-client-0556123756-default-rtdb.firebaseio.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0556123756",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0556123756.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "463106103162",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:463106103162:web:660f4da3a32643a5f728c3",
    measurementId: "G-1N0FYZK2W9"
};

// Singleton pattern
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("[Firebase Backend] Initialized successfully");
} catch (error) {
    console.error("[Firebase Backend] Initialization failed:", error);
}

module.exports = { db };
