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

// 🔥 ហៅមុខងារទាញទិន្នន័យភ្លាមៗនៅពេលបើក Page
onMounted(async () => {
    // 🛡️ ឆែកសិទ្ធិ៖ បើមិនមែនជា Gmail Admin ក្នុងបញ្ជីទេ គឺដេញចេញ
    if (!authStore.isAdmin()) {
        router.push('/');
        return;
    }
    
    // បើជា Admin ពិតប្រាកដ គឺទាញទិន្នន័យមកបង្ហាញស្វ័យប្រវត្តិ
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

// --- Logic ទាញទិន្នន័យ (រក្សានៅដដែល) ---
const fetchUsers = async () => {
    const { data } = await supabase.from('app_users').select('*');
    if (data) users.value = data;
};

const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) orders.value = data;
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
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-black text-slate-800">Admin Dashboard</h1>
        <div class="flex gap-2">
            <button @click="fetchAllData" :class="loading ? 'animate-spin' : ''" class="p-2">🔄</button>
            <button @click="authStore.logout()" class="text-red-500 font-bold bg-white px-4 py-2 rounded-lg border hover:bg-red-50">Logout</button>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p class="text-slate-400 font-bold text-xs uppercase">ការកុម្ម៉ង់ថ្មី</p>
            <h2 class="text-3xl font-black text-orange-500 mt-1">{{ orders.length }}</h2>
        </div>
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p class="text-slate-400 font-bold text-xs uppercase">មុខម្ហូបសរុប</p>
            <h2 class="text-3xl font-black text-blue-500 mt-1">{{ products.length }}</h2>
        </div>
    </div>

    <div class="bg-white p-10 rounded-3xl border border-dashed border-gray-300 text-center">
        <p class="text-gray-500">សូមស្វាគមន៍ Gmail Admin! ទិន្នន័យត្រូវបានទាញយកដោយជោគជ័យ។</p>
    </div>

  </div>
</template>