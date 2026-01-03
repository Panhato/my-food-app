<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useOrderStore } from '../stores/order';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const router = useRouter();

onMounted(() => {
  if (authStore.user) {
    orderStore.fetchMyOrders();
  }
});

const getStatusInfo = (status) => {
    switch(status) {
        case 'pending': return { text: 'រង់ចាំ', color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: '⏳', percent: '25%' };
        case 'accepted': return { text: 'បានទទួល', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: '👨‍🍳', percent: '50%' };
        case 'cooking': return { text: 'កំពុងចម្អិន', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: '🔥', percent: '75%' };
        case 'delivering': return { text: 'កំពុងដឹក', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: '🛵', percent: '90%' };
        case 'completed': return { text: 'បានទទួល', color: 'text-green-600 bg-green-50 border-green-100', icon: '🎉', percent: '100%' };
        case 'rejected': return { text: 'បដិសេធ', color: 'text-red-600 bg-red-50 border-red-100', icon: '❌', percent: '0%' };
        default: return { text: 'រង់ចាំ', color: 'text-gray-600 bg-gray-50 border-gray-100', icon: '...', percent: '10%' };
    }
};

const formatPrice = (val) => {
    let num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    if (num > 100) return new Intl.NumberFormat('km-KH').format(num) + ' ៛';
    return '$' + num.toFixed(2);
};

const formatDate = (date) => new Date(date).toLocaleString('km-KH', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
});

// 🔥 Function ថ្មី៖ សម្រាប់បំបែក Items ជា Array ដើម្បីងាយស្រួលបង្ហាញ
const parseItems = (items) => {
    try {
        const parsed = typeof items === 'string' ? JSON.parse(items) : items;
        return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
};

const handleLoginRedirect = () => {
    router.push('/login');
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 md:p-6 font-sans min-h-screen bg-gray-50 pt-24 pb-24">
    
    <div v-if="authStore.user" class="flex justify-between items-end mb-8 px-2">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">ប្រវត្តិការកុម្ម៉ង់ 📜</h1>
            <p class="text-sm text-gray-500 mt-1 font-medium">សួស្តី, <span class="text-orange-600">{{ authStore.user.user_metadata?.username || 'អតិថិជន' }}</span></p>
        </div>
        <button @click="orderStore.fetchMyOrders()" class="bg-white p-3 rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-orange-600 hover:shadow-md transition-all active:scale-95">
            🔄
        </button>
    </div>

    <div v-if="orderStore.isLoading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white h-40 rounded-3xl animate-pulse"></div>
    </div>

    <div v-else-if="!authStore.user" class="flex flex-col items-center justify-center pt-20 text-center">
        <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-100/50 border border-orange-50 w-full max-w-sm">
            <span class="text-6xl mb-4 block">🔐</span>
            <h2 class="text-xl font-black text-slate-800 mb-2">សូមចូលគណនី</h2>
            <p class="text-gray-400 text-sm mb-6 px-4">ដើម្បីមើលប្រវត្តិការកុម្ម៉ង់ និងតាមដានម្ហូបរបស់អ្នក។</p>
            <button @click="handleLoginRedirect" class="w-full py-3.5 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                ចូលគណនី (Login)
            </button>
        </div>
    </div>

    <div v-else-if="orderStore.orders.length === 0" class="flex flex-col items-center justify-center pt-20 text-center">
         <div class="text-6xl mb-4 opacity-80 grayscale-[30%]">🍔</div>
         <h3 class="text-xl font-black text-slate-700">មិនទាន់មានការកុម្ម៉ង់ទេ</h3>
         <p class="text-gray-400 text-sm mb-6">ឃ្លានហើយមែនទេ? កុម្ម៉ង់ឥឡូវនេះ!</p>
         <router-link to="/menu" class="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors shadow-lg">
            ទៅម៉ឺនុយម្ហូប 🍔
         </router-link>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in orderStore.orders" :key="order.id" 
           class="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative group hover:border-orange-200 transition-all duration-300">
        
        <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
                <div class="bg-slate-100 w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold text-slate-600">
                    📦
                </div>
                <div>
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Order #{{ order.id }}</p>
                    <p class="text-xs text-slate-500 font-bold">{{ formatDate(order.created_at) }}</p>
                </div>
            </div>
            
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wide shadow-sm"
                 :class="getStatusInfo(order.status).color">
                <span class="text-sm">{{ getStatusInfo(order.status).icon }}</span>
                <span>{{ getStatusInfo(order.status).text }}</span>
            </div>
        </div>

        <div class="mb-5 px-1" v-if="order.status !== 'rejected'">
            <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 relative" 
                     :style="{ width: getStatusInfo(order.status).percent }">
                </div>
            </div>
        </div>

        <div class="space-y-3 mb-5">
            <div v-for="(item, index) in parseItems(order.items)" :key="index" 
                 class="flex justify-between items-center py-2 border-b border-dashed border-gray-50 last:border-0">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                        <span v-else class="w-full h-full flex items-center justify-center text-xl">🍲</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-700 line-clamp-1">{{ item.title }}</p>
                        <p class="text-xs text-gray-400 font-bold">ចំនួន: x{{ item.quantity }}</p>
                    </div>
                </div>
                <p class="text-sm font-bold text-slate-600">{{ formatPrice(item.price) }}</p>
            </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
             <div>
                <p class="text-xs font-bold text-gray-400 uppercase">សរុបទឹកប្រាក់</p>
                <p class="text-2xl font-black text-slate-800 tracking-tight">{{ formatPrice(order.total_price) }}</p>
             </div>
             
             <button v-if="order.status === 'completed'" class="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors">
                កម្ម៉ង់ម្តងទៀត
             </button>
        </div>

      </div>
    </div>
    
  </div>
</template>