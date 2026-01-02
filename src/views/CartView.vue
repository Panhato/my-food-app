<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router'; 
import { supabase } from '../supabase'; // 🔥 1. Import Supabase ដែលបានបង្កើត

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToastStore();
const router = useRouter();

// State for Modals
const showCheckoutModal = ref(false);
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const itemToDelete = ref(null);

// State for Customer Info
const customer = ref({
  name: '',
  phone: '',
  address: ''
});

// 🔥 Auto-fill: ទាញទិន្នន័យពី Profile មកបំពេញឱ្យស្រាប់
onMounted(() => {
  if (authStore.user) {
    customer.value.name = authStore.user.username || '';
    customer.value.phone = authStore.user.phone || '';
    customer.value.address = authStore.user.address || '';
  }
});

const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};

// Open Checkout Modal
const checkout = () => {
  if (cartStore.items.length === 0) { 
      toast.show('កន្ត្រករបស់អ្នកទទេ!', 'error'); 
      return; 
  }
  // Update ទិន្នន័យម្តងទៀត ក្រែងលោគាត់ទើបកែ Profile
  if (authStore.user) {
    if(!customer.value.name) customer.value.name = authStore.user.username;
    if(!customer.value.phone) customer.value.phone = authStore.user.phone;
    if(!customer.value.address) customer.value.address = authStore.user.address;
  }
  showCheckoutModal.value = true;
};

// Delete Functionality
const initiateDelete = (itemId) => {
  itemToDelete.value = itemId;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (itemToDelete.value) {
    cartStore.removeFromCart(itemToDelete.value);
    showDeleteModal.value = false;
    itemToDelete.value = null;
    toast.show('បានលុបម្ហូបចេញពីកន្ត្រក', 'success');
  }
};

// 🔥 Function ផ្ញើការកម្ម៉ងទៅ Supabase
const confirmCheckout = async () => {
  // 1. Validate Form
  if (!customer.value.name || !customer.value.phone || !customer.value.address) {
      toast.show("សូមបំពេញ ឈ្មោះ, លេខទូរស័ព្ទ និងទីតាំង!", "error");
      return;
  }

  isSubmitting.value = true;

  try {
      // 2. ផ្ញើទិន្នន័យទៅ Supabase Table 'orders'
      const { error } = await supabase
        .from('orders') // ប្រាកដថាឈ្មោះ Table ត្រូវគ្នា
        .insert({
            customer_name: customer.value.name,
            phone: customer.value.phone,
            address: customer.value.address,
            items: cartStore.items, // Supabase នឹងបម្លែងជា JSON ស្វ័យប្រវត្តិ
            total_price: cartStore.totalAmount || cartStore.totalPrice
        });

      if (error) throw error; // បើមានបញ្ហា រុញទៅ Catch

      // 3. ជោគជ័យ
      toast.show('ការកុម្ម៉ង់បានជោគជ័យ! ✅', 'success');
      
      // សម្អាតកន្ត្រក
      if (cartStore.clearCart) {
          cartStore.clearCart(); 
      } else {
          cartStore.items = [];
      }
      
      // Reset Form & Modal
      customer.value = { name: '', phone: '', address: '' };
      showCheckoutModal.value = false;
      
      // ទៅកាន់ទំព័រវិក្កយបត្រ
      router.push('/receipt');

  } catch (err) {
      console.error('Supabase Error:', err);
      toast.show('មានបញ្ហាពេលកុម្ម៉ង់: ' + err.message, 'error');
  } finally {
      isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 font-sans min-h-[60vh]">
    <h1 class="text-2xl font-header font-bold mb-6 text-gray-800 flex items-center gap-2">កន្ត្រករបស់អ្នក 🛒</h1>
    
    <div v-if="cartStore.items.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="text-6xl mb-4">🍽️</div>
      <p class="text-gray-500 text-lg mb-6">មិនទាន់មានម្ហូបក្នុងកន្ត្រកទេ</p>
      <router-link to="/menu" class="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition-colors">ទៅមើលម៉ឺនុយ</router-link>
    </div>

    <div v-else class="space-y-4 pb-10">
      <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
            <img :src="item.image" class="w-16 h-16 object-cover rounded-lg border bg-gray-50" />
            <div>
                <h3 class="font-bold text-lg text-gray-800">{{ item.title }}</h3>
                <p class="text-sm text-gray-550">ចំនួន: {{ item.quantity }} x {{ formatPrice(item.price) }}</p>
            </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-bold text-orange-600 text-lg">{{ formatPrice(item.price * item.quantity) }}</span>
          
          <button @click="initiateDelete(item.id)" class="text-gray-400 hover:text-red-500 p-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </div>

      <div class="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div class="text-center sm:text-left">
            <p class="text-gray-550 text-sm">សរុបទឹកប្រាក់ (Total)</p>
            <p class="text-4xl font-bold text-orange-600 font-header">{{ formatPrice(cartStore.totalAmount || cartStore.totalPrice) }}</p>
          </div>
          <button @click="checkout" class="w-full sm:w-auto bg-orange-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-orange-700 hover:scale-105 transition-all flex justify-center items-center gap-3 text-lg">
            <span>កម្ម៉ង់ឥឡូវ</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center">
            
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </div>

            <h3 class="text-xl font-black text-gray-800 mb-2">លុបមុខម្ហូប?</h3>
            <p class="text-gray-500 text-sm mb-6">តើអ្នកពិតជាចង់លុបមុខម្ហូបនេះចេញពីកន្ត្រកមែនទេ?</p>

            <div class="flex gap-3">
                <button @click="showDeleteModal = false" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors">
                    រក្សាទុក
                </button>
                <button @click="confirmDelete" class="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
                    លុបចេញ
                </button>
            </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showCheckoutModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl transform transition-all scale-100 relative">
          
          <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <div class="text-center mb-6">
            <h3 class="text-xl font-black text-slate-800 mb-2">បញ្ជាក់ការកុម្ម៉ង់</h3>
            <p class="text-slate-500 text-sm mb-4">សូមពិនិត្យព័ត៌មានខាងក្រោមមុននឹងបញ្ជាក់។</p>
            
            <div class="space-y-3 text-left">
                <div>
                    <label class="text-xs font-bold text-gray-500 ml-2">ឈ្មោះរបស់អ្នក</label>
                    <input v-model="customer.name" placeholder="ឈ្មោះ" class="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 font-bold" />
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 ml-2">លេខទូរស័ព្ទ</label>
                    <input v-model="customer.phone" type="tel" placeholder="012 345 678" class="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 font-bold" />
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 ml-2">ទីតាំងដឹកជញ្ជូន</label>
                    <textarea v-model="customer.address" rows="2" placeholder="ផ្ទះលេខ, ផ្លូវ, ភូមិ..." class="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 font-medium"></textarea>
                </div>
            </div>

            <div class="bg-orange-50 rounded-xl p-3 mt-4 border border-orange-100 flex justify-between items-center px-6">
               <span class="text-xs font-bold text-orange-400 uppercase tracking-widest">តម្លៃសរុប</span>
               <span class="text-xl font-black text-orange-700">{{ formatPrice(cartStore.totalAmount || cartStore.totalPrice) }}</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="showCheckoutModal = false" class="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
              បោះបង់
            </button>
            <button @click="confirmCheckout" :disabled="isSubmitting" class="flex-1 py-3.5 rounded-2xl font-bold text-white bg-orange-600 shadow-lg shadow-orange-200 hover:bg-orange-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center gap-2">
              <span v-if="isSubmitting" class="animate-spin">⏳</span>
              {{ isSubmitting ? 'កំពុងផ្ញើ...' : 'យល់ព្រម' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>