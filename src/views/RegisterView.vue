<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const toast = useToastStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const username = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  if (!email.value || !password.value || !username.value) {
    return toast.show('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់!', 'error');
  }
  isLoading.value = true;
  try {
    await auth.register(email.value, password.value, username.value);
    toast.show('ចុះឈ្មោះជោគជ័យ! សូមចូលគណនី', 'success');
    router.push('/login');
  } catch (error) {
    toast.show(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
      <h2 class="text-3xl font-black text-center text-orange-600 mb-2">បង្កើតគណនី</h2>
      <p class="text-center text-gray-400 mb-8">សូមស្វាគមន៍មកកាន់ MyFood</p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-600 mb-1">ឈ្មោះអ្នកប្រើ</label>
          <input v-model="username" type="text" placeholder="Your Name" class="w-full p-3 bg-slate-50 rounded-xl border focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-600 mb-1">អ៊ីមែល</label>
          <input v-model="email" type="email" placeholder="example@gmail.com" class="w-full p-3 bg-slate-50 rounded-xl border focus:border-orange-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-600 mb-1">ពាក្យសម្ងាត់</label>
          <input v-model="password" type="password" placeholder="******" class="w-full p-3 bg-slate-50 rounded-xl border focus:border-orange-500 outline-none" />
        </div>

        <button @click="handleRegister" :disabled="isLoading" class="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 mt-2">
          {{ isLoading ? 'កំពុងបង្កើត...' : 'ចុះឈ្មោះ' }}
        </button>
      </div>

      <p class="text-center mt-6 text-sm text-gray-500">
        មានគណនីរួចហើយ? 
        <router-link to="/login" class="text-orange-600 font-bold hover:underline">ចូលគណនី</router-link>
      </p>
    </div>
  </div>
</template>