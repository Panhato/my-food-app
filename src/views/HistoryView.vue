<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth'; // ហៅ Auth Store
import { useOrderStore } from '../stores/order'; // ហៅ Order Store
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const router = useRouter();

// ពេលបើកទំព័រភ្លាម ឱ្យទាញយក Order របស់ User ហ្នឹងមក
onMounted(() => {
  if (authStore.user) {
    orderStore.fetchMyOrders();
  }
});

// Helper Function: សម្រាប់ប្តូរពាក្យ និងពណ៌
const getStatusInfo = (status) => {
    switch(status) {
        case 'pending': return { text: 'រង់ចាំ', color: 'text-yellow-600 bg-yellow-100', icon: '⏳', percent: '25%' };
        case 'accepted': return { text: 'បានទទួល', color: 'text-blue-600 bg-blue-100', icon: '✅', percent: '40%' };
        case 'cooking': return { text: 'កំពុងធ្វើ', color: 'text-orange-600 bg-orange-100', icon: '👨‍🍳', percent: '60%' };
        case 'delivering': return { text: 'កំពុងដឹក', color: 'text-purple-600 bg-purple-100', icon: '🛵', percent: '85%' };
        case 'completed': return { text: 'បានទទួលហើយ', color: 'text-green-600 bg-green-100', icon: '🎉', percent: '100%' };
        case 'rejected': return { text: 'បដិសេធ', color: 'text-red-600 bg-red-100', icon: '❌', percent: '0%' };
        default: return { text: 'រង់ចាំ', color: 'text-gray-600 bg-gray-100', icon: '...', percent: '10%' };
    }
};

const formatPrice = (val) => '$' + parseFloat(val).toFixed(2);
const formatDate = (date) => new Date(date).toLocaleString('km-KH');

// Function សម្រាប់បង្ហាញឈ្មោះម្ហូប
const formatItems = (items) => {
    try {
        // ពិនិត្យមើលថា items ជា string ឬ array ព្រោះ Supabase ពេលខ្លះបោះមកខុសគ្នា
        const parsed = typeof items === 'string' ? JSON.parse(items) : items;
        if (!Array.isArray(parsed)) return '...';
        return parsed.map(i => `${i.name} (x${i.qty})`).join(', ');
    } catch(e) { return '...'; }
};

const handleLoginRedirect = () => {
    router.push('/login');
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 md:p-8 font-sans min-h-screen bg-gray-50/50 pt-24">
    
    <div v-if="!authStore.user" class="flex flex-col items-center justify-center pt-10">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
            <span class="text-5xl mb-4 block">🔒</span>
            <h2 class="text-xl font-black text-slate-800 mb-2">សូមចូលគណនី</h2>
            <p class="text-gray-400 text-sm mb-6">អ្នកត្រូវចូលគណនីជាមុនសិន ដើម្បីមើលប្រវត្តិការកុម្ម៉ង់របស់អ្នក។</p>
            
            <button @click="handleLoginRedirect" class="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 active:scale-95">
                ចូលគណនី (Login)
            </button>
        </div>
    </div>

    <div v-else>
        <div class="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div>
                <h1 class="text-xl font-black text-slate-800">ប្រវត្តិការកុម្ម៉ង់ 📦</h1>
                <p class="text-xs text-gray-500 mt-1">គណនី: <span class="font-bold text-orange-600">{{ authStore.user.email }}</span></p>
            </div>
            <div class="flex gap-2">
                <button @click="orderStore.fetchMyOrders()" class="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 border">
                    🔄 Reload
                </button>
            </div>
        </div>

        <div v-if="orderStore.isLoading" class="text-center py-20">
            <p class="animate-pulse text-gray-400 font-bold">កំពុងទាញទិន្នន័យ...</p>
        </div>

        <div v-else-if="orderStore.orders.length === 0" class="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
           <span class="text-5xl mb-4 block opacity-50">🍽️</span>
           <p class="text-gray-400 font-bold">អ្នកមិនទាន់បានកុម្ម៉ង់អ្វីទេ</p>
           <router-link to="/menu" class="inline-block mt-4 text-orange-600 font-bold hover:underline">ទៅកុម្ម៉ង់ម្ហូប →</router-link>
        </div>

        <div v-else class="space-y-6">
          <div v-for="order in orderStore.orders" :key="order.id" class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-sm font-bold">#{{ order.id }}</span>
                    <span class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</span>
                </div>
                
                <div class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                     :class="getStatusInfo(order.status).color">
                    <span>{{ getStatusInfo(order.status).icon }}</span>
                    <span>{{ getStatusInfo(order.status).text }}</span>
                </div>
            </div>

            <div class="mb-6" v-if="order.status !== 'rejected'">
                <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div class="h-full bg-orange-500 transition-all duration-1000 ease-out relative" 
                         :style="{ width: getStatusInfo(order.status).percent }">
                         <div class="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                </div>
                <div class="flex justify-between text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
                    <span>បញ្ជាទិញ</span>
                    <span>កំពុងធ្វើ</span>
                    <span>កំពុងដឹក</span>
                    <span>បានទទួល</span>
                </div>
            </div>

            <div class="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-50">
                <p class="text-sm font-medium text-gray-600 leading-relaxed">
                    {{ formatItems(order.items) }}
                </p>
            </div>

            <div class="flex justify-between items-center">
                 <span class="text-xs font-bold text-gray-400">សរុបទឹកប្រាក់</span>
                 <span class="text-2xl font-black text-slate-800">{{ formatPrice(order.total_price) }}</span>
            </div>
          </div>
        </div>
    </div>

  </div>
</template>