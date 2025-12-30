<script setup>
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const cartStore = useCartStore();
const router = useRouter();

// បើអត់មាន Order ទេ ឱ្យត្រឡប់ទៅ Home វិញ (ការពារគេចូលលេង)
onMounted(() => {
  if (!cartStore.lastOrder) {
    router.push('/');
  }
});

// មុខងារ Print
const printReceipt = () => {
  window.print();
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10 px-4 font-sans">
    
    <div v-if="cartStore.lastOrder" class="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg relative print:shadow-none print:w-full print:max-w-none">
      
      <div class="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
        <h1 class="text-3xl font-header font-bold text-orange-600 mb-2">MyFoodShop</h1>
        <p class="text-gray-550 text-sm">ផ្ទះលេខ ១២៣, ផ្លូវកម្ពុជាក្រោម, ភ្នំពេញ</p>
        <p class="text-gray-550 text-sm">ទូរស័ព្ទ: 012 345 678</p>
      </div>

      <div class="flex justify-between text-sm mb-6 text-gray-650">
        <div>
          <p>លេខប័ណ្ណ:</p>
          <p class="font-bold text-gray-800">{{ cartStore.lastOrder.orderId }}</p>
        </div>
        <div class="text-right">
          <p>កាលបរិច្ឆេទ:</p>
          <p class="font-bold text-gray-800">{{ cartStore.lastOrder.date }}</p>
        </div>
      </div>

      <div class="mb-6">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-550">
              <th class="py-2">មុខម្ហូប</th>
              <th class="py-2 text-center">ចំនួន</th>
              <th class="py-2 text-right">តម្លៃ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dashed divide-gray-200">
            <tr v-for="item in cartStore.lastOrder.items" :key="item.id">
              <td class="py-3 font-medium">{{ item.title }}</td>
              <td class="py-3 text-center">x{{ item.quantity }}</td>
              <td class="py-3 text-right">${{ (item.price * item.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t-2 border-dashed border-gray-300 pt-4 mb-8">
        <div class="flex justify-between items-center text-xl font-bold text-gray-800">
          <span>សរុបលុយ (Total):</span>
          <span class="text-orange-600">៛{{ cartStore.lastOrder.total.toFixed(2) }}</span>
        </div>
      </div>

      <div class="text-center space-y-2">
        <p class="font-header text-lg text-gray-800">សូមអរគុណ!</p>
        <p class="text-xs text-gray-450">សូមពិនិត្យវិក្កយបត្រឱ្យបានត្រឹមត្រូវ</p>
        
        <!-- <div class="mt-4 bg-gray-100 h-12 flex items-center justify-center tracking-[0.5em] text-gray-400 text-xs font-mono">
          ||||||| |||| ||||||
        </div> -->
      </div>

      <div class="mt-8 flex gap-3 print:hidden">
        <button @click="printReceipt" class="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors flex justify-center gap-2">
          <span></span> បោះពុម្ព
        </button>
        <button @click="router.push('/')" class="flex-1 bg-orange-100 text-orange-600 py-3 rounded-lg font-bold hover:bg-orange-200 transition-colors">
          ត្រឡប់ទៅដើម
        </button>
      </div>

    </div>
  </div>
</template>

<style>
/* កូដនេះសម្រាប់លាក់អ្វីៗផ្សេងពេល Print */
@media print {
  body * {
    visibility: hidden;
  }
  .max-w-md, .max-w-md * {
    visibility: visible;
  }
  .max-w-md {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
  }
}
</style>