<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; // 🔥 Import Store ដើម្បីឆែកលេខកូដ

const authStore = useAuthStore();

// ==========================================
// 🔐 ផ្នែកគ្រប់គ្រងសោរ (ADMIN SECURITY)
// ==========================================
// ប្តូរពី 'Admin123@@##' មកជា '' (ទទេ) ដើម្បីឱ្យបងវាយបញ្ចូលថ្មីបាន
const inputPassword = ref(''); 
const isUnlocked = ref(false); 

const unlockAdmin = () => {
    // ហៅមុខងារ verifyAdminPassword ពី Store មកឆែកជាមួយ "1234Admin##$$"
    if (authStore.verifyAdminPassword(inputPassword.value)) {
        isUnlocked.value = true; 
        
        // ចាប់ផ្តើមទាញទិន្នន័យពេលដោះសោរបានជោគជ័យ
        fetchOrders();
        fetchProducts();
        fetchBanners();
        fetchChefs();
        fetchUsers();
    } else {
        alert("លេខសម្ងាត់មិនត្រឹមត្រូវ! សូមព្យាយាមម្តងទៀត។");
        inputPassword.value = '';
    }
};
// ==========================================

// --- State ផ្សេងៗ ---
const activeTab = ref('orders'); 
const isSubmitting = ref(false);
const orderFilter = ref('all'); 
const searchQuery = ref('');

const products = ref([]);
const banners = ref([]);
const chefs = ref([]);
const orders = ref([]); 
const users = ref([]); 

// Notification Helper
const showNotification = (msg, type = 'success') => {
    alert(`${type === 'success' ? '✅' : '❌'} ${msg}`);
};

// --- Logic ទាញទិន្នន័យ (ហៅប្រើក្នុង unlockAdmin) ---
const fetchUsers = async () => {
  try {
      const { data, error } = await supabase.from('app_users').select('*');
      if (!error) users.value = data || [];
  } catch (err) { console.log("Users fetch error"); }
};

const fetchOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (!error) orders.value = data || [];
};

const fetchProducts = async () => { 
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false }); 
    products.value = data || []; 
};

const fetchBanners = async () => { 
    const { data } = await supabase.from('banners').select('*').order('id', { ascending: false }); 
    banners.value = data || []; 
};

const fetchChefs = async () => { 
    const { data } = await supabase.from('chefs').select('*').order('id', { ascending: false }); 
    chefs.value = data || []; 
};

// ... (មុខងារ Update, Delete, Submit ផ្សេងៗរបស់បងទុកនៅដដែល) ...

</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div v-if="!isUnlocked" class="flex flex-col items-center justify-center min-h-[80vh]">
         <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-200">
            <div class="text-6xl mb-4">🔒</div>
            <h2 class="text-2xl font-black text-slate-800 mb-2">Admin Security</h2>
            <p class="mb-6 text-gray-500 text-sm">សូមវាយបញ្ចូលលេខកូដដើម្បីចូលគ្រប់គ្រង</p>
            
            <input
              v-model="inputPassword"
              type="password"
              placeholder="វាយលេខកូដសម្ងាត់..."
              class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              @keyup.enter="unlockAdmin"
            />
            
            <button @click="unlockAdmin" class="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg">
               ដោះសោរ (Unlock)
            </button>
         </div>
    </div>

    <div v-else>
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black text-slate-800">Admin Dashboard</h1>
            <button @click="isUnlocked = false" class="text-red-500 font-bold bg-white px-4 py-2 rounded-lg border hover:bg-red-50">🔒 ចាកចេញ</button>
        </div>
        
        <div class="bg-white p-10 rounded-3xl border border-dashed border-gray-300 text-center">
            <p class="text-gray-500">សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រង!</p>
        </div>
    </div>

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>