
import contactBook from './contactBook';
import peerService from './peerService';
import { useInvisibleFinance } from '../composables/useInvisibleFinance';

const { playSanctuaryBell } = useInvisibleFinance();

export const labelingCaller = {
    name: "labeling_caller",
    description: "Identify target from voice and send AMAS Popup signal with Resonance Bell",

    execute: async (args) => {
        const { nickname } = args;
        console.log(`[Labeling Caller] Resolving nickname: ${nickname}`);

        // 1. Resolve Nickname to PeerID (AMAS Identity)
        const contact = contactBook.findContact(nickname);
        if (!contact || !contact.peerId) {
            console.warn(`[Labeling Caller] Contact not found or missing PeerID for: ${nickname}`);
            throw new Error("Target Sanctuary (ID) not found.");
        }

        // 2. Send Invisible Popup & Bell Signal to Peer
        // We use the existing PeerService data connection for signaling
        console.log(`[Labeling Caller] Sending Resonance Signal to ${contact.peerId}...`);

        // Play local bell for confirmation
        playSanctuaryBell();

        const signalPayload = {
            type: "RESONANCE_CALL_REQUEST",
            payload: {
                caller: "Master", // Should be dynamic user name
                audio: "E7_PURE_BELL", // 2.6kHz
                ui: "AMAS_INVISIBLE_POPUP",
                targetName: contact.nickname
            }
        };

        // If connected, send via data channel. If not, we might need to connect first.
        // For this simulation, we assume connection or "Instant" attempt.
        const conn = peerService.connectToPeer(contact.peerId);

        // Wait for open to send (if not already open)
        if (conn.open) {
            conn.send(signalPayload);
        } else {
            conn.on('open', () => {
                conn.send(signalPayload);
            });
        }

        return {
            status: "calling",
            peerId: contact.peerId,
            message: "Just moment / 少々お待ちくださいませ",
            contact
        };
    }
};
