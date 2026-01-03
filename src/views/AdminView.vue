<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useToastStore } from '../stores/toast';

const toast = useToastStore();
const activeTab = ref('orders'); 
const isSubmitting = ref(false);

// 🔥 NEW: Filter & Search State
const orderFilter = ref('all'); // all, pending, cooking, delivering, completed
const searchQuery = ref('');

// Data state
const products = ref([]);
const banners = ref([]);
const chefs = ref([]);
const orders = ref([]); 
const users = ref([]); 

// ========================
// 0. USERS LOGIC
// ========================
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('last_seen', { ascending: false });

  if (!error) users.value = data || [];
};

const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = new Date() - new Date(lastSeen);
    return diff < 10 * 60 * 1000; 
};

// ========================
// 1. ORDER LOGIC (IMPROVED)
// ========================
const fetchOrders = async () => {
  // Get newest orders first
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) console.error(error);
  orders.value = data || [];
};

// 🔥 Computed Property for Filtering
const filteredOrders = computed(() => {
    return orders.value.filter(order => {
        // Filter by Status Tab
        const statusMatch = orderFilter.value === 'all' || order.status === orderFilter.value;
        
        // Filter by Search (Name, Phone, ID)
        const searchLower = searchQuery.value.toLowerCase();
        const searchMatch = 
            (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
            (order.phone && order.phone.includes(searchLower)) ||
            String(order.id).includes(searchLower);

        return statusMatch && searchMatch;
    });
});

// Helper for Status Color
const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'cooking': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'delivering': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
        case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const updateOrderStatus = async (id, newStatus) => {
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  if (!error) {
    toast.show(`Status updated to: ${newStatus}`, 'success');
    fetchOrders();
  } else {
    toast.show('Error updating status!', 'error');
  }
};

const formatDate = (timestamp) => {
    if(!timestamp) return '';
    return new Date(timestamp).toLocaleString('km-KH', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
};

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return new Date(date).toLocaleDateString('km-KH');
};

const formatItems = (itemsData) => {
    try {
        const items = typeof itemsData === 'string' ? JSON.parse(itemsData) : itemsData;
        return Array.isArray(items) ? items : [];
    } catch (e) { return []; }
};

// ========================
// 2. PRODUCTS LOGIC
// ========================
const newProduct = ref({ title: '', price: '', category: 'ម្ហូប', image: null, desc: '', imageFile: null });
const isEditingProduct = ref(false);
const editingProductId = ref(null);
const productFileInput = ref(null);

const fetchProducts = async () => { const { data } = await supabase.from('products').select('*').order('id', { ascending: false }); products.value = data || []; };

const handleProductUpload = (event) => { 
    const file = event.target.files[0]; 
    if (file) { 
        newProduct.value.imageFile = file; 
        newProduct.value.image = URL.createObjectURL(file); 
    } 
};

const handleProductSubmit = async () => { 
    if (!newProduct.value.title || !newProduct.value.price) return toast.show('Please fill info!', 'error');
    isSubmitting.value = true;
    try {
        let imageUrl = newProduct.value.image;
        if (newProduct.value.imageFile) {
            const fileExt = newProduct.value.imageFile.name.split('.').pop();
            const fileName = `prod_${Date.now()}.${fileExt}`;
            await supabase.storage.from('images').upload(fileName, newProduct.value.imageFile);
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }
        const payload = { title: newProduct.value.title, price: parseFloat(newProduct.value.price), category: newProduct.value.category, description: newProduct.value.desc, image: imageUrl };
        if (isEditingProduct.value) await supabase.from('products').update(payload).eq('id', editingProductId.value);
        else await supabase.from('products').insert(payload);
        toast.show('Success!', 'success'); resetProductForm(); fetchProducts();
    } catch (err) { toast.show(err.message, 'error'); } finally { isSubmitting.value = false; }
};

const startEdit = (item) => { isEditingProduct.value = true; editingProductId.value = item.id; newProduct.value = { ...item, desc: item.description, imageFile: null }; };
const deleteProduct = async (id) => { if(confirm("Delete?")) { await supabase.from('products').delete().eq('id', id); fetchProducts(); } };
const resetProductForm = () => { isEditingProduct.value = false; editingProductId.value = null; newProduct.value = { title: '', price: '', category: 'ម្ហូប', image: null, desc: '', imageFile: null }; if(productFileInput.value) productFileInput.value.value = ''; };

// ========================
// 3. BANNERS LOGIC
// ========================
const newBanner = ref({ title: '', subtitle: '', image: null, imageFile: null });
const bannerFileInput = ref(null);

const fetchBanners = async () => { const { data } = await supabase.from('banners').select('*').order('id', { ascending: false }); banners.value = data || []; };

const handleBannerUpload = (event) => { 
    const file = event.target.files[0]; 
    if (file) { 
        newBanner.value.imageFile = file; 
        newBanner.value.image = URL.createObjectURL(file); 
    } 
};

const handleBannerSubmit = async () => { 
    if (!newBanner.value.imageFile) return toast.show('Please add image!', 'error');
    isSubmitting.value = true;
    try {
        const fileExt = newBanner.value.imageFile.name.split('.').pop();
        const fileName = `banner_${Date.now()}.${fileExt}`;
        await supabase.storage.from('images').upload(fileName, newBanner.value.imageFile);
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        await supabase.from('banners').insert({ image: data.publicUrl, title: newBanner.value.title, subtitle: newBanner.value.subtitle });
        fetchBanners(); newBanner.value = { title: '', subtitle: '', image: null, imageFile: null };
        toast.show('Success!', 'success');
    } catch (err) { toast.show('Failed', 'error'); } finally { isSubmitting.value = false; }
};
const deleteBanner = async (id) => { if(confirm("Delete?")) { await supabase.from('banners').delete().eq('id', id); fetchBanners(); } };

// ========================
// 4. CHEF LOGIC
// ========================
const newChef = ref({ name: '', bio: '', image: null, imageFile: null });
const chefFileInput = ref(null);

const fetchChefs = async () => { const { data } = await supabase.from('chefs').select('*').order('id', { ascending: false }); chefs.value = data || []; };

const handleChefUpload = (event) => { 
    const file = event.target.files[0]; 
    if (file) { 
        newChef.value.imageFile = file; 
        newChef.value.image = URL.createObjectURL(file); 
    } 
};

const handleChefSubmit = async () => {
    if (!newChef.value.name) return toast.show('Add Name!', 'error');
    isSubmitting.value = true;
    try {
        let imgUrl = newChef.value.image;
        if(newChef.value.imageFile) {
            const fileExt = newChef.value.imageFile.name.split('.').pop();
            const fileName = `chef_${Date.now()}.${fileExt}`;
            await supabase.storage.from('images').upload(fileName, newChef.value.imageFile);
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            imgUrl = data.publicUrl;
        }
        await supabase.from('chefs').insert({ name: newChef.value.name, bio: newChef.value.bio, image: imgUrl });
        fetchChefs(); newChef.value = { name: '', bio: '', image: null, imageFile: null };
        toast.show('Success!', 'success');
    } catch (err) { toast.show('Failed', 'error'); } finally { isSubmitting.value = false; }
};
const deleteChef = async (id) => { if(confirm("Delete?")) { await supabase.from('chefs').delete().eq('id', id); fetchChefs(); } };

onMounted(() => {
  fetchOrders();
  fetchProducts();
  fetchBanners();
  fetchChefs();
  fetchUsers();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div class="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
        
        <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto max-w-full hide-scrollbar">
            <button @click="activeTab = 'orders'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'orders' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">🔔 ការកុម្ម៉ង់ ({{ orders.filter(o => o.status === 'pending').length }})</button>
            <button @click="activeTab = 'users'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'users' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">👥 អតិថិជន</button>
            <button @click="activeTab = 'products'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'products' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">មុខម្ហូប</button>
            <button @click="activeTab = 'banners'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'banners' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Banners</button>
            <button @click="activeTab = 'chef'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'chef' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Chef Info</button>
        </div>
    </div>

    <div v-if="activeTab === 'orders'" class="space-y-6">
        
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
            
            <div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <button @click="orderFilter = 'all'" :class="orderFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">ទាំងអស់</button>
                <button @click="orderFilter = 'pending'" :class="orderFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600'" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">Pending ({{ orders.filter(o => o.status === 'pending').length }})</button>
                <button @click="orderFilter = 'cooking'" :class="orderFilter === 'cooking' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">Cooking</button>
                <button @click="orderFilter = 'delivering'" :class="orderFilter === 'delivering' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">Delivering</button>
                <button @click="orderFilter = 'completed'" :class="orderFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600'" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors">Completed</button>
            </div>

            <div class="relative w-full md:w-64">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
                <input v-model="searchQuery" placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>
            
            <button @click="fetchOrders" class="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="Refresh">🔄</button>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p class="text-gray-400 text-lg">មិនមានការកុម្ម៉ង់ទេ</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div v-for="order in filteredOrders" :key="order.id" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                
                <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <span class="text-xs font-bold text-gray-400 block">ORDER ID</span>
                        <span class="text-lg font-black text-slate-800">#{{ order.id }}</span>
                    </div>
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border" :class="getStatusColor(order.status)">
                        {{ order.status }}
                    </span>
                </div>

                <div class="p-6 flex-grow">
                    <div class="flex items-start gap-4 mb-6">
                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">👤</div>
                        <div>
                            <h3 class="font-bold text-slate-800">{{ order.customer_name }}</h3>
                            <p class="text-xs text-slate-500 font-medium mt-0.5">📞 {{ order.phone }}</p>
                            <p class="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">📍 {{ order.address }}</p>
                            <p class="text-[10px] text-gray-400 mt-1">{{ formatDate(order.created_at) }}</p>
                        </div>
                    </div>

                    <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                        <p class="text-xs font-bold text-gray-400 mb-2 uppercase">មុខម្ហូប</p>
                        <ul class="space-y-2">
                            <li v-for="(item, idx) in formatItems(order.items)" :key="idx" class="flex justify-between text-sm font-bold text-slate-700">
                                <span>{{ item.title }} <span class="text-orange-500 text-xs">x{{ item.quantity }}</span></span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-sm font-bold text-gray-500">សរុបទឹកប្រាក់</span>
                        <span class="text-2xl font-black text-orange-600">${{ order.total_price }}</span>
                    </div>

                    <div v-if="order.receipt_url" class="mb-4">
                         <a :href="order.receipt_url" target="_blank" class="block w-full text-center py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                            🧾 មើលវិក្កយបត្រ (Slip)
                        </a>
                    </div>
                    <div v-else class="mb-4 text-center">
                        <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">💵 បង់លុយផ្ទាល់</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2" v-if="order.status !== 'completed' && order.status !== 'rejected'">
                        <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'cooking')" class="col-span-2 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 shadow-orange-200 shadow-md transition-all">
                            👨‍🍳 ចាប់ផ្តើមធ្វើ (Cooking)
                        </button>
                        
                        <button v-if="order.status === 'cooking'" @click="updateOrderStatus(order.id, 'delivering')" class="col-span-2 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 shadow-blue-200 shadow-md transition-all">
                            🛵 ចាប់ផ្តើមដឹក (Deliver)
                        </button>

                        <button v-if="order.status === 'delivering'" @click="updateOrderStatus(order.id, 'completed')" class="col-span-2 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 shadow-green-200 shadow-md transition-all">
                            ✅ ជោគជ័យ (Completed)
                        </button>

                        <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'rejected')" class="col-span-2 py-2 border border-red-100 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-all">
                            បដិសេធ (Reject)
                        </button>
                    </div>
                    
                    <div v-else class="text-center py-2">
                        <span class="text-sm font-bold text-gray-400">ត្រូវបានបញ្ចប់</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="font-black text-xl text-gray-800">All Users ({{ users.length }})</h2>
            <button @click="fetchUsers" class="p-2 bg-white border rounded-lg text-sm font-bold hover:bg-gray-50 text-gray-600">🔄 Refresh</button>
        </div>
        <div v-if="users.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"><p class="text-gray-400">No users have logged in yet.</p></div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div v-for="user in users" :key="user.id" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                 <div class="absolute top-0 right-0 p-3">
                     <span v-if="isOnline(user.last_seen)" class="flex items-center gap-1 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full"><span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</span>
                     <span v-else class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Offline</span>
                 </div>
                 <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">👤</div>
                     <div><p class="font-black text-lg text-slate-800">{{ user.phone }}</p><p class="text-xs text-gray-500">Last Seen: {{ formatTimeAgo(user.last_seen) }}</p></div>
                 </div>
             </div>
        </div>
    </div>

    <div v-if="activeTab === 'products'" class="flex flex-col xl:flex-row gap-8 items-start">
        <div class="w-full xl:w-[450px] flex-shrink-0 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="font-black text-xl mb-4 text-gray-800">{{ isEditingProduct ? 'Edit' : 'Add New' }}</h2>
            <div class="space-y-4">
                <input v-model="newProduct.title" placeholder="Food Name..." class="w-full p-3 bg-slate-50 rounded-xl border font-bold" />
                <div class="flex gap-2">
                    <input v-model="newProduct.price" type="number" placeholder="Price ($)" class="w-1/2 p-3 bg-slate-50 rounded-xl border font-bold" />
                    <select v-model="newProduct.category" class="w-1/2 p-3 bg-slate-50 rounded-xl border font-bold">
                        <option>ម្ហូប</option><option>ចៀន</option><option>សម្ល</option><option>ឆា</option><option>ភេសជ្ជៈ</option><option>បង្អែម</option>
                    </select>
                </div>
                <textarea v-model="newProduct.desc" placeholder="Description..." class="w-full p-3 bg-slate-50 rounded-xl border"></textarea>
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                    <input ref="productFileInput" type="file" @change="handleProductUpload" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" />
                    <div v-if="!newProduct.image" class="text-gray-400">📷 Add Image</div>
                    <img v-else :src="newProduct.image" class="h-32 mx-auto object-cover rounded-lg" />
                </div>
                <div class="flex gap-2">
                    <button v-if="isEditingProduct" @click="resetProductForm" class="flex-1 py-3 bg-gray-200 rounded-xl font-bold">Cancel</button>
                    <button @click="handleProductSubmit" :disabled="isSubmitting" class="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">
                        {{ isSubmitting ? '...' : (isEditingProduct ? 'Save' : 'Add') }}
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 class="font-bold mb-4">Food List ({{ products.length }})</h3>
            <div class="grid gap-3">
                <div v-for="p in products" :key="p.id" class="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50">
                    <div class="flex items-center gap-3">
                        <img :src="p.image" class="w-12 h-12 rounded-lg object-cover" />
                        <div><p class="font-bold">{{ p.title }}</p><p class="text-orange-600 font-bold">${{ p.price }}</p></div>
                    </div>
                    <div class="flex gap-2">
                        <button @click="startEdit(p)" class="p-2 bg-blue-50 text-blue-600 rounded-lg">✏️</button>
                        <button @click="deleteProduct(p.id)" class="p-2 bg-red-50 text-red-600 rounded-lg">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="activeTab === 'banners'" class="flex flex-col gap-8">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="font-black text-xl mb-4 text-gray-800">Upload Home Banner</h2>
            <div class="flex flex-col md:flex-row gap-4 items-end">
                <div class="flex-1 w-full space-y-3">
                     <div class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative h-32 flex items-center justify-center bg-slate-50">
                        <input ref="bannerFileInput" type="file" @change="handleBannerUpload" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" />
                        <div v-if="!newBanner.image" class="text-gray-400">📷 ចុចទីនេះដើម្បីដាក់រូប Banner</div>
                        <img v-else :src="newBanner.image" class="h-full object-contain rounded-lg" />
                     </div>
                     <input v-model="newBanner.title" placeholder="ចំណងជើង (Title)" class="w-full p-3 bg-slate-50 rounded-xl border" />
                     <input v-model="newBanner.subtitle" placeholder="អក្សរតូច (Subtitle)" class="w-full p-3 bg-slate-50 rounded-xl border" />
                </div>
                <button @click="handleBannerSubmit" :disabled="isSubmitting" class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl w-full md:w-auto hover:bg-blue-700">Upload</button>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div v-for="b in banners" :key="b.id" class="relative group h-48 rounded-2xl overflow-hidden shadow-sm">
                 <img :src="b.image" class="w-full h-full object-cover" />
                 <div class="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                     <p class="font-bold">{{ b.title }}</p>
                     <p class="text-xs opacity-80">{{ b.subtitle }}</p>
                 </div>
                 <button @click="deleteBanner(b.id)" class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
             </div>
        </div>
    </div>

    <div v-if="activeTab === 'chef'" class="flex flex-col gap-8">
         <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="font-black text-xl mb-4 text-gray-800">Add Chef (សម្រាប់ Banner ខាងឆ្វេង)</h2>
            <div class="flex flex-col md:flex-row gap-4 items-start">
                 <div class="w-32 h-32 bg-slate-50 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative cursor-pointer hover:border-green-500 flex-shrink-0">
                     <img v-if="newChef.image" :src="newChef.image" class="w-full h-full object-cover" />
                     <span v-else class="text-2xl text-gray-400">📷</span>
                     <input ref="chefFileInput" type="file" @change="handleChefUpload" class="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
                 <div class="flex-1 space-y-3 w-full">
                     <input v-model="newChef.name" placeholder="Chef Name..." class="w-full p-3 bg-slate-50 rounded-xl border font-bold" />
                     <textarea v-model="newChef.bio" placeholder="Bio..." class="w-full p-3 bg-slate-50 rounded-xl border"></textarea>
                 </div>
                 <button @click="handleChefSubmit" :disabled="isSubmitting" class="px-8 py-3 bg-green-600 text-white font-bold rounded-xl h-fit self-end w-full md:w-auto hover:bg-green-700">Add Chef</button>
            </div>
         </div>
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div v-for="c in chefs" :key="c.id" class="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 relative group">
                 <img :src="c.image" class="w-16 h-16 rounded-full object-cover border" />
                 <div><p class="font-bold text-lg">{{ c.name }}</p><p class="text-xs text-gray-500 line-clamp-2">{{ c.bio }}</p></div>
                 <button @click="deleteChef(c.id)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✖️</button>
             </div>
         </div>
    </div>

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>