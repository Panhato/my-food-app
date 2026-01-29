<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; 
import { useRouter } from 'vue-router'; 

const authStore = useAuthStore();
const router = useRouter();

// --- State គ្រប់គ្រងទិន្នន័យ ---
const activeTab = ref('orders'); 
const orders = ref([]);
const products = ref([]);
const loading = ref(false);

onMounted(async () => {
    // ឆែកសិទ្ធិ Admin
    if (!authStore.isAdmin()) {
        router.push('/'); 
        return;
    }
    fetchAllData();
});

const fetchAllData = async () => {
    loading.value = true;
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    orders.value = o || [];
    const { data: p } = await supabase.from('products').select('*').order('id', { ascending: false });
    products.value = p || [];
    loading.value = false;
};

// 🔥 មុខងារប្តូរស្ថានភាពការកុម្ម៉ង់ (Status Tracking)
const updateOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) fetchAllData();
};

const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-orange-100 text-orange-600';
        case 'delivering': return 'bg-blue-100 text-blue-600';
        case 'completed': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-10 font-sans bg-slate-50 min-h-screen">
    
    <div class="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
      <h1 class="text-4xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
      
      <div class="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <button @click="fetchAllData" :class="loading ? 'animate-spin' : ''" class="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">🔄</button>
        <div class="h-6 w-[1px] bg-slate-200"></div>
        <nav class="flex gap-2">
          <button @click="activeTab = 'orders'" :class="activeTab === 'orders' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg">🔔 ការកុម្ម៉ង់ ({{ orders.length }})</button>
          <button @click="activeTab = 'products'" :class="activeTab === 'products' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2 rounded-xl text-sm font-bold transition-all">🍔 មុខម្ហូប</button>
        </nav>
      </div>
    </div>

    <div v-if="activeTab === 'orders'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
        <div class="p-6 flex justify-between items-center border-b border-slate-50 bg-slate-50/30">
          <span class="text-xl font-black text-slate-800">#{{ order.id }}</span>
          <span :class="getStatusColor(order.status)" class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{{ order.status }}</span>
        </div>

        <div class="p-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl">👤</div>
            <div>
              <h4 class="font-bold text-slate-800 text-lg">{{ order.customer_name }}</h4>
              <p class="text-sm text-slate-400 font-medium">📞 {{ order.phone }}</p>
            </div>
          </div>
          
          <div class="flex justify-between items-end pt-6 border-t border-dashed border-slate-200">
            <span class="text-sm font-bold text-slate-400 uppercase tracking-wider">សរុបទឹកប្រាក់</span>
            <span class="text-3xl font-black text-orange-500">${{ order.total_price }}</span>
          </div>
        </div>

        <div class="p-6 pt-0">
          <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'delivering')" class="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">👨‍🍳 ចាប់ផ្តើមធ្វើ (Cooking)</button>
          <button v-if="order.status === 'delivering'" @click="updateOrderStatus(order.id, 'completed')" class="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">✅ រួចរាល់ (Done)</button>
          <div v-if="order.status === 'completed'" class="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold text-sm text-center">✨ បានបញ្ចប់រួចរាល់</div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'products'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="p in products" :key="p.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm group hover:shadow-lg transition-all">
        <div class="relative h-40 overflow-hidden">
          <img :src="p.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-orange-500 shadow-sm">${{ p.price }}</div>
        </div>
        <div class="p-5">
          <p class="font-bold text-slate-800 truncate">{{ p.title }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ឌីហ្សាញបន្ថែមសម្រាប់ឱ្យកាន់តែស្អាត */
.shadow-xl {
  shadow-color: rgba(0, 0, 0, 0.05);
}
</style>