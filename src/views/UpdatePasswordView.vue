<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const toast = useToastStore();
const router = useRouter();

const newPassword = ref('');
const isLoading = ref(false);

const handleUpdate = async () => {
  if (!newPassword.value) return toast.show('សូមដាក់ពាក្យសម្ងាត់ថ្មី!', 'error');
  isLoading.value = true;
  try {
    // ប្រើ updateProfile ដែលយើងមានស្រាប់ដើម្បីប្តូរ Password
    await authStore.updateProfile({ password: newPassword.value });
    toast.show('ប្តូរពាក្យសម្ងាត់ជោគជ័យ! ✅', 'success');
    router.push('/');
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
      <h1 class="text-2xl font-black text-slate-800 mb-2">ប្តូរពាក្យសម្ងាត់ថ្មី 🔑</h1>
      
      <input v-model="newPassword" type="password" class="w-full p-3 mb-4 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-bold" placeholder="ពាក្យសម្ងាត់ថ្មី..." />
      
      <button @click="handleUpdate" :disabled="isLoading" class="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all">
        {{ isLoading ? 'កំពុងប្តូរ...' : 'បញ្ជាក់ការប្តូរ' }}
      </button>
    </div>
  </div>
</template>