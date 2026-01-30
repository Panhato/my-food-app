<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; 
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// --- State គ្រប់គ្រងទិន្នន័យ ---
const activeTab = ref('orders'); 
const loading = ref(false);

const products = ref([]);
const banners = ref([]);
const chefs = ref([]);
const orders = ref([]); 
const users = ref([]); 

onMounted(async () => {
    // 🛡️ ឆែកសិទ្ធិ៖ បើមិនមែនជា Admin ទេ គឺរុញទៅទំព័រដើមវិញ
    if (!authStore.isAdmin()) {
        router.push('/');
        return;
    }
    
    // បើជា Admin ពិតប្រាកដ គឺទាញទិន្នន័យមកបង្ហាញភ្លាម
    fetchAllData();
});

const fetchAllData = async () => {
    loading.value = true;
    await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchBanners(),
        fetchChefs(),
        fetchUsers()
    ]);
    loading.value = false;
};

// --- Logic ទាញទិន្នន័យ ---
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
    
    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p class="text-slate-500 text-sm mt-1">គ្រប់គ្រងទិន្នន័យហាងតាមរយៈ Gmail Admin</p>
        </div>
        
        <div class="flex items-center gap-3">
            <button @click="fetchAllData" :class="loading ? 'animate-spin text-orange-500' : 'text-slate-400'" class="p-2">🔄</button>
            <button @click="authStore.logout()" class="text-red-500 font-bold bg-white px-4 py-2 rounded-xl border border-red-100 hover:bg-red-50 transition-all shadow-sm">ចាកចេញ</button>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p class="text-slate-400 font-bold text-[10px] uppercase">ការកុម្ម៉ង់សរុប</p>
            <h3 class="text-2xl font-black text-slate-800">{{ orders.length }}</h3>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p class="text-slate-400 font-bold text-[10px] uppercase">មុខម្ហូបសរុប</p>
            <h3 class="text-2xl font-black text-orange-500">{{ products.length }}</h3>
        </div>
    </div>

    <div class="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm text-center">
        <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🏠</div>
        <h2 class="text-xl font-black text-slate-800 mb-2">អំពី MyFood Delivery</h2>
        <p class="text-slate-500 max-w-md mx-auto leading-relaxed">
            សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងហាងបាយ។ បងអាចគ្រប់គ្រងការកុម្ម៉ង់ មុខម្ហូប និង Banner ផ្សព្វផ្សាយបានយ៉ាងងាយស្រួលចេញពីទីនេះ។
        </p>
    </div>

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>