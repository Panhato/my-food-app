<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router'; 
import { supabase } from '../supabase'; 

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToastStore();
const router = useRouter();

// State for Modals
const showInfoModal = ref(false);    // Modal 1: Customer Info
const showPaymentModal = ref(false); // Modal 2: QR & Upload
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const itemToDelete = ref(null);
const isLoadingLocation = ref(false);

// State for Receipt Upload
const receiptFile = ref(null);
const receiptPreview = ref(null);

// State for Customer Info
const customer = ref({
  name: '',
  phone: '',
  address: ''
});

// Auto-fill Data
onMounted(() => {
  if (authStore.user) {
    customer.value.name = authStore.user.username || '';
    customer.value.phone = authStore.user.phone || '';
    customer.value.address = authStore.user.address || '';
  }
  
  // Try to get saved location
  const savedLocation = localStorage.getItem('customer_location');
  if(savedLocation) {
      customer.value.address = savedLocation;
  }
});

// Get GPS Location
const getLocation = () => {
  if (!navigator.geolocation) {
    alert("Browser របស់អ្នកមិនស្គាល់មុខងារនេះទេ");
    return;
  }
  
  isLoadingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
      
      customer.value.address = mapLink;
      isLoadingLocation.value = false;
    },
    (error) => {
      alert("មិនអាចចាប់ទីតាំងបានទេ។ សូមវាយបញ្ចូលដោយដៃ។");
      isLoadingLocation.value = false;
    }
  );
};

// Handle File Upload
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        receiptFile.value = file;
        receiptPreview.value = URL.createObjectURL(file);
    }
};

const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};

// Step 1: Open Info Modal
const openCheckout = () => {
  if (cartStore.items.length === 0) { 
      toast.show('កន្ត្រករបស់អ្នកទទេ!', 'error'); 
      return; 
  }
  // Update data again
  if (authStore.user) {
    if(!customer.value.name) customer.value.name = authStore.user.username;
    if(!customer.value.phone) customer.value.phone = authStore.user.phone;
  }
  showInfoModal.value = true;
};

// Step 2: Validate & Show Payment Modal
const proceedToPayment = () => {
  if (!customer.value.name || !customer.value.phone || !customer.value.address) {
      toast.show("សូមបំពេញ ឈ្មោះ, លេខទូរស័ព្ទ និងទីតាំង!", "error");
      return;
  }
  showInfoModal.value = false;
  showPaymentModal.value = true; 
};

// Step 3: Submit Order with Receipt
const submitOrder = async () => {
  // Check if receipt is uploaded (Optional check)
  if (!receiptFile.value) {
      if(!confirm("អ្នកមិនទាន់បានដាក់រូបវិក្កយបត្រទេ។ តើអ្នកចង់បន្តទេ?")) return;
  }

  isSubmitting.value = true;

  try {
      let receiptUrl = null;

      // 1. Upload Receipt Image if exists
      if (receiptFile.value) {
          const fileExt = receiptFile.value.name.split('.').pop();
          const fileName = `receipt_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
              .from('images')
              .upload(fileName, receiptFile.value);

          if (uploadError) throw uploadError;

          // Get Public URL
          const { data } = supabase.storage.from('images').getPublicUrl(fileName);
          receiptUrl = data.publicUrl;
      }

      // 2. Insert Order to Database
      const { error } = await supabase
        .from('orders') 
        .insert({
            customer_name: customer.value.name,
            phone: customer.value.phone,
            address: customer.value.address,
            items: cartStore.items, 
            total_price: cartStore.totalAmount || cartStore.totalPrice,
            status: 'pending',
            receipt_url: receiptUrl // 🔥 Save URL here
        });

      if (error) throw error; 

      toast.show('ការកុម្ម៉ង់បានជោគជ័យ! ✅', 'success');
      
      // Clear Cart
      if (cartStore.clearCart) {
          cartStore.clearCart(); 
      } else {
          cartStore.items = [];
      }
      
      localStorage.removeItem('customer_location');
      customer.value = { name: '', phone: '', address: '' };
      receiptFile.value = null;
      receiptPreview.value = null;
      showPaymentModal.value = false;
      
      router.push('/receipt');

  } catch (err) {
      console.error('Supabase Error:', err);
      toast.show('មានបញ្ហា: ' + err.message, 'error');
  } finally {
      isSubmitting.value = false;
  }
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
          <button @click="openCheckout" class="w-full sm:w-auto bg-orange-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-orange-700 hover:scale-105 transition-all flex justify-center items-center gap-3 text-lg">
            <span>កម្ម៉ង់ឥឡូវ</span>
            <span>➡️</span>
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showInfoModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
          
          <h3 class="text-xl font-black text-slate-800 mb-2 text-center">ព័ត៌មានដឹកជញ្ជូន 🛵</h3>
          
          <div class="space-y-3 mt-4">
             <input v-model="customer.name" placeholder="ឈ្មោះរបស់អ្នក" class="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold outline-none focus:border-orange-500" />
             <input v-model="customer.phone" type="tel" placeholder="លេខទូរស័ព្ទ (012...)" class="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold outline-none focus:border-orange-500" />
             
             <div class="space-y-2">
                 <textarea v-model="customer.address" rows="2" placeholder="ទីតាំងដឹកជញ្ជូន..." class="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium outline-none focus:border-orange-500"></textarea>
                 
                 <button 
                    @click="getLocation" 
                    class="w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2" 
                    :disabled="isLoadingLocation"
                 >
                     <span v-if="isLoadingLocation" class="animate-spin">⏳</span>
                     <span v-else>🎯 យកទីតាំងបច្ចុប្បន្ន (GPS)</span>
                 </button>
             </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="showInfoModal = false" class="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">បោះបង់</button>
            <button @click="proceedToPayment" class="flex-1 py-3 rounded-xl font-bold text-white bg-orange-600 shadow-lg hover:bg-orange-700">បន្តទៅបង់ប្រាក់</button>
          </div>

        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showPaymentModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center relative overflow-y-auto max-h-[90vh]">
          
          <h3 class="text-xl font-black text-slate-800 mb-2">ស្កេនដើម្បីបង់ប្រាក់ 💸</h3>
          <p class="text-gray-500 text-sm mb-4">សរុប: <span class="text-orange-600 font-bold text-lg">{{ formatPrice(cartStore.totalAmount || cartStore.totalPrice) }}</span></p>
          
          <div class="bg-white p-2 rounded-2xl border-2 border-dashed border-gray-300 mb-4 inline-block">
             <img src="/qr.jpg" class="w-40 h-40 object-contain rounded-lg" alt="QR Payment" />
          </div>

          <div class="mb-6 text-left">
              <label class="text-xs font-bold text-gray-500 ml-2 mb-1 block">បញ្ជាក់ការបង់ប្រាក់ (Upload Slip)</label>
              <div class="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:bg-gray-50 relative bg-slate-50">
                  <input type="file" accept="image/*" @change="handleFileUpload" class="absolute inset-0 opacity-0 cursor-pointer" />
                  <div v-if="!receiptPreview" class="text-gray-400 text-sm flex flex-col items-center gap-1">
                      <span>📸</span>
                      <span>ចុចទីនេះដើម្បីដាក់រូប</span>
                  </div>
                  <img v-else :src="receiptPreview" class="h-24 mx-auto object-contain rounded-lg shadow-sm" />
              </div>
          </div>

          <div class="flex gap-3">
            <button @click="showPaymentModal = false" class="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">ថយក្រោយ</button>
            <button @click="submitOrder" :disabled="isSubmitting" class="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 shadow-lg hover:bg-green-700 flex justify-center gap-2">
               <span v-if="isSubmitting" class="animate-spin">⏳</span>
               {{ isSubmitting ? 'កំពុងផ្ញើ...' : 'បង់រួចរាល់ ✅' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

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