<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast'; // Use Toast for better alerts
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const toast = useToastStore();
const router = useRouter();

// State to switch between Login and Register modes
const isRegister = ref(false); 

// Form Inputs
const email = ref(''); // Switched from username to email for Supabase
const password = ref('');
const confirmPassword = ref(''); // For Register only
const username = ref(''); // Extra field for Register
const phone = ref('');    // Extra field for Register (Optional)

const isLoading = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value) {
      toast.show("សូមបំពេញអ៊ីមែល និងពាក្យសម្ងាត់!", "error");
      return;
  }

  isLoading.value = true;

  try {
      if (isRegister.value) {
        // ========================
        // REGISTER LOGIC (Supabase)
        // ========================
        if (password.value !== confirmPassword.value) {
            toast.show("ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!", "error");
            isLoading.value = false;
            return;
        }
        if (!username.value) {
             toast.show("សូមដាក់ឈ្មោះរបស់អ្នក!", "error");
             isLoading.value = false;
             return;
        }
        
        // Call register action from store
        await authStore.register(email.value, password.value, username.value, phone.value);
        
        toast.show("ចុះឈ្មោះជោគជ័យ! សូមស្វាគមន៍ 🎉", "success");
        router.push('/'); // Go to Home

      } else {
        // ========================
        // LOGIN LOGIC (Supabase)
        // ========================
        await authStore.login(email.value, password.value);
        
        toast.show("ចូលប្រើប្រាស់ជោគជ័យ! ✅", "success");
        
        // Check role to redirect
        if (authStore.isAdmin()) {
            router.push('/admin');
        } else {
            router.push('/');
        }
      }
  } catch (error) {
      console.error(error);
      toast.show(error.message || "មានបញ្ហា! សូមព្យាយាមម្តងទៀត", "error");
  } finally {
      isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
    <div class="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-gray-100">
      
      <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-orange-600 mb-2 tracking-tight">MyFood</h1>
          <p class="text-slate-500 font-bold text-lg">
              {{ isRegister ? 'បង្កើតគណនីថ្មី 🚀' : 'សូមស្វាគមន៍មកវិញ 👋' }}
          </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <div v-if="isRegister" class="animate-fade-in">
            <label class="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">ឈ្មោះរបស់អ្នក</label>
            <input v-model="username" type="text" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700" placeholder="Display Name" />
        </div>

        <div>
            <label class="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">អ៊ីមែល (Email)</label>
            <input v-model="email" type="email" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700" placeholder="example@gmail.com" />
        </div>
        
        <div v-if="isRegister" class="animate-fade-in">
            <label class="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">លេខទូរស័ព្ទ (Optional)</label>
            <input v-model="phone" type="tel" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700" placeholder="012..." />
        </div>

        <div>
            <label class="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">ពាក្យសម្ងាត់</label>
            <input v-model="password" type="password" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700" placeholder="••••••••" />
        </div>

        <div v-if="isRegister" class="animate-fade-in">
            <label class="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase">បញ្ជាក់ពាក្យសម្ងាត់</label>
            <input v-model="confirmPassword" type="password" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700" placeholder="••••••••" />
        </div>
        
        <button type="submit" :disabled="isLoading" class="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:shadow-xl transition-all active:scale-95 text-lg flex items-center justify-center gap-2 mt-6">
            <span v-if="isLoading" class="animate-spin">⏳</span>
            {{ isRegister ? 'ចុះឈ្មោះ (Sign Up)' : 'ចូលប្រើ (Login)' }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500 font-medium">
            {{ isRegister ? 'មានគណនីរួចហើយ?' : 'មិនទាន់មានគណនី?' }}
            <button @click="isRegister = !isRegister" class="text-orange-600 font-black hover:underline ml-1">
                {{ isRegister ? 'ចូលប្រើនៅទីនេះ' : 'ចុះឈ្មោះបង្កើតថ្មី' }}
            </button>
        </p>
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