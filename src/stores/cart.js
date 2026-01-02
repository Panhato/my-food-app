import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { supabase } from '../supabase'; 

export const useCartStore = defineStore('cart', () => {
  
  // =========================================
  // ផ្នែកទី ១: កន្ត្រកទំនិញ (Shopping Cart)
  // =========================================
  const items = ref([]);

  // 1. ទាញទិន្នន័យកន្ត្រកពី LocalStorage
  try {
      const savedCart = localStorage.getItem('my-cart-items');
      if (savedCart) items.value = JSON.parse(savedCart);
  } catch (e) { items.value = []; }

  // 2. Action: បន្ថែមទំនិញ
  const addToCart = (product) => {
      const existingItem = items.value.find(item => item.id === product.id);
      if (existingItem) {
          existingItem.quantity++;
      } else {
          items.value.push({ ...product, quantity: 1 });
      }
  };

  // 3. Action: លុបទំនិញ
  const removeFromCart = (productId) => {
      items.value = items.value.filter(item => item.id !== productId);
  };

  // 4. Action: កែប្រែចំនួន
  const updateQuantity = (productId, amount) => {
      const item = items.value.find(i => i.id === productId);
      if (item) {
          item.quantity += amount;
          if (item.quantity <= 0) removeFromCart(productId);
      }
  };

  // 5. Computed: តម្លៃសរុប
  const totalPrice = computed(() => {
      return items.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  // 6. Watcher: Save Cart ស្វ័យប្រវត្តិ
  watch(items, (val) => {
      localStorage.setItem('my-cart-items', JSON.stringify(val));
  }, { deep: true });


  // =========================================
  // ផ្នែកទី ២: ប្រវត្តិ & ការកុម្ម៉ង់ (Order Logic)
  // =========================================
  const orderHistory = ref([]); 

  try {
      const savedHistory = localStorage.getItem('my-order-history');
      if (savedHistory) orderHistory.value = JSON.parse(savedHistory);
  } catch (e) { orderHistory.value = []; }

  // 🔥 Function ផ្ញើចូល Telegram
  const sendToTelegram = async (orderData) => {
    const BOT_TOKEN = '8023985088:AAG5XP2zrhtL_Kup7vu2v7slOx8HLWBg8EM'; 
    const CHAT_ID = '-4676998115';

    // រៀបចំបញ្ជីទំនិញ
    const itemList = orderData.items.map(i => `- ${i.title} (x${i.quantity})`).join('\n');
    
    const message = `
📦 មានការកុម្ម៉ង់ថ្មី!
--------------------------------
👤 ឈ្មោះ: ${orderData.customer.name}
📞 លេខទូរស័ព្ទ: ${orderData.customer.phone}
📍 ទីតាំង: ${orderData.customer.address}
💰 តម្លៃសរុប: $${orderData.total}
--------------------------------
🛒 ទំនិញ:
${itemList}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      });

      const result = await response.json(); 
      if (!result.ok) {
         console.error("Telegram Failed:", result);
      } else {
         console.log("Telegram Sent!");
      }

    } catch (err) {
      console.error("Network Error:", err);
    }
  };

  // 🔥 Action: Checkout (Supabase + Telegram + Local History)
  const processCheckout = async (customerInfo) => {
      if (items.value.length === 0) return false;

      const currentTotal = totalPrice.value;
      const currentItems = [...items.value];

      // 1. Save ចូល Supabase (Database)
      const { error } = await supabase.from('orders').insert({
          customer_name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          total_price: currentTotal,
          items: JSON.stringify(currentItems)
      });

      if (error) {
        throw error; 
      }

      // 2. ផ្ញើចូល Telegram
      await sendToTelegram({
        customer: customerInfo,
        total: currentTotal,
        items: currentItems
      });

      // 3. Save ចូល Local History (ទុកគ្រាន់មើលលេង)
      const newOrderLocal = {
          id: Date.now(),
          date: new Date().toLocaleString('en-GB'),
          items: currentItems,
          total: currentTotal,
          customer: customerInfo
      };
      orderHistory.value.unshift(newOrderLocal);
      localStorage.setItem('my-order-history', JSON.stringify(orderHistory.value));

      // 🔥 4. Save លេខទូរស័ព្ទ (សំខាន់បំផុតសម្រាប់តាមដានម្ហូប!)
      localStorage.setItem('user_phone', customerInfo.phone);

      // 5. លុបកន្ត្រកចោល
      items.value = [];
      localStorage.removeItem('my-cart-items');
      
      return true; 
  };

  const clearHistory = () => {
      orderHistory.value = [];
      localStorage.removeItem('my-order-history');
      // កុំលុប user_phone ចោលនៅទីនេះ ដើម្បីឱ្យគេនៅតែអាចតាមដានបាន
  };

  return { 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      totalPrice,
      orderHistory,
      processCheckout, 
      clearHistory
  };
});