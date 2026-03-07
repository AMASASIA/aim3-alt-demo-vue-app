import { Peer } from 'peerjs';
import { ref } from 'vue';

class PeerService {
    constructor() {
        this.peer = null;
        this.myPeerId = ref('');
        this.connections = ref([]);
        this.activeCall = ref(null);
        this.localStream = null;
        this.remoteStream = ref(null);
        this.onIncomingCall = null;
        this.onMessage = null;
    }

    initialize(customId = null) {
        // Generate a clean ID if not provided
        const id = customId || `amas-node-${Math.random().toString(36).substr(2, 9)}`;

        this.peer = new Peer(id, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log('[P2P] My Peer ID is:', id);
            this.myPeerId.value = id;
        });

        this.peer.on('connection', (conn) => {
            this.setupDataConnection(conn);
        });

        this.peer.on('call', (call) => {
            console.log('[P2P] Incoming call from:', call.peer);
            if (this.onIncomingCall) {
                this.onIncomingCall(call);
            }
        });

        this.peer.on('error', (err) => {
            console.error('[P2P] Peer Error:', err);
        });
    }

    // Setup data connection for chat
    setupDataConnection(conn) {
        conn.on('open', () => {
            console.log('[P2P] Data connection established with:', conn.peer);
            this.connections.value.push(conn);
        });

        conn.on('data', (data) => {
            console.log('[P2P] Received data:', data);
            if (this.onMessage) this.onMessage(data, conn.peer);
        });
    }

    // Connect to a peer for chat
    connectToPeer(peerId) {
        const conn = this.peer.connect(peerId);
        this.setupDataConnection(conn);
        return conn;
    }

    // Send message to all connected peers
    broadcastMessage(message) {
        this.connections.value.forEach(conn => {
            if (conn.open) {
                conn.send(message);
            }
        });
    }

    // Start video call
    async startVideoCall(peerId, stream) {
        this.localStream = stream;
        const call = this.peer.call(peerId, stream);
        this.setupCallHandlers(call);
        this.activeCall.value = call;
        return call;
    }

    // Answer incoming call
    answerCall(call, stream) {
        this.localStream = stream;
        call.answer(stream);
        this.setupCallHandlers(call);
        this.activeCall.value = call;
    }

    setupCallHandlers(call) {
        call.on('stream', (remoteStream) => {
            console.log('[P2P] Remote stream received');
            this.remoteStream.value = remoteStream;
        });

        call.on('close', () => {
            console.log('[P2P] Call closed');
            this.remoteStream.value = null;
            this.activeCall.value = null;
        });
    }

    endCall() {
        if (this.activeCall.value) {
            this.activeCall.value.close();
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        this.localStream = null;
        this.remoteStream.value = null;
    }
}

export default new PeerService();
