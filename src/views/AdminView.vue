<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; 
import { useRouter } from 'vue-router'; // 🔥 បន្ថែម Router ដើម្បីដេញចេញបើមិនមែន Admin

const authStore = useAuthStore();
const router = useRouter();

// ==========================================
// 🔐 លុបផ្នែក Password ចេញ និងប្រើ isAdmin ជំនួសវិញ
// ==========================================
// លុប inputPassword និង isUnlocked ចាស់ចោល

onMounted(async () => {
    // 🔥 ឆែកមើលថា តើគាត់បាន Login ហើយជា Admin ឬនៅ?
    if (!authStore.isAdmin()) {
        alert("អ្នកមិនមានសិទ្ធិចូលទំព័រគ្រប់គ្រងទេ!");
        router.push('/'); // ដេញទៅទំព័រដើម
        return;
    }

    // បើជា Admin ពិតប្រាកដ ឱ្យវាទាញទិន្នន័យមកបង្ហាញភ្លាម
    fetchOrders();
    fetchProducts();
    fetchBanners();
    fetchChefs();
    fetchUsers();
});
// ==========================================

// State (រក្សានៅដដែល)
const activeTab = ref('orders'); 
const isSubmitting = ref(false);
const orderFilter = ref('all'); 
const searchQuery = ref('');

const products = ref([]);
const banners = ref([]);
const chefs = ref([]);
const orders = ref([]); 
const users = ref([]); 

// ... (កូដ Logic ផ្សេងៗដូចជា fetchOrders, updateOrderStatus ទុកនៅដដែលទាំងអស់) ...
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div>
        <div class="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
            <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
            
            <div class="flex gap-4">
                 <button @click="fetchOrders" class="text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border hover:bg-gray-50">🔄 Refresh Data</button>

                 <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto max-w-full hide-scrollbar">
                    <button @click="activeTab = 'orders'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'orders' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">🔔 ការកុម្ម៉ង់ ({{ orders.filter(o => o.status === 'pending').length }})</button>
                    <button @click="activeTab = 'users'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'users' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">👥 អតិថិជន</button>
                    <button @click="activeTab = 'products'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'products' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">មុខម្ហូប</button>
                    <button @click="activeTab = 'banners'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'banners' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Banners</button>
                    <button @click="activeTab = 'chef'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'chef' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Chef Info</button>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'orders'"> ... </div>
        <div v-if="activeTab === 'users'"> ... </div>
        </div>

  </div>
</template>