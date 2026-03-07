import { ref } from 'vue';
import { processVoiceNote } from '../services/intentService.js';
import { useNotifications } from './useNotifications';

export function useAmasSecretary() {
    const isProcessingVoice = ref(false);
    const { notify } = useNotifications();

    const handleVoiceNote = async (transcript: string) => {
        isProcessingVoice.value = true;
        notify('AMAS Secretary', 'Transcribing thought...', 'info');

        try {
            // 1. Refine with Gemini (Secretary Persona)
            const refinedContent = await processVoiceNote(transcript);

            // 2. Format for Notebook
            const entry = {
                id: Date.now().toString(),
                type: 'voice_memo',
                title: `Secretary Note: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                content: refinedContent,
                metadata: {
                    transcript: transcript,
                    verification_hash: `0xSECRETARY_SIGNED_${Date.now()}`,
                    is_refined: true
                },
                timestamp: new Date()
            };

            notify('Notebook', 'Secretary note filed.', 'success');
            return entry;

        } catch (error) {
            console.error('Secretary Error:', error);
            notify('Secretary Error', 'Could not refine voice note.', 'error');
            // Fallback: Save raw transcript
            return {
                id: Date.now().toString(),
                type: 'voice_memo',
                title: `Voice Memo (Raw)`,
                content: transcript,
                metadata: {
                    transcript: transcript,
                    is_refined: false
                },
                timestamp: new Date()
            };
        } finally {
            isProcessingVoice.value = false;
        }
    };

    return {
        isProcessingVoice,
        handleVoiceNote
    };
}
