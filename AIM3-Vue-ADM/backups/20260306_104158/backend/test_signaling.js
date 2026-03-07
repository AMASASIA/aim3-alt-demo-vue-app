const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, remove, onValue } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyAKPoNf_Ou8VuYW98_5vitzu0cQMxaX-Nw",
    authDomain: "gen-lang-client-0556123756.firebaseapp.com",
    databaseURL: "https://gen-lang-client-0556123756-default-rtdb.firebaseio.com",
    projectId: "gen-lang-client-0556123756",
    storageBucket: "gen-lang-client-0556123756.firebasestorage.app",
    messagingSenderId: "463106103162",
    appId: "1:463106103162:web:660f4da3a32643a5f728c3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function testSignaling() {
    const targetId = "user_b_id";
    const callRef = ref(db, `calls/${targetId}`);

    console.log(`[Test] Writing Offer to RTDB for: ${targetId}...`);

    try {
        await set(callRef, {
            offer: {
                type: "offer",
                sdp: "v=0\r\no=- 4209503378516086786 2 IN IP4 127.0.0.1... (MOCK_SDP)"
            },
            timestamp: Date.now(),
            status: "pending"
        });
        console.log("[Test] Offer written successfully.");

        // Wait a bit to see it
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Cleanup
        // await remove(callRef);
        // console.log("[Test] Entry removed.");
    } catch (err) {
        console.error("[Test] Error writing to RTDB:", err);
    }
    process.exit(0);
}

testSignaling();
