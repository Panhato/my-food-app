<script setup>
import { ref } from 'vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

// State សម្រាប់ Modal លុប
const showDeleteModal = ref(false);
const orderIdToDelete = ref(null);

// 1. មុខងារបើក Modal (ពេលចុចធុងសម្រាម)
const initiateDelete = (orderId) => {
  orderIdToDelete.value = orderId;
  showDeleteModal.value = true;
};

// 2. មុខងារលុបពិតប្រាកដ (ពេលចុច Yes ក្នុង Modal)
const confirmDelete = () => {
  if (orderIdToDelete.value) {
    cartStore.deleteFromHistory(orderIdToDelete.value);
    showDeleteModal.value = false;
    orderIdToDelete.value = null;
  }
};

const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 font-sans min-h-[60vh]">
    
    <div class="mb-8 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-slate-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h1 class="text-2xl font-header font-bold text-gray-800">ប្រវត្តិការកុម្ម៉ង់របស់អ្នក</h1>
    </div>

    <div v-if="cartStore.orderHistory.length === 0" class="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
       <span class="text-6xl opacity-30 block mb-4">📜</span>
       <p class="text-slate-400 font-bold text-lg">មិនទាន់មានប្រវត្តិការកុម្ម៉ង់ទេ</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in cartStore.orderHistory" :key="order.orderId" class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        
        <div class="flex justify-between items-start mb-4 border-b border-dashed border-slate-100 pb-4">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <span class="font-black text-slate-800 text-lg">{{ order.orderId }}</span>
                    <span class="bg-green-100 text-green-600 text-[15px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {{ order.status || 'Success' }}
                    </span>
                </div>
                <div class="flex items-center gap-2 text-slate-400 text-lg font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    {{ order.date }}
                </div>
            </div>
            
            <div class="text-right">
                <span class="block text-[19px] text-slate-600 font-bold uppercase tracking-wider mb-1">សរុបទឹកប្រាក់</span>
                <span class="text-xl font-black text-orange-600">{{ formatPrice(order.total) }}</span>
            </div>
        </div>

        <div class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
                <img :src="item.image" class="w-20 h-30 rounded-lg object-cover bg-slate-50" />
                <div class="flex-grow">
                    <h4 class="font-bold text-slate-700 text-lg ">{{ item.title }}</h4>
                    <p class="text-lg text-slate-500">ចំនួន: {{ item.quantity }}</p>
                </div>
                <div class="text-sm font-bold text-slate-600">
                    {{ formatPrice(item.price * item.quantity) }}
                </div>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-50 flex justify-end">
            <button 
                @click="initiateDelete(order.orderId)" 
                class="w-15 h-15 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                title="លុបប្រវត្តិ"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
        </div>

      </div>
    </div>

    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        
        <div class="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center transform transition-all scale-100">
            
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
            </div>

            <h3 class="text-xl font-black text-gray-800 mb-2">លុបប្រវត្តិមួយនេះ?</h3>
            <p class="text-gray-500 text-sm mb-6 px-4">
              ទិន្នន័យដែលលុបហើយមិនអាចយកមកវិញបានទេ។ តើអ្នកច្បាស់ទេ?
            </p>

            <div class="flex gap-3">
                <button 
                  @click="showDeleteModal = false" 
                  class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors"
                >
                    រក្សាទុក
                </button>
                <button 
                  @click="confirmDelete" 
                  class="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                >
                    លុបចេញ
                </button>
            </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Animation ដូចនៅ CartView ដែរ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active .transform,
.fade-leave-active .transform {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-enter-from .transform,
.fade-leave-to .transform {
  transform: scale(0.95) translateY(10px);
}
</style>