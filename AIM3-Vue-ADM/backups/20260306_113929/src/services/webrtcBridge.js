
import peerService from './peerService';

/**
 * AMAS WebRTC Instant Bridge
 * Optimized for low-latency P2P synchronization upon Consensus.
 */
export class WebRTCBridge {

    /**
     * Establishes an instant session with the target peer.
     * Leverages the existing PeerService but optimizes flow for "Consensus Hook".
     * 
     * @param {string} targetPeerId - The PeerID to connect to
     * @param {MediaStream} stream - Local media stream to bind
     */
    static async establishSession(targetPeerId, stream) {
        console.log(`[WebRTC Bridge] Initiating Instant Sync with ${targetPeerId} 🧚`);

        // In a pure WebRTC implementation, we would create RTCPeerConnection here.
        // To maintain compatibility with the existing PeerJS infrastructure of AIM3,
        // we wrap the PeerService call but treat it as the "Bridge".

        // The "Hook": PeerService.call essentially does the addTrack and signaling.
        // We assume the "YES" consent (SBT) has already happened.

        try {
            const call = await peerService.startVideoCall(targetPeerId, stream);

            console.log("WebRTC Bridge: Synchronized 🧚");
            return call;
        } catch (e) {
            console.error("WebRTC Bridge: Sync Failed", e);
            throw e;
        }
    }

    /**
     * Handling the answering side of the Bridge
     */
    static async answerSession(ongoingCall, stream) {
        console.log(`[WebRTC Bridge] Answering Sync Request 🧚`);
        peerService.answerCall(ongoingCall, stream);
        console.log("WebRTC Bridge: Link Established 🧚");
    }
}
