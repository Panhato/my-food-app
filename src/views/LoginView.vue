<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// State សម្រាប់ប្តូររវាង Login និង Register
const isRegister = ref(false); 

const username = ref('');
const password = ref('');
const confirmPassword = ref(''); // សម្រាប់ Register
const errorMsg = ref('');

const handleSubmit = () => {
  errorMsg.value = '';

  if (isRegister.value) {
    // ========================
    // Logic សម្រាប់ ចុះឈ្មោះ (Register)
    // ========================
    if (!username.value || !password.value) {
        errorMsg.value = "សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!";
        return;
    }
    if (password.value !== confirmPassword.value) {
        errorMsg.value = "ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!";
        return;
    }
    
    // បង្កើត User ថ្មី (Role: User)
    const newUser = { username: username.value, role: 'user' };
    
    // Save ចូល LocalStorage (Simulation)
    localStorage.setItem('user', JSON.stringify(newUser));
    authStore.user = newUser; // Update ចូល Store ឱ្យជាប់ Login តែម្តង
    
    alert("ចុះឈ្មោះជោគជ័យ! សូមរីករាយជាមួយការកម្ម៉ង។");
    router.push('/'); // បោះទៅទំព័រដើមវិញ

  } else {
    // ========================
    // Logic សម្រាប់ ចូលប្រើ (Login)
    // ========================
    if (authStore.login(username.value, password.value)) {
        if (authStore.isAdmin()) {
            router.push('/admin');
        } else {
            router.push('/');
        }
    } else {
        errorMsg.value = 'ឈ្មោះ ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ!';
    }
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
      
      <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-orange-600 mb-2">My Food</h1>
          <p class="text-slate-500 font-bold text-lg">
              {{ isRegister ? 'បង្កើតគណនីថ្មី' : 'ចូលប្រើប្រាស់' }}
          </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <div>
            <label class="block text-sm font-bold text-slate-600 mb-1">ឈ្មោះគណនី</label>
            <input v-model="username" type="text" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all" placeholder="ឈ្មោះរបស់អ្នក..." />
        </div>
        
        <div>
            <label class="block text-sm font-bold text-slate-600 mb-1">ពាក្យសម្ងាត់</label>
            <input v-model="password" type="password" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all" placeholder="••••••••" />
        </div>

        <div v-if="isRegister" class="animate-fade-in">
            <label class="block text-sm font-bold text-slate-600 mb-1">បញ្ជាក់ពាក្យសម្ងាត់</label>
            <input v-model="confirmPassword" type="password" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all" placeholder="••••••••" />
        </div>
        
        <p v-if="errorMsg" class="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">{{ errorMsg }}</p>

        <button type="submit" class="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:shadow-xl transition-all active:scale-95 text-lg">
            {{ isRegister ? 'ចុះឈ្មោះ' : 'ចូលប្រើ' }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500">
            {{ isRegister ? 'មានគណនីរួចហើយ?' : 'មិនទាន់មានគណនី?' }}
            <button @click="isRegister = !isRegister; errorMsg = ''" class="text-orange-600 font-bold hover:underline ml-1">
                {{ isRegister ? 'ចូលប្រើនៅទីនេះ' : 'ចុះឈ្មោះបង្កើតថ្មី' }}
            </button>
        </p>
      </div>

      <div v-if="!isRegister" class="mt-8 pt-6 border-t border-dashed border-gray-200 text-center text-xs text-gray-400">
        <p class="mb-1 font-bold">គណនីសាកល្បង (Demo):</p>
        <p>Admin: <span class="font-mono bg-gray-100 px-1 rounded">admin</span> / <span class="font-mono bg-gray-100 px-1 rounded">admin123</span></p>
        <p>User: <span class="font-mono bg-gray-100 px-1 rounded">1234</span> (Password)</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>