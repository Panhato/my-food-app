import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

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
  // ផ្នែកទី ២: ប្រវត្តិការកុម្ម៉ង់ (Order History)
  // =========================================
  const orderHistory = ref([]);

  try {
      const savedHistory = localStorage.getItem('my-order-history');
      if (savedHistory) orderHistory.value = JSON.parse(savedHistory);
  } catch (e) { orderHistory.value = []; }

  // 🔥 Function បង្កើតម៉ោងឱ្យត្រូវនឹងកម្ពុជា (Fix ម៉ោងខុស)
  const getCambodiaTime = () => {
      return new Date().toLocaleString('en-GB', {
          timeZone: 'Asia/Phnom_Penh',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false 
      });
  };

  // Action: បញ្ជាក់ការកុម្ម៉ង់ (Checkout)
  const processCheckout = (customerInfo) => {
      if (items.value.length === 0) return;

      const newOrder = {
          id: Date.now(),
          date: getCambodiaTime(), // 🔥 ប្រើម៉ោងកម្ពុជាត្រង់នេះ
          items: [...items.value],
          total: totalPrice.value,
          customer: customerInfo || {} 
      };

      orderHistory.value.unshift(newOrder);
      localStorage.setItem('my-order-history', JSON.stringify(orderHistory.value));

      // Clear Cart
      items.value = [];
      localStorage.removeItem('my-cart-items');
      
      return true; 
  };

  const clearHistory = () => {
      orderHistory.value = [];
      localStorage.removeItem('my-order-history');
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