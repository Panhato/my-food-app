<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router'; 
import { supabase } from '../supabase'; 

// 🔥🔥🔥 REPLACE THESE WITH YOUR TELEGRAM KEYS 🔥🔥🔥
const TELEGRAM_BOT_TOKEN = '8253458210:AAG2bggWcLeBEuhwyW0pTMJf0q_dLic6124'; 
const TELEGRAM_CHAT_ID = '7309869072';

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToastStore();
const router = useRouter();

// State for Modals
const showInfoModal = ref(false);    
const showPaymentModal = ref(false); 
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const itemToDelete = ref(null);
const isLoadingLocation = ref(false);

const receiptFile = ref(null);
const receiptPreview = ref(null);

const customer = ref({
  name: '',
  phone: '',
  address: ''
});

onMounted(() => {
  if (authStore.user) {
    customer.value.name = authStore.user.username || '';
    customer.value.phone = authStore.user.phone || '';
    customer.value.address = authStore.user.address || '';
  }
  const savedLocation = localStorage.getItem('customer_location');
  if(savedLocation) customer.value.address = savedLocation;
});

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

// 🔥 Function: Send Notification to Telegram
const sendTelegramNotification = async (orderData, receiptUrl) => {
    // 1. Format the message
    const itemsList = orderData.items.map(i => `- ${i.title} (x${i.quantity})`).join('\n');
    const total = formatPrice(orderData.total_price);
    const slipStatus = receiptUrl ? "✅ បានភ្ជាប់វិក្កយបត្រ" : "💵 បង់លុយផ្ទាល់";
    
    const message = `
📣 <b>ការកុម្ម៉ង់ថ្មី! (New Order)</b>
--------------------------------
👤 <b>អតិថិជន:</b> ${orderData.customer_name}
📞 <b>ទូរស័ព្ទ:</b> ${orderData.phone}
📍 <b>ទីតាំង:</b> ${orderData.address}

🛒 <b>មុខម្ហូប:</b>
${itemsList}

💰 <b>សរុប: ${total}</b>
💳 <b>ការបង់ប្រាក់:</b> ${slipStatus}
--------------------------------
🔗 <a href="${receiptUrl || '#'}">មើលរូបវិក្កយបត្រ</a>
    `;

    try {
        // 2. Send Text Message
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        // 3. Send Photo (if receipt exists)
        if (receiptUrl) {
             await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    photo: receiptUrl,
                    caption: `វិក្កយបត្រពី ${orderData.customer_name}`
                })
            });
        }

    } catch (error) {
        console.error("Telegram Error:", error);
    }
};

const openCheckout = () => {
  if (cartStore.items.length === 0) { 
      toast.show('កន្ត្រករបស់អ្នកទទេ!', 'error'); 
      return; 
  }
  if (authStore.user) {
    if(!customer.value.name) customer.value.name = authStore.user.username;
    if(!customer.value.phone) customer.value.phone = authStore.user.phone;
  }
  showInfoModal.value = true;
};

const proceedToPayment = () => {
  if (!customer.value.name || !customer.value.phone || !customer.value.address) {
      toast.show("សូមបំពេញ ឈ្មោះ, លេខទូរស័ព្ទ និងទីតាំង!", "error");
      return;
  }
  showInfoModal.value = false;
  showPaymentModal.value = true; 
};

const submitOrder = async () => {
  if (!receiptFile.value) {
      if(!confirm("អ្នកមិនទាន់បានដាក់រូបវិក្កយបត្រទេ។ តើអ្នកចង់បន្តទេ?")) return;
  }

  isSubmitting.value = true;

  try {
      let receiptUrl = null;

      // 1. Upload Slip
      if (receiptFile.value) {
          const fileExt = receiptFile.value.name.split('.').pop();
          const fileName = `receipt_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
              .from('images')
              .upload(fileName, receiptFile.value);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('images').getPublicUrl(fileName);
          receiptUrl = data.publicUrl;
      }

      // 2. Prepare Data
      const orderData = {
            customer_name: customer.value.name,
            phone: customer.value.phone,
            address: customer.value.address,
            items: cartStore.items, 
            total_price: cartStore.totalAmount || cartStore.totalPrice,
            status: 'pending',
            receipt_url: receiptUrl 
      };

      // 3. Save to Supabase
      const { error } = await supabase.from('orders').insert(orderData);

      if (error) throw error; 

      // 4. 🔥 Send Notification to Telegram
      // We don't await this to fail the order, just log errors if any
      sendTelegramNotification(orderData, receiptUrl);

      // 5. Success & Cleanup
      toast.show('ការកុម្ម៉ង់បានជោគជ័យ! ✅', 'success');
      
      if (cartStore.clearCart) cartStore.clearCart(); 
      else cartStore.items = [];
      
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
          <button @click="initiateDelete(item.id)" class="text-gray-400 hover:text-red-500 p-2 transition-colors">🗑️</button>
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
                 <button @click="getLocation" class="w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 flex items-center justify-center gap-2" :disabled="isLoadingLocation">
                     <span v-if="isLoadingLocation" class="animate-spin">⏳</span>
                     <span v-else>📍 យកទីតាំងបច្ចុប្បន្ន (GPS)</span>
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
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">🗑️</div>
            <h3 class="text-xl font-black text-gray-800 mb-2">លុបមុខម្ហូប?</h3>
            <div class="flex gap-3 mt-6">
                <button @click="showDeleteModal = false" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold">រក្សាទុក</button>
                <button @click="confirmDelete" class="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg">លុបចេញ</button>
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