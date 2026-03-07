import { ref } from 'vue';
import { learningService } from '../services/learningService';

const notifications = ref([]);
let lastNotifyTime = 0;

export const useNotifications = () => {
    /**
     * Considerate Notification (Mimamori Wisdom)
     */
    const notify = (title, message, type = 'info', actions = null) => {
        const context = learningService.getEvolvedContext();
        const now = Date.now();

        // --- 🛡️ Tranquility Filter (Kizukai Layer) ---
        // If the system should be quiet, we block non-essential popups
        if (context.tranquility > 0.7 && type !== 'critical' && type !== 'success') {
            console.log(`[Tive◎Mimamori] Silencing subtle notification: ${title}`);
            return;
        }

        // Prevent Notification Fatigue (Spam protection)
        if (now - lastNotifyTime < 2000 && type !== 'critical') {
            return;
        }

        const id = now.toString();
        notifications.value.push({
            id,
            title,
            message,
            type,
            actions,
            timestamp: now
        });
        lastNotifyTime = now;

        // Auto remove faster if system is in quiet mode
        const duration = context.tranquility > 0.5 ? 3000 : 5000;

        if (!actions) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    const removeNotification = (id) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    return {
        notifications,
        notify,
        removeNotification
    };
};
