<script setup>
import { ref, computed } from 'vue';
import { Calendar, Clock, Tag } from 'lucide-vue-next';

const props = defineProps({
  events: {
    type: Array,
    required: true
  }
});

const viewMode = ref('timeline'); // 'timeline' or 'calendar'

// Parse timeline text into structured events
const parseTimelineText = (text) => {
  const lines = text.trim().split('\n');
  const events = [];
  
  lines.forEach(line => {
    // Match: YYYY-MM-DD: Event Title #tag
    // Or: YYYY-MM-DD - YYYY-MM-DD: Event Title #tag
    const rangeMatch = line.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2}):\s*(.+)/);
    const singleMatch = line.match(/(\d{4}-\d{2}-\d{2}):\s*(.+)/);
    const nowMatch = line.match(/Now:\s*(.+)/i);
    
    if (rangeMatch) {
      const [, start, end, content] = rangeMatch;
      const tags = content.match(/#\w+/g) || [];
      const title = content.replace(/#\w+/g, '').trim();
      events.push({
        dateStart: new Date(start),
        dateEnd: new Date(end),
        title,
        tags: tags.map(t => t.slice(1)),
        isRange: true
      });
    } else if (singleMatch) {
      const [, date, content] = singleMatch;
      const tags = content.match(/#\w+/g) || [];
      const title = content.replace(/#\w+/g, '').trim();
      events.push({
        dateStart: new Date(date),
        dateEnd: new Date(date),
        title,
        tags: tags.map(t => t.slice(1)),
        isRange: false
      });
    } else if (nowMatch) {
      const [, content] = nowMatch;
      const tags = content.match(/#\w+/g) || [];
      const title = content.replace(/#\w+/g, '').trim();
      events.push({
        dateStart: new Date(),
        dateEnd: new Date(),
        title,
        tags: tags.map(t => t.slice(1)),
        isRange: false,
        isNow: true
      });
    }
  });
  
  return events.sort((a, b) => a.dateStart - b.dateStart);
};

const parsedEvents = computed(() => {
  if (typeof props.events === 'string') {
    return parseTimelineText(props.events);
  }
  return props.events;
});

// Timeline view calculations
const timelineData = computed(() => {
  if (parsedEvents.value.length === 0) return { events: [], minDate: new Date(), maxDate: new Date(), totalDays: 0 };
  
  const dates = parsedEvents.value.flatMap(e => [e.dateStart, e.dateEnd]);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    events: parsedEvents.value.map(event => {
      const startOffset = Math.ceil((event.dateStart - minDate) / (1000 * 60 * 60 * 24));
      const duration = event.isRange 
        ? Math.ceil((event.dateEnd - event.dateStart) / (1000 * 60 * 60 * 24)) + 1
        : 1;
      
      return {
        ...event,
        startOffset,
        duration,
        leftPercent: (startOffset / totalDays) * 100,
        widthPercent: (duration / totalDays) * 100
      };
    }),
    minDate,
    maxDate,
    totalDays
  };
});

// Calendar view calculations
const calendarData = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const weeks = [];
  let week = new Array(7).fill(null);
  
  // Fill in days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayIndex = (startDay + day - 1) % 7;
    const date = new Date(year, month, day);
    
    // Find events for this day
    const dayEvents = parsedEvents.value.filter(event => {
      const eventStart = new Date(event.dateStart.getFullYear(), event.dateStart.getMonth(), event.dateStart.getDate());
      const eventEnd = new Date(event.dateEnd.getFullYear(), event.dateEnd.getMonth(), event.dateEnd.getDate());
      return date >= eventStart && date <= eventEnd;
    });
    
    week[dayIndex] = { day, date, events: dayEvents };
    
    if (dayIndex === 6) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
  }
  
  if (week.some(d => d !== null)) {
    weeks.push(week);
  }
  
  return {
    year,
    month,
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
    weeks
  };
});

const getEventColor = (tags) => {
  if (!tags || tags.length === 0) return 'bg-blue-500/50';
  const tag = tags[0].toLowerCase();
  
  const colorMap = {
    'coding': 'bg-purple-500/50',
    'design': 'bg-pink-500/50',
    'meeting': 'bg-teal-500/50',
    'launch': 'bg-emerald-500/50',
    'milestone': 'bg-amber-500/50',
    'release': 'bg-red-500/50'
  };
  
  return colorMap[tag] || 'bg-blue-500/50';
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>

<template>
  <div class="w-full bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
    <!-- Header with View Toggle -->
    <div class="flex items-center justify-between p-6 border-b border-slate-100/50">
      <div class="flex items-center gap-3">
        <Clock :size="20" class="text-slate-400" />
        <h3 class="font-serif-luxury text-xl italic text-slate-900">Timeline Visualization</h3>
      </div>
      
      <div class="flex gap-2 bg-slate-100/50 rounded-full p-1">
        <button 
          @click="viewMode = 'timeline'"
          :class="['px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all', 
                   viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600']"
        >
          Timeline
        </button>
        <button 
          @click="viewMode = 'calendar'"
          :class="['px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all', 
                   viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600']"
        >
          Calendar
        </button>
      </div>
    </div>

    <!-- Timeline View -->
    <div v-if="viewMode === 'timeline'" class="p-8">
      <div v-if="parsedEvents.length === 0" class="text-center py-12 text-slate-400 italic">
        No events to display
      </div>
      
      <div v-else class="space-y-6">
        <!-- Date Range Header -->
        <div class="flex justify-between text-xs font-mono text-slate-400 mb-4">
          <span>{{ formatDate(timelineData.minDate) }}</span>
          <span>{{ formatDate(timelineData.maxDate) }}</span>
        </div>
        
        <!-- Timeline Track -->
        <div class="relative h-2 bg-slate-100 rounded-full mb-12">
          <div 
            v-for="(event, idx) in timelineData.events" 
            :key="idx"
            :style="{ left: event.leftPercent + '%', width: event.widthPercent + '%' }"
            :class="['absolute top-0 h-full rounded-full backdrop-blur-sm border border-white/50 cursor-pointer group', getEventColor(event.tags)]"
            :title="event.title"
          >
            <!-- Event Marker -->
            <div 
              v-if="event.isNow"
              class="absolute -top-1 left-0 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"
            />
          </div>
        </div>
        
        <!-- Event List -->
        <div class="space-y-4">
          <div 
            v-for="(event, idx) in parsedEvents" 
            :key="idx"
            class="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:border-slate-200 transition-all group"
          >
            <div :class="['w-3 h-3 rounded-full mt-1.5 flex-shrink-0', getEventColor(event.tags)]" />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <h4 class="font-serif text-lg text-slate-900 group-hover:text-slate-700">
                  {{ event.title }}
                </h4>
                <div class="flex gap-2 flex-shrink-0">
                  <span 
                    v-for="tag in event.tags" 
                    :key="tag"
                    class="px-2 py-0.5 bg-white/80 text-slate-600 text-[10px] font-bold uppercase rounded-full border border-slate-200"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                <Calendar :size="14" />
                <span v-if="event.isRange">
                  {{ formatDate(event.dateStart) }} → {{ formatDate(event.dateEnd) }}
                </span>
                <span v-else>
                  {{ formatDate(event.dateStart) }}
                </span>
                <span v-if="event.isNow" class="ml-2 px-2 py-0.5 bg-red-500/10 text-red-600 rounded-full font-bold">
                  NOW
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else class="p-8">
      <div class="text-center mb-6">
        <h4 class="font-serif-luxury text-2xl italic text-slate-900">
          {{ calendarData.monthName }} {{ calendarData.year }}
        </h4>
      </div>
      
      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-2">
        <!-- Day Headers -->
        <div 
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
          :key="day"
          class="text-center text-xs font-bold uppercase tracking-wider text-slate-400 pb-2"
        >
          {{ day }}
        </div>
        
        <!-- Calendar Days -->
        <template v-for="(week, weekIdx) in calendarData.weeks" :key="weekIdx">
          <div 
            v-for="(dayData, dayIdx) in week" 
            :key="dayIdx"
            :class="['aspect-square rounded-xl border transition-all', 
                     dayData ? 'bg-white/50 border-slate-100 hover:border-slate-300 cursor-pointer' : 'bg-transparent border-transparent']"
          >
            <div v-if="dayData" class="h-full p-2 flex flex-col">
              <span class="text-sm font-semibold text-slate-700 mb-1">{{ dayData.day }}</span>
              
              <div class="flex-1 space-y-1 overflow-hidden">
                <div 
                  v-for="(event, eventIdx) in dayData.events.slice(0, 2)" 
                  :key="eventIdx"
                  :class="['w-full h-1.5 rounded-full', getEventColor(event.tags)]"
                  :title="event.title"
                />
                <span v-if="dayData.events.length > 2" class="text-[9px] text-slate-400 font-bold">
                  +{{ dayData.events.length - 2 }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Event Legend -->
      <div v-if="parsedEvents.length > 0" class="mt-6 pt-6 border-t border-slate-100">
        <div class="space-y-2">
          <div 
            v-for="(event, idx) in parsedEvents" 
            :key="idx"
            class="flex items-center gap-3 text-sm"
          >
            <div :class="['w-3 h-3 rounded-full flex-shrink-0', getEventColor(event.tags)]" />
            <span class="text-slate-700">{{ event.title }}</span>
            <span class="text-slate-400 text-xs ml-auto">{{ formatDate(event.dateStart) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glassmorphism enhancements */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

/* Smooth animations */
.group:hover .group-hover\:text-slate-700 {
  transition: color 0.2s ease;
}
</style>
