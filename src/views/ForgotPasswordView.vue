<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

const authStore = useAuthStore();
const toast = useToastStore();
const email = ref('');
const isLoading = ref(false);

const handleReset = async () => {
  if (!email.value) return toast.show('សូមដាក់ Email របស់អ្នក!', 'error');
  isLoading.value = true;
  try {
    await authStore.resetPasswordEmail(email.value);
    toast.show('សូមពិនិត្យ Email របស់អ្នកដើម្បីប្តូរលេខកូដ!', 'success');
  } catch (error) {
    toast.show(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-gray-100 text-center">
      <h1 class="text-2xl font-black text-slate-800 mb-2">ភ្លេចពាក្យសម្ងាត់? 🔒</h1>
      <p class="text-slate-500 mb-6">វាយ Email របស់អ្នក យើងនឹងផ្ញើ Link សម្រាប់ប្តូរថ្មីជូន។</p>
      
      <input v-model="email" type="email" class="w-full p-3 mb-4 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-bold" placeholder="Email របស់អ្នក..." />
      
      <button @click="handleReset" :disabled="isLoading" class="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
        {{ isLoading ? 'កំពុងផ្ញើ...' : 'ផ្ញើ Link' }}
      </button>

      <div class="mt-4">
        <router-link to="/login" class="text-sm text-slate-500 hover:text-orange-600 font-bold">← ត្រឡប់ទៅចូលគណនី</router-link>
      </div>
    </div>
  </div>
</template>