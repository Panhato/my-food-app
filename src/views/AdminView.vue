<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; 
import { useRouter } from 'vue-router'; 

const authStore = useAuthStore();
const router = useRouter();

// --- State សម្រាប់ផ្ទុកទិន្នន័យ ---
const activeTab = ref('orders'); 
const orders = ref([]);
const products = ref([]);
const users = ref([]);
const banners = ref([]);
const chefs = ref([]);

onMounted(async () => {
    // ១. ឆែកសិទ្ធិ Admin ភ្លាមៗ
    if (!authStore.isAdmin()) {
        alert("អ្នកមិនមានសិទ្ធិចូលទំព័រគ្រប់គ្រងទេ!");
        router.push('/'); 
        return;
    }

    // ២. ទាញទិន្នន័យមកបង្ហាញ
    fetchAllData();
});

const fetchAllData = async () => {
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    orders.value = o || [];
    const { data: p } = await supabase.from('products').select('*').order('id', { ascending: false });
    products.value = p || [];
    const { data: u } = await supabase.from('app_users').select('*');
    users.value = u || [];
};

const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-700';
        case 'completed': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    <div class="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
      <h1 class="text-3xl font-black text-slate-800">Admin Dashboard</h1>
      <div class="flex gap-4">
        <button @click="fetchAllData" class="bg-white px-4 py-2 rounded-lg border hover:bg-gray-50">🔄 Refresh</button>
        <div class="flex bg-white p-1 rounded-xl border">
          <button @click="activeTab = 'orders'" :class="activeTab === 'orders' ? 'bg-orange-100 text-orange-700' : ''" class="px-4 py-2 rounded-lg font-bold">🔔 ការកុម្ម៉ង់ ({{ orders.length }})</button>
          <button @click="activeTab = 'products'" :class="activeTab === 'products' ? 'bg-blue-100 text-blue-700' : ''" class="px-4 py-2 rounded-lg font-bold">🍔 មុខម្ហូប</button>
          <button @click="activeTab = 'users'" :class="activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : ''" class="px-4 py-2 rounded-lg font-bold">👥 អតិថិជន</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'orders'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="orders.length === 0" class="col-span-full text-center py-20 text-gray-400">មិនមានការកុម្ម៉ង់ទេ</div>
      <div v-for="order in orders" :key="order.id" class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex justify-between mb-4">
            <span class="font-black text-lg">#{{ order.id }}</span>
            <span :class="getStatusColor(order.status)" class="px-3 py-1 rounded-full text-xs font-bold">{{ order.status }}</span>
          </div>
          <p class="font-bold text-slate-700">👤 {{ order.customer_name }}</p>
          <p class="text-sm text-slate-500">📞 {{ order.phone }}</p>
          <div class="mt-4 pt-4 border-t border-dashed">
            <p class="text-2xl font-black text-orange-600">${{ order.total_price }}</p>
          </div>
      </div>
    </div>

    <div v-if="activeTab === 'products'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="p in products" :key="p.id" class="bg-white rounded-2xl border overflow-hidden">
          <img :src="p.image" class="w-full h-32 object-cover" />
          <div class="p-3">
            <p class="font-bold text-sm truncate">{{ p.title }}</p>
            <p class="text-orange-600 font-bold">${{ p.price }}</p>
          </div>
      </div>
    </div>

    <div v-if="activeTab === 'users'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="user in users" :key="user.id" class="bg-white p-5 rounded-2xl border flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">👤</div>
          <div><p class="font-bold">{{ user.phone || 'No Phone' }}</p></div>
      </div>
    </div>

  </div>
</template>