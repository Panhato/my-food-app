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

// State សម្រាប់បន្ថែមម្ហូបថ្មី
const newProduct = ref({ title: '', price: '', image: '', category: 'food' });
const isAdding = ref(false);

onMounted(async () => {
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

// 🔥 មុខងារគ្រប់គ្រងការកុម្ម៉ង់
const updateOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) fetchAllData();
};

// 🍔 មុខងារបន្ថែមម្ហូបថ្មី
const addProduct = async () => {
    isAdding.value = true;
    const { error } = await supabase.from('products').insert([newProduct.value]);
    if (!error) {
        alert("បន្ថែមម្ហូបជោគជ័យ!");
        newProduct.value = { title: '', price: '', image: '', category: 'food' };
        fetchAllData();
    }
    isAdding.value = false;
};

// 🗑️ មុខងារលុបម្ហូប
const deleteProduct = async (id) => {
    if (confirm("តើបងពិតជាចង់លុបមុខម្ហូបនេះមែនទេ?")) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) fetchAllData();
    }
};

const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-orange-100 text-orange-600';
        case 'delivering': return 'bg-blue-100 text-blue-600';
        case 'completed': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};

// គណនាលុយសរុបដែលលក់បាន
const totalSales = computed(() => {
    return orders.value
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-10 font-sans bg-slate-50 min-h-screen">
    
    <div class="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
      <h1 class="text-4xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
      
      <div class="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto max-w-full">
        <button @click="fetchAllData" :class="loading ? 'animate-spin' : ''" class="p-2 text-slate-500">🔄</button>
        <nav class="flex gap-2">
          <button @click="activeTab = 'orders'" :class="activeTab === 'orders' ? 'bg-orange-500 text-white' : 'text-slate-500'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all">🔔 ការកុម្ម៉ង់ ({{ orders.length }})</button>
          <button @click="activeTab = 'products'" :class="activeTab === 'products' ? 'bg-orange-500 text-white' : 'text-slate-500'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all">🍔 មុខម្ហូប</button>
          <button @click="activeTab = 'add_product'" :class="activeTab === 'add_product' ? 'bg-green-500 text-white' : 'text-slate-500'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all">➕ បន្ថែមម្ហូប</button>
        </nav>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <p class="text-slate-400 font-bold text-sm uppercase">លក់បានសរុប</p>
            <h2 class="text-4xl font-black text-green-500 mt-2">${{ totalSales.toFixed(2) }}</h2>
        </div>
        <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <p class="text-slate-400 font-bold text-sm uppercase">ការកុម្ម៉ង់ថ្មី</p>
            <h2 class="text-4xl font-black text-orange-500 mt-2">{{ orders.filter(o => o.status === 'pending').length }}</h2>
        </div>
        <div class="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <p class="text-slate-400 font-bold text-sm uppercase">មុខម្ហូបសរុប</p>
            <h2 class="text-4xl font-black text-blue-500 mt-2">{{ products.length }}</h2>
        </div>
    </div>

    <div v-if="activeTab === 'orders'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 flex justify-between bg-slate-50/50 border-b">
          <span class="font-black text-slate-800">#{{ order.id }}</span>
          <span :class="getStatusColor(order.status)" class="px-4 py-1 rounded-full text-[10px] font-black uppercase">{{ order.status }}</span>
        </div>
        <div class="p-8">
          <h4 class="font-bold text-lg">{{ order.customer_name }}</h4>
          <p class="text-sm text-slate-400">📞 {{ order.phone }}</p>
          <div class="mt-6 pt-6 border-t border-dashed flex justify-between items-center">
            <span class="text-2xl font-black text-orange-500">${{ order.total_price }}</span>
          </div>
        </div>
        <div class="p-6 pt-0 flex gap-2">
          <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'delivering')" class="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold text-xs">👨‍🍳 Cooking</button>
          <button v-if="order.status === 'delivering'" @click="updateOrderStatus(order.id, 'completed')" class="w-full py-3 bg-green-500 text-white rounded-2xl font-bold text-xs">✅ Done</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'add_product'" class="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <h2 class="text-2xl font-black text-slate-800 mb-8">បញ្ចូលមុខម្ហូបថ្មី</h2>
        <div class="space-y-6">
            <div>
                <label class="block text-sm font-bold text-slate-500 mb-2">ឈ្មោះម្ហូប</label>
                <input v-model="newProduct.title" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500" placeholder="ឧទាហរណ៍៖ បាយឆា">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-bold text-slate-500 mb-2">តម្លៃ ($)</label>
                    <input v-model="newProduct.price" type="number" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500" placeholder="0.00">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-500 mb-2">ប្រភេទ</label>
                    <select v-model="newProduct.category" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500">
                        <option value="food">ម្ហូបអាហារ</option>
                        <option value="drink">ភេសជ្ជៈ</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-500 mb-2">Link រូបភាព (URL)</label>
                <input v-model="newProduct.image" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500" placeholder="https://...">
            </div>
            <button @click="addProduct" :disabled="isAdding" class="w-full py-5 bg-orange-500 text-white rounded-3xl font-black shadow-xl shadow-orange-200 hover:scale-[1.02] transition-all">
                {{ isAdding ? 'កំពុងបញ្ចូល...' : 'យល់ព្រមបន្ថែមម្ហូប' }}
            </button>
        </div>
    </div>

    <div v-if="activeTab === 'products'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="p in products" :key="p.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm group relative">
        <button @click="deleteProduct(p.id)" class="absolute top-2 left-2 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
        <div class="relative h-40 overflow-hidden">
          <img :src="p.image" class="w-full h-full object-cover" />
          <div class="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-black text-orange-500">${{ p.price }}</div>
        </div>
        <div class="p-5 text-center">
          <p class="font-bold text-slate-800 truncate">{{ p.title }}</p>
        </div>
      </div>
    </div>

  </div>
</template>