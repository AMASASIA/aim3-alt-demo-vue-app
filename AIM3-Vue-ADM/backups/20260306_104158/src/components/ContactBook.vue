<script setup>
import { ref, computed } from 'vue';
import { UserPlus, Users, Phone, MessageCircle, X, Trash2 } from 'lucide-vue-next';
import contactBook from '../services/contactBook.js';

const emit = defineEmits(['close', 'connect']);

const contacts = ref(contactBook.getAllContacts());
const showAddDialog = ref(false);

// New contact form
const newContact = ref({
  nickname: '',
  threadsId: '',
  instagramId: '',
  peerId: ''
});

const addContact = () => {
  if (!newContact.value.nickname) return;
  
  contactBook.addContact(newContact.value.nickname, {
    threadsId: newContact.value.threadsId,
    instagramId: newContact.value.instagramId,
    peerId: newContact.value.peerId
  });
  
  contacts.value = contactBook.getAllContacts();
  newContact.value = { nickname: '', threadsId: '', instagramId: '', peerId: '' };
  showAddDialog.value = false;
};

const deleteContact = (nickname) => {
  if (confirm(`Delete contact "${nickname}"?`)) {
    contactBook.deleteContact(nickname);
    contacts.value = contactBook.getAllContacts();
  }
};

const connectToContact = (contact, type) => {
  emit('connect', { contact, type });
};
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
    <div class="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="p-10 border-b border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-black rounded-full flex items-center justify-center">
            <Users :size="20" class="text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-serif-luxury italic font-bold">Contact Book</h2>
            <p class="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Amane Protocol Network</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="showAddDialog = true" class="px-6 py-3 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
            <UserPlus :size="14" />
            Add Contact
          </button>
          <button @click="$emit('close')" class="p-3 hover:bg-slate-100 rounded-full transition-all">
            <X :size="20" />
          </button>
        </div>
      </div>

      <!-- Contact List -->
      <div class="p-10 overflow-y-auto max-h-[60vh] custom-scroll">
        <div v-if="contacts.length === 0" class="text-center py-20 opacity-40">
          <Users :size="48" class="mx-auto mb-4 text-slate-300" />
          <p class="text-[13px] font-bold uppercase tracking-widest text-slate-400">No contacts yet</p>
          <p class="text-[11px] text-slate-300 mt-2">Add your first contact to get started</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="contact in contacts" 
            :key="contact.nickname"
            class="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group"
          >
            <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-2xl font-serif-luxury italic font-semibold">{{ contact.nickname }}</h3>
                <p class="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                  @{{ contact.threadsId || contact.instagramId }}
                </p>
              </div>
              <button @click="deleteContact(contact.nickname)" class="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full">
                <Trash2 :size="14" class="text-red-500" />
              </button>
            </div>

            <div class="space-y-2 mb-6">
              <div v-if="contact.threadsId" class="text-[11px] font-mono-light">
                <span class="text-slate-400">Threads:</span> 
                <span class="text-slate-700 ml-2">@{{ contact.threadsId }}</span>
              </div>
              <div v-if="contact.instagramId" class="text-[11px] font-mono-light">
                <span class="text-slate-400">Instagram:</span> 
                <span class="text-slate-700 ml-2">@{{ contact.instagramId }}</span>
              </div>
              <div v-if="contact.peerId" class="text-[11px] font-mono-light">
                <span class="text-slate-400">Peer ID:</span> 
                <span class="text-slate-700 ml-2">{{ contact.peerId.slice(0, 16) }}...</span>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                @click="connectToContact(contact, 'video')"
                :disabled="!contact.peerId"
                class="flex-1 py-3 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Phone :size="12" />
                Video
              </button>
              <button 
                @click="connectToContact(contact, 'chat')"
                :disabled="!contact.peerId"
                class="flex-1 py-3 bg-slate-200 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle :size="12" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Contact Dialog -->
      <div v-if="showAddDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[600] flex items-center justify-center p-6">
        <div class="bg-white rounded-[3rem] p-10 w-full max-w-lg">
          <h3 class="text-2xl font-serif-luxury italic font-bold mb-8">Add New Contact</h3>
          
          <div class="space-y-4">
            <input 
              v-model="newContact.nickname"
              type="text"
              placeholder="Nickname *"
              class="w-full bg-slate-50 rounded-2xl py-4 px-6 text-[14px] outline-none border border-transparent focus:border-slate-300 transition-all"
              required
            />
            <input 
              v-model="newContact.threadsId"
              type="text"
              placeholder="Threads ID (optional)"
              class="w-full bg-slate-50 rounded-2xl py-4 px-6 text-[14px] outline-none border border-transparent focus:border-slate-300 transition-all"
            />
            <input 
              v-model="newContact.instagramId"
              type="text"
              placeholder="Instagram ID (optional)"
              class="w-full bg-slate-50 rounded-2xl py-4 px-6 text-[14px] outline-none border border-transparent focus:border-slate-300 transition-all"
            />
            <input 
              v-model="newContact.peerId"
              type="text"
              placeholder="Peer ID (for P2P connection)"
              class="w-full bg-slate-50 rounded-2xl py-4 px-6 text-[14px] outline-none border border-transparent focus:border-slate-300 transition-all"
            />
          </div>

          <div class="flex gap-4 mt-8">
            <button @click="showAddDialog = false" class="flex-1 py-4 bg-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-300 transition-all">
              Cancel
            </button>
            <button @click="addContact" class="flex-1 py-4 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
              Add Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
