<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useAuthStore } from '../stores/auth'; 
import { useRouter } from 'vue-router'; 

const authStore = useAuthStore();
const router = useRouter();

// --- State គ្រប់គ្រងទិន្នន័យ (រក្សានៅដដែល) ---
const activeTab = ref('orders'); 
const orders = ref([]);
const products = ref([]);
const banners = ref([]); 
const loading = ref(false);

// State សម្រាប់បន្ថែមម្ហូបថ្មី
const newProduct = ref({ title: '', price: '', image: '', category: 'food' });
const isAdding = ref(false);
const isUploading = ref(false); 

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
    const { data: b } = await supabase.from('banners').select('*').order('id', { ascending: false });
    banners.value = b || [];
    loading.value = false;
};

// 🔥 មុខងារ Upload រូបភាពទៅ Supabase Storage (រក្សានៅដដែល)
const handleFileUpload = async (event, target) => {
    const file = event.target.files[0];
    if (!file) return;

    isUploading.value = true;
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filePath, file);

    if (uploadError) {
        alert("Upload មិនបានសម្រេច: " + uploadError.message);
        isUploading.value = false;
        return;
    }

    const { data } = supabase.storage.from('food-images').getPublicUrl(filePath);
    
    if (target === 'product') {
        newProduct.value.image = data.publicUrl;
    } else if (target === 'banner') {
        await supabase.from('banners').insert([{ image: data.publicUrl }]);
        fetchAllData();
    }
    isUploading.value = false;
};

// 🔥 មុខងារគ្រប់គ្រងការកុម្ម៉ង់
const updateOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) fetchAllData();
};

// 🍔 មុខងារបន្ថែមម្ហូបថ្មី
const addProduct = async () => {
    if (!newProduct.value.image) return alert("សូមរង់ចាំ Upload រូបភាពឱ្យចប់សិន!");
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

// 🗑️ មុខងារលុប Banner
const deleteBanner = async (id) => {
    if (confirm("លុប Banner នេះមែនទេ?")) {
        await supabase.from('banners').delete().eq('id', id);
        fetchAllData();
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
          <button @click="activeTab = 'orders'" :class="activeTab === 'orders' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-lg">🔔 ការកុម្ម៉ង់ ({{ orders.length }})</button>
          <button @click="activeTab = 'products'" :class="activeTab === 'products' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all">🍔 មុខម្ហូប</button>
          <button @click="activeTab = 'add_product'" :class="activeTab === 'add_product' ? 'bg-green-500 text-white shadow-green-200' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all">➕ បន្ថែមម្ហូប</button>
          <button @click="activeTab = 'banners'" :class="activeTab === 'banners' ? 'bg-indigo-500 text-white shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all">🖼️ Banner</button>
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

    <div v-if="activeTab === 'orders'" class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
        <div class="flex flex-col md:flex-row">
          <div class="p-8 border-b md:border-b-0 md:border-r border-slate-100 flex-1 bg-slate-50/30">
            <div class="flex justify-between items-center mb-4">
              <span class="text-xl font-black text-slate-800">#{{ order.id }}</span>
              <span :class="getStatusColor(order.status)" class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{{ order.status }}</span>
            </div>
            <h4 class="font-bold text-slate-800 text-lg">{{ order.customer_name }}</h4>
            <p class="text-sm text-slate-400 font-medium mt-1">📞 {{ order.phone }}</p>
          </div>

          <div class="p-8 flex-1 flex flex-col justify-center items-center">
            <p class="text-xs font-black text-slate-400 uppercase mb-1">សរុបទឹកប្រាក់</p>
            <span class="text-3xl font-black text-orange-500">${{ order.total_price }}</span>
          </div>

          <div class="p-8 flex-1 flex flex-col justify-center gap-2 bg-white">
            <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'delivering')" class="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all">👨‍🍳 ចាប់ផ្តើមធ្វើ (Cooking)</button>
            <button v-if="order.status === 'delivering'" @click="updateOrderStatus(order.id, 'completed')" class="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-green-100 hover:scale-[1.02] transition-all">✅ រួចរាល់ (Done)</button>
            <div v-if="order.status === 'completed'" class="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold text-xs text-center">✨ បានបញ្ចប់រួចរាល់</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'add_product'" class="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <h2 class="text-2xl font-black text-slate-800 mb-8">បញ្ចូលមុខម្ហូបថ្មី</h2>
        <div class="space-y-6">
            <div>
                <label class="block text-sm font-bold text-slate-500 mb-2 ml-2">ឈ្មោះម្ហូប</label>
                <input v-model="newProduct.title" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500" placeholder="ឧទាហរណ៍៖ បាយឆា">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-bold text-slate-500 mb-2 ml-2">តម្លៃ ($)</label>
                    <input v-model="newProduct.price" type="number" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500" placeholder="0.00">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-500 mb-2 ml-2">ប្រភេទម្ហូប</label>
                    <select v-model="newProduct.category" class="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-600">
                        <option value="breakfast">☕ អាហារពេលព្រឹក</option>
                        <option value="lunch">🍚 អាហារពេលថ្ងៃ</option>
                        <option value="dinner">🍛 អាហារពេលល្ងាច</option>
                        <option value="drink">🥤 ភេសជ្ជៈ</option>
                        <option value="snack">🍟 អាហារសម្រន់</option>
                        <option value="dessert">🍰 បង្អែម</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-500 mb-2 ml-2">រូបភាពម្ហូប (ជ្រើសរើសពី Computer)</label>
                <input type="file" @change="e => handleFileUpload(e, 'product')" accept="image/*" class="w-full p-4 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                <p v-if="isUploading" class="text-xs text-orange-500 mt-2 italic">กำลัง Upload រូបភាព...</p>
                <img v-if="newProduct.image" :src="newProduct.image" class="mt-4 w-32 h-32 object-cover rounded-2xl shadow-md border border-white">
            </div>
            <button @click="addProduct" :disabled="isAdding || isUploading" class="w-full py-5 bg-orange-500 text-white rounded-3xl font-black shadow-xl shadow-orange-200 hover:scale-[1.02] transition-all">
                {{ isAdding ? 'កំពុងបញ្ចូល...' : 'យល់ព្រមបន្ថែមម្ហូប' }}
            </button>
        </div>
    </div>

    <div v-if="activeTab === 'banners'" class="space-y-10">
        <div class="max-w-xl mx-auto bg-white p-8 rounded-[32px] border border-dashed border-indigo-200 text-center">
            <h3 class="font-black text-slate-700 mb-4 text-xl">បន្ថែម Banner ថ្មី</h3>
            <input type="file" @change="e => handleFileUpload(e, 'banner')" accept="image/*" class="hidden" id="bannerUpload">
            <label for="bannerUpload" class="cursor-pointer inline-block px-10 py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all">
                {{ isUploading ? 'កំពុង Upload...' : '📁 ជ្រើសរើសរូបភាព Banner' }}
            </label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="b in banners" :key="b.id" class="relative group rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <img :src="b.image" class="w-full h-48 object-cover">
                <button @click="deleteBanner(b.id)" class="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">🗑️</button>
            </div>
        </div>
    </div>

    <div v-if="activeTab === 'products'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="p in products" :key="p.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm group relative hover:shadow-lg transition-all">
        <button @click="deleteProduct(p.id)" class="absolute top-2 left-2 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
        <div class="relative h-40 overflow-hidden">
          <img :src="p.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-orange-500 shadow-sm">${{ p.price }}</div>
        </div>
        <div class="p-5 text-center">
          <p class="font-bold text-slate-800 truncate">{{ p.title }}</p>
        </div>
      </div>
    </div>

  </div>
</template>