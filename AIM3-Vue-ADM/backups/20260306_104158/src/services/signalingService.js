import { db } from '../firebase';
import { ref, set, onValue, push, onChildAdded, remove } from 'firebase/database';

/**
 * AIM3 Signaling Service (RTDB)
 * Pure P2P signaling without PeerJS.
 * Handles Offers, Answers, and ICE Candidates.
 */
export const signalingService = {

    /**
     * Initiate a call by writing an Offer to RTDB
     */
    async createOffer(targetId, localDescription) {
        const callRef = ref(db, `calls/${targetId}`);
        console.log(`[Signaling] Creating Offer for: ${targetId}`);

        await set(callRef, {
            offer: {
                type: localDescription.type,
                sdp: localDescription.sdp
            },
            timestamp: Date.now(),
            status: 'pending'
        });

        return callRef;
    },

    /**
     * Listen for incoming calls on my own ID
     */
    onIncomingCall(myId, callback) {
        const myCallRef = ref(db, `calls/${myId}`);
        return onValue(myCallRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.offer && data.status === 'pending') {
                callback(data);
            }
        });
    },

    /**
     * Send ICE Candidate to RTDB
     */
    async sendIceCandidate(targetId, candidate, type = 'offer') {
        const path = `calls/${targetId}/${type}Candidates`;
        const candidatesRef = ref(db, path);
        await push(candidatesRef, candidate.toJSON());
    },

    /**
     * Listen for ICE Candidates
     */
    onIceCandidate(id, type, callback) {
        const path = `calls/${id}/${type}Candidates`;
        const candidatesRef = ref(db, path);
        return onChildAdded(candidatesRef, (snapshot) => {
            callback(snapshot.val());
        });
    },

    /**
     * Cleanup call data
     */
    async endCall(id) {
        const callRef = ref(db, `calls/${id}`);
        await remove(callRef);
    }
};

export default signalingService;
