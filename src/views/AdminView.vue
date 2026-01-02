<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase'; 
import { useToastStore } from '../stores/toast';

const toast = useToastStore();
const activeTab = ref('orders'); 
const isSubmitting = ref(false);

// Data state
const products = ref([]);
const banners = ref([]);
const chefs = ref([]);
const orders = ref([]); 
const users = ref([]); // 🔥 Store User Data

// ========================
// 0. USERS LOGIC (NEW 🔥)
// ========================
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('last_seen', { ascending: false }); // Most recent users first

  if (!error) users.value = data || [];
};

// Check Online Status (Active within last 10 mins)
const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = new Date() - new Date(lastSeen);
    return diff < 10 * 60 * 1000; // 10 minutes
};

// ========================
// ORDER LOGIC
// ========================
const fetchOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
  if (error) console.error(error);
  orders.value = data || [];
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
    return new Date(timestamp).toLocaleString('km-KH');
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
        return Array.isArray(items) ? items.map(i => `${i.title} (x${i.quantity})`).join(', ') : itemsData;
    } catch (e) { return itemsData; }
};

// ========================
// PRODUCTS, BANNERS, CHEFS LOGIC (Keep as is)
// ========================
const newProduct = ref({ title: '', price: '', category: 'ម្ហូប', image: null, desc: '', imageFile: null });
const isEditingProduct = ref(false);
const editingProductId = ref(null);
const productFileInput = ref(null);
const fetchProducts = async () => { const { data } = await supabase.from('products').select('*').order('id', { ascending: false }); products.value = data || []; };
const handleProductUpload = (event) => { const file = event.target.files[0]; if (file) { newProduct.value.imageFile = file; newProduct.value.image = URL.createObjectURL(file); } };
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

const newBanner = ref({ title: '', subtitle: '', image: null, imageFile: null });
const bannerFileInput = ref(null);
const fetchBanners = async () => { const { data } = await supabase.from('banners').select('*').order('id', { ascending: false }); banners.value = data || []; };
const handleBannerUpload = (event) => { const file = event.target.files[0]; if (file) { newBanner.value.imageFile = file; newBanner.value.image = URL.createObjectURL(file); } };
const handleBannerSubmit = async () => { 
    if (!newBanner.value.imageFile) return toast.show('Add image!', 'error');
    const fileExt = newBanner.value.imageFile.name.split('.').pop();
    const fileName = `banner_${Date.now()}.${fileExt}`;
    await supabase.storage.from('images').upload(fileName, newBanner.value.imageFile);
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    await supabase.from('banners').insert({ image: data.publicUrl, title: newBanner.value.title, subtitle: newBanner.value.subtitle });
    fetchBanners(); newBanner.value = { title: '', subtitle: '', image: null, imageFile: null };
};
const deleteBanner = async (id) => { if(confirm("Delete?")) { await supabase.from('banners').delete().eq('id', id); fetchBanners(); } };

const newChef = ref({ name: '', bio: '', image: null, imageFile: null });
const chefFileInput = ref(null);
const fetchChefs = async () => { const { data } = await supabase.from('chefs').select('*').order('id', { ascending: false }); chefs.value = data || []; };
const handleChefUpload = (event) => { const file = event.target.files[0]; if (file) { newChef.value.imageFile = file; newChef.value.image = URL.createObjectURL(file); } };
const handleChefSubmit = async () => {
    if (!newChef.value.name) return toast.show('Add Name!', 'error');
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
};
const deleteChef = async (id) => { if(confirm("Delete?")) { await supabase.from('chefs').delete().eq('id', id); fetchChefs(); } };

onMounted(() => {
  fetchOrders();
  fetchProducts();
  fetchBanners();
  fetchChefs();
  fetchUsers(); // 🔥 Call Users
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
        
        <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto max-w-full">
            <button @click="activeTab = 'orders'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'orders' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">🔔 Orders</button>
            <button @click="activeTab = 'users'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'users' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">👥 Users</button>
            <button @click="activeTab = 'products'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'products' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Products</button>
            <button @click="activeTab = 'banners'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'banners' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Banners</button>
            <button @click="activeTab = 'chef'" class="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all" :class="activeTab === 'chef' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Chef Info</button>
        </div>
    </div>

    <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="font-black text-xl text-gray-800">All Users ({{ users.length }})</h2>
            <button @click="fetchUsers" class="p-2 bg-white border rounded-lg text-sm font-bold hover:bg-gray-50 text-gray-600">🔄 Refresh</button>
        </div>

        <div v-if="users.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
             <p class="text-gray-400">No users have logged in yet.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div v-for="user in users" :key="user.id" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                 <div class="absolute top-0 right-0 p-3">
                     <span v-if="isOnline(user.last_seen)" class="flex items-center gap-1 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                     </span>
                     <span v-else class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Offline
                     </span>
                 </div>

                 <div class="flex items-center gap-4">
                     <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                         👤
                     </div>
                     <div>
                         <p class="font-black text-lg text-slate-800">{{ user.phone }}</p>
                         <p class="text-xs text-gray-500">Last Seen: {{ formatTimeAgo(user.last_seen) }}</p>
                     </div>
                 </div>
             </div>
        </div>
    </div>

    <div v-if="activeTab === 'orders'" class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="font-black text-xl text-gray-800">New Orders ({{ orders.length }})</h2>
            <button @click="fetchOrders" class="p-2 bg-white border rounded-lg text-sm font-bold hover:bg-gray-50 text-gray-600">🔄 Refresh</button>
        </div>
        <div v-if="orders.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p class="text-gray-400">No orders yet</p>
        </div>
        <div v-else class="grid gap-4">
            <div v-for="order in orders" :key="order.id" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-2" :class="{'bg-yellow-400': order.status==='pending','bg-orange-500': order.status==='cooking','bg-blue-500': order.status==='delivering','bg-green-500': order.status==='completed','bg-red-500': order.status==='rejected'}"></div>
                <div class="flex-1 pl-4">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <span class="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-500">ID: #{{ order.id }}</span>
                        <span class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</span>
                        <span class="text-xs font-bold px-2 py-1 rounded uppercase text-white" :class="{'bg-yellow-400': order.status==='pending','bg-orange-500': order.status==='cooking','bg-blue-500': order.status==='delivering','bg-green-500': order.status==='completed','bg-red-500': order.status==='rejected'}">
                             {{ order.status === 'pending' ? 'Pending' : order.status === 'cooking' ? 'Cooking' : order.status === 'delivering' ? 'Delivering' : order.status === 'completed' ? 'Completed' : 'Rejected' }}
                        </span>
                    </div>
                    <h3 class="font-black text-xl text-slate-800">{{ order.customer_name }}</h3>
                    <div class="text-gray-500 text-sm mt-1">📞 {{ order.phone }} | 📍 {{ order.address }}</div>
                    <div class="mt-4 bg-gray-50 p-3 rounded-xl"><p class="text-sm font-medium text-gray-700">{{ formatItems(order.items) }}</p></div>
                </div>
                <div class="flex flex-col items-end justify-between gap-4 pl-4 border-l border-gray-50">
                    <p class="text-3xl font-black text-orange-600">${{ order.total_price }}</p>
                    <div class="flex flex-col gap-2 w-full">
                        <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'cooking')" class="px-6 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600">👨‍🍳 Start Cooking</button>
                        <button v-if="order.status === 'cooking'" @click="updateOrderStatus(order.id, 'delivering')" class="px-6 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600">🛵 Start Delivery</button>
                        <button v-if="order.status === 'delivering'" @click="updateOrderStatus(order.id, 'completed')" class="px-6 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600">✅ Delivered</button>
                         <button v-if="order.status === 'pending'" @click="updateOrderStatus(order.id, 'rejected')" class="px-6 py-2 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50">Reject</button>
                    </div>
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
            <h2 class="font-black text-xl mb-4 text-gray-800">Upload Banner</h2>
            <div class="flex flex-col md:flex-row gap-4 items-end">
                <div class="flex-1 w-full space-y-3">
                     <div class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative h-32 flex items-center justify-center">
                        <input ref="bannerFileInput" type="file" @change="handleBannerUpload" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" />
                        <div v-if="!newBanner.image" class="text-gray-400">📷 Add Banner Image</div>
                        <img v-else :src="newBanner.image" class="h-full object-contain rounded-lg" />
                     </div>
                     <input v-model="newBanner.title" placeholder="Title" class="w-full p-3 bg-slate-50 rounded-xl border" />
                     <input v-model="newBanner.subtitle" placeholder="Subtitle" class="w-full p-3 bg-slate-50 rounded-xl border" />
                </div>
                <button @click="handleBannerSubmit" :disabled="isSubmitting" class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl w-full md:w-auto">Upload</button>
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
            <h2 class="font-black text-xl mb-4 text-gray-800">Add Chef</h2>
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
                 <button @click="handleChefSubmit" :disabled="isSubmitting" class="px-8 py-3 bg-green-600 text-white font-bold rounded-xl h-fit self-end w-full md:w-auto">Add Chef</button>
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