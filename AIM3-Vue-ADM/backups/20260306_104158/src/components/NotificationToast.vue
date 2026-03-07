<script setup>
import { ref, watch } from 'vue';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next';

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['remove']);

const getIcon = (type) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return AlertCircle;
    case 'warning': return AlertTriangle;
    default: return Info;
  }
};

const getColorClass = (type) => {
  switch (type) {
    case 'success': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700';
    case 'error': return 'bg-red-500/10 border-red-500/30 text-red-700';
    case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-700';
    default: return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
  }
};

const getIconColor = (type) => {
  switch (type) {
    case 'success': return 'text-emerald-600';
    case 'error': return 'text-red-600';
    case 'warning': return 'text-amber-600';
    default: return 'text-blue-600';
  }
};
</script>

<template>
  <div class="fixed top-24 right-10 z-[9999] space-y-4 max-w-md">
    <TransitionGroup name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['backdrop-blur-2xl border rounded-3xl p-6 shadow-2xl flex items-start gap-4 animate-slide-in-right', getColorClass(notification.type)]"
      >
        <component 
          :is="getIcon(notification.type)" 
          :size="20" 
          :class="getIconColor(notification.type)"
        />
        <div class="flex-1">
          <h4 v-if="notification.title" class="font-bold text-[12px] uppercase tracking-widest mb-1">
            {{ notification.title }}
          </h4>
          <p class="text-[13px] font-light leading-relaxed">
            {{ notification.message }}
          </p>
          <div v-if="notification.actions" class="mt-3 flex gap-2">
            <button 
              v-for="action in notification.actions" 
              :key="action.label"
              @click="action.onClick(notification.id)"
              :class="['px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300', action.primary ? 'bg-black text-white border-black shadow-lg hover:scale-105' : 'border-current opacity-60 hover:opacity-100 hover:bg-current hover:text-white']"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        <button 
          @click="$emit('remove', notification.id)"
          class="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X :size="14" class="opacity-40" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
