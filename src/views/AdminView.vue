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

onMounted(async () => {
    // ១. ឆែកសិទ្ធិ Admin
    if (!authStore.isAdmin()) {
        alert("អ្នកមិនមានសិទ្ធិចូលទំព័រគ្រប់គ្រងទេ!");
        router.push('/'); 
        return;
    }
    // ២. ទាញទិន្នន័យមកបង្ហាញភ្លាមៗ
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

// មុខងារប្តូរពណ៌ status
const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700';
    }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div class="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
      <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
      <div class="flex gap-4">
        <button @click="fetchAllData" class="text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border hover:bg-gray-50 shadow-sm">🔄 Refresh</button>
        <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto max-w-full">
          <button @click="activeTab = 'orders'" :class="activeTab === 'orders' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all">🔔 ការកុម្ម៉ង់ ({{ orders.length }})</button>
          <button @click="activeTab = 'products'" :class="activeTab === 'products' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all">🍔 មុខម្ហូប</button>
          <button @click="activeTab = 'users'" :class="activeTab === 'users' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all">👥 អតិថិជន</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'orders'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-if="orders.length === 0" class="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">មិនទាន់មានការកុម្ម៉ង់ទេ</div>
      
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <span class="text-lg font-black text-slate-800">#{{ order.id }}</span>
              <span :class="getStatusColor(order.status)" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border">{{ order.status }}</span>
          </div>
          <div class="p-6 flex-grow">
              <div class="flex items-start gap-3 mb-4">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">👤</div>
                  <div>
                      <h3 class="font-bold text-slate-800">{{ order.customer_name }}</h3>
                      <p class="text-xs text-slate-500 font-medium">📞 {{ order.phone || '0987654321' }}</p>
                  </div>
              </div>
              <div class="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                  <span class="text-sm font-bold text-gray-400">សរុបទឹកប្រាក់</span>
                  <span class="text-2xl font-black text-orange-600">${{ order.total_price }}</span>
              </div>
          </div>
      </div>
    </div>

    <div v-if="activeTab === 'products'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="p in products" :key="p.id" class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <img :src="p.image" class="w-full h-32 object-cover" />
          <div class="p-3">
              <p class="font-bold text-sm truncate">{{ p.title }}</p>
              <p class="text-orange-600 font-black">${{ p.price }}</p>
          </div>
      </div>
    </div>

  </div>
</template>