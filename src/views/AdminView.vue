<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; 
import { useRouter } from 'vue-router'; 

const authStore = useAuthStore();
const router = useRouter();

// --- State សម្រាប់ផ្ទុកទិន្នន័យ ---
const activeTab = ref('orders'); 
const isSubmitting = ref(false);
const orderFilter = ref('all'); 
const searchQuery = ref('');

const products = ref([]);
const banners = ref([]);
const chefs = ref([]);
const orders = ref([]); 
const users = ref([]); 

onMounted(async () => {
    // ១. ឆែកសិទ្ធិ Admin តាមរយៈអ៊ីមែលដែលបាន Login
    if (!authStore.isAdmin()) {
        alert("អ្នកមិនមានសិទ្ធិចូលទំព័រគ្រប់គ្រងទេ!");
        router.push('/'); 
        return;
    }

    // ២. ទាញទិន្នន័យមកបង្ហាញភ្លាមៗ
    fetchAllData();
});

const fetchAllData = async () => {
    await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchBanners(),
        fetchChefs(),
        fetchUsers()
    ]);
};

// --- Logic ទាញទិន្នន័យពី Supabase ---
const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    orders.value = data || [];
};

const fetchProducts = async () => { 
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false }); 
    products.value = data || []; 
};

const fetchUsers = async () => {
    const { data } = await supabase.from('app_users').select('*');
    users.value = data || [];
};

const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('id', { ascending: false });
    banners.value = data || [];
};

const fetchChefs = async () => {
    const { data } = await supabase.from('chefs').select('*').order('id', { ascending: false });
    chefs.value = data || [];
};

const updateOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) fetchOrders();
};

const formatItems = (itemsData) => {
    try {
        if (!itemsData) return [];
        const items = typeof itemsData === 'string' ? JSON.parse(itemsData) : itemsData;
        return Array.isArray(items) ? items : [];
    } catch (e) { return []; }
};

// Computed សម្រាប់ Search និង Filter
const filteredOrders = computed(() => {
    return orders.value.filter(order => {
        const statusMatch = orderFilter.value === 'all' || order.status === orderFilter.value;
        const searchLower = searchQuery.value.toLowerCase();
        const searchMatch = (order.customer_name?.toLowerCase().includes(searchLower)) || (order.phone?.includes(searchLower));
        return statusMatch && searchMatch;
    });
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    <div class="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
      <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
      <div class="flex gap-4">
        <button @click="fetchAllData" class="text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border hover:bg-gray-50">🔄 Refresh Data</button>
        <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto max-w-full hide-scrollbar">
          <button @click="activeTab = 'orders'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap" :class="activeTab === 'orders' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'">🔔 ការកុម្ម៉ង់</button>
          <button @click="activeTab = 'users'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap" :class="activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'">👥 អតិថិជន</button>
          <button @click="activeTab = 'products'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap" :class="activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'">មុខម្ហូប</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'orders'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="order in filteredOrders" :key="order.id" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div class="p-6">
              <h3 class="font-bold text-slate-800">#{{ order.id }} - {{ order.customer_name }}</h3>
              <p class="text-xs text-slate-500 mt-1">📞 {{ order.phone }}</p>
              <div class="bg-slate-50 rounded-xl p-3 mt-4">
                  <li v-for="(item, idx) in formatItems(order.items)" :key="idx" class="flex justify-between text-sm">
                      <span>{{ item.title }} x{{ item.quantity }}</span>
                  </li>
              </div>
              <p class="text-xl font-black text-orange-600 mt-4">${{ order.total_price }}</p>
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t flex gap-2">
              <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'completed')" class="w-full py-2 bg-green-500 text-white rounded-xl font-bold text-sm">បញ្ចប់</button>
          </div>
      </div>
    </div>

    <div v-if="activeTab === 'users'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="user in users" :key="user.id" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">👤</div>
          <div><p class="font-black">{{ user.phone || 'No Phone' }}</p></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
</style>