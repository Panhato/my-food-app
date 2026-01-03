import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../supabase';
import { useAuthStore } from './auth';

export const useOrderStore = defineStore('order', () => {
  const orders = ref([]);
  const isLoading = ref(false);
  const authStore = useAuthStore();

  // 🔥 មុខងារទាញយក Order របស់ User ដែលកំពុង Login
  const fetchMyOrders = async () => {
    if (!authStore.user) return; // បើអត់ Login ទេ មិនបាច់ធ្វើអី
    
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', authStore.user.id) // យកតែ Order របស់ User ហ្នឹង
        .order('created_at', { ascending: false }); // យកអាថ្មីបំផុតមកលើ

      if (error) throw error;
      orders.value = data;
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return { orders, fetchMyOrders, isLoading };
});