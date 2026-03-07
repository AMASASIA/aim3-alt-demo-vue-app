import { ref } from 'vue';
import { database } from '../firebase'; // Firebase RTDBの初期化インスタンス
import { ref as dbRef, set, push, onValue, onChildAdded } from 'firebase/database';

export function useWebRTC() {
    const localStream = ref(null);
    const remoteStream = ref(null);
    const peerConnection = ref(null);

    // STUNサーバー設定
    const servers = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };

    const startCall = async (targetUserId) => {
        peerConnection.value = new RTCPeerConnection(servers);

        // 1. ローカルストリームの取得と追加
        try {
            localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.value.getTracks().forEach((track) => {
                peerConnection.value.addTrack(track, localStream.value);
            });
        } catch (err) {
            console.error("Media access denied:", err);
            return;
        }

        // 2. Offerの作成とローカル設定
        const offer = await peerConnection.value.createOffer();
        await peerConnection.value.setLocalDescription(offer);

        // 3. Firebase RTDBを介したシグナリング（Offerの送信）
        const callDocRef = dbRef(database, `calls/${targetUserId}`);
        await set(callDocRef, {
            offer: { type: offer.type, sdp: offer.sdp },
            timestamp: Date.now(),
            status: 'pending'
        });

        // 4. ICE Candidateの収集と送信
        peerConnection.value.onicecandidate = (event) => {
            if (event.candidate) {
                push(dbRef(database, `calls/${targetUserId}/offerCandidates`), event.candidate.toJSON());
            }
        };

        // 5. Remote Streamの受信
        peerConnection.value.ontrack = (event) => {
            if (!remoteStream.value) remoteStream.value = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.value.addTrack(track);
            });
        };

        // 6. Answerの待機
        onValue(callDocRef, (snapshot) => {
            const data = snapshot.val();
            if (!peerConnection.value.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                peerConnection.value.setRemoteDescription(answerDescription);
            }
        });

        // 7. Answer側のICE Candidateを取得
        onChildAdded(dbRef(database, `calls/${targetUserId}/answerCandidates`), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const candidate = new RTCIceCandidate(data);
                peerConnection.value.addIceCandidate(candidate);
            }
        });

        console.log(`[WebRTC] Signaling started for ${targetUserId} via Firebase RTDB`);
    };

    const endCall = () => {
        if (peerConnection.value) {
            peerConnection.value.close();
            if (localStream.value) {
                localStream.value.getTracks().forEach(track => track.stop());
            }
        }
    };

    return { startCall, endCall, localStream, remoteStream };
}
