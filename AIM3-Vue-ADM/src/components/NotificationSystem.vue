<script setup>
import { X, CheckCircle, Info, AlertTriangle, Bell } from 'lucide-vue-next';
import { useNotifications } from '../composables/useNotifications';

const { notifications, removeNotification } = useNotifications();

const getIcon = (type) => {
    switch (type) {
        case 'success': return CheckCircle;
        case 'error': return AlertTriangle;
        case 'warning': return Bell;
        default: return Info;
    }
};

const getColors = (type) => {
    switch (type) {
        case 'success': return 'bg-teal-500/10 border-teal-500/50 text-teal-600';
        case 'error': return 'bg-red-500/10 border-red-500/50 text-red-600';
        case 'warning': return 'bg-amber-500/10 border-amber-500/50 text-amber-600';
        default: return 'bg-blue-500/10 border-blue-500/50 text-blue-600';
    }
};
</script>

<template>
    <div class="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <transition-group name="notification-slide">
            <div 
                v-for="note in notifications" 
                :key="note.id"
                :class="['w-80 p-4 rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto flex gap-3', getColors(note.type)]"
            >
                <div class="mt-0.5">
                    <component :is="getIcon(note.type)" :size="18" />
                </div>
                <div class="flex-1">
                    <h4 class="text-[11px] font-black uppercase tracking-widest mb-1 opacity-90">{{ note.title }}</h4>
                    <p class="text-[12px] font-medium leading-relaxed opacity-80">{{ note.message }}</p>
                </div>
                <button @click="removeNotification(note.id)" class="h-6 w-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
                    <X :size="14" />
                </button>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
