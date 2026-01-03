<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast'; 

const authStore = useAuthStore();
const toast = useToastStore();

const fileInput = ref(null); 
const isEditing = ref(false);

const form = ref({
  username: '',
  phone: '',
  address: '',
  avatar: null 
});

// 🔥 Computed Property: ជួយចាប់យកទិន្នន័យពី Supabase user_metadata មកប្រើងាយស្រួល
const userProfile = computed(() => {
    return authStore.user?.user_metadata || {};
});

// ពេលបើកមកភ្លាម Load ទិន្នន័យដាក់ចូល Form
onMounted(() => {
  if (authStore.user) {
    loadUserData();
  }
});

const loadUserData = () => {
    // 🔥 កែសម្រួល៖ ទាញពី user_metadata ជំនួសឱ្យ user ផ្ទាល់
    const metadata = authStore.user?.user_metadata || {};
    
    form.value.username = metadata.username || '';
    form.value.phone = metadata.phone || '';
    form.value.address = metadata.address || '';
    form.value.avatar = metadata.avatar || null; 
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            toast.show("រូបភាពធំពេក! សូមជ្រើសរើសរូបក្រោម 2MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            form.value.avatar = e.target.result; 
        };
        reader.readAsDataURL(file);
    }
};

const handleUpdate = async () => {
  if (!form.value.username) {
    toast.show("សូមបំពេញឈ្មោះគណនីរបស់អ្នក!", "error");
    return;
  }

  try {
      // 🔥 ប្រើ await ព្រោះ updateProfile ជា async function
      await authStore.updateProfile({
        username: form.value.username,
        phone: form.value.phone,
        address: form.value.address,
        avatar: form.value.avatar 
      });

      toast.show("ព័ត៌មានត្រូវបានកែប្រែដោយជោគជ័យ!", "success");
      isEditing.value = false;
  } catch (error) {
      console.error(error);
      toast.show("មានបញ្ហាក្នុងការរក្សាទុក!", "error");
  }
};

const cancelEdit = () => {
  loadUserData(); 
  isEditing.value = false;
  toast.show("ការកែប្រែត្រូវបានបោះបង់", "info"); // Changed to info for better UX
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      
      <div class="h-40 animated-gradient relative">
         <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg class="relative block w-full h-[40px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-white opacity-30"></path>
            </svg>
         </div>

         <div class="absolute -bottom-12 left-8 group z-10">
            <div 
                class="relative w-28 h-28 bg-white rounded-full p-1 shadow-2xl cursor-pointer overflow-hidden transition-transform active:scale-95" 
                @click="isEditing && triggerFileInput()"
                :class="isEditing ? 'hover:ring-4 hover:ring-orange-300 ring-offset-2' : ''"
            >
                <img v-if="isEditing ? form.avatar : userProfile.avatar" :src="isEditing ? form.avatar : userProfile.avatar" class="w-full h-full rounded-full object-cover border-2 border-slate-100" />
                
                <div v-else class="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl text-slate-300 select-none">
                    👤
                </div>

                <div v-if="isEditing" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <span class="text-white text-2xl drop-shadow-md">📷</span>
                </div>

                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
            </div>
         </div>
      </div>

      <div class="pt-16 px-8 pb-8">
        
        <div class="flex justify-between items-start mb-6">
            <div>
                <h1 class="text-2xl font-black text-slate-800">{{ userProfile.username || 'អតិថិជន' }}</h1>
                <span class="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-bold uppercase">
                    {{ userProfile.role || 'User' }} Account
                </span>
                <p class="text-xs text-gray-400 mt-1 font-bold">{{ authStore.user?.email }}</p>
            </div>
            
            <button 
                v-if="!isEditing"
                @click="isEditing = true"
                class="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg"
            >
                ✏️ កែព័ត៌មាន
            </button>
        </div>

        <div v-if="!isEditing" class="space-y-6 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-xs text-slate-400 font-bold uppercase mb-1">លេខទូរស័ព្ទ</p>
                    <p class="text-slate-800 font-bold text-lg">{{ userProfile.phone || 'មិនទាន់បំពេញ' }}</p>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-xs text-slate-400 font-bold uppercase mb-1">អាស័យដ្ឋាន</p>
                    <p class="text-slate-800 font-bold text-lg">{{ userProfile.address || 'មិនទាន់បំពេញ' }}</p>
                </div>
            </div>
        </div>

        <div v-else class="space-y-5 animate-fade-in">
            
            <div class="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium flex gap-2 items-center border border-blue-100">
                <span>💡</span>
                <span>ចុចលើរូបភាពខាងលើ ដើម្បីផ្លាស់ប្តូររូប Profile</span>
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-600 mb-2">ឈ្មោះគណនី</label>
                <input v-model="form.username" type="text" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50" />
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-600 mb-2">លេខទូរស័ព្ទ</label>
                <input v-model="form.phone" type="text" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50" placeholder="012 345 678" />
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-600 mb-2">អាស័យដ្ឋាន</label>
                <textarea v-model="form.address" rows="3" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 bg-slate-50" placeholder="ផ្ទះលេខ... ផ្លូវ..."></textarea>
            </div>

            <div class="flex gap-3 pt-4">
                <button @click="cancelEdit" class="flex-1 py-3 bg-gray-100 text-slate-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">បោះបង់</button>
                <button @click="handleUpdate" class="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all">💾 រក្សាទុក</button>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🔥 Animation សម្រាប់ពណ៌រត់ */
.animated-gradient {
  background: linear-gradient(-45deg, #ff7e5f, #feb47b, #ff5e62, #6a11cb, #2575fc);
  background-size: 400% 400%;
  animation: gradientMove 10s ease infinite; 
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>