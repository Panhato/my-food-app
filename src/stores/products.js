import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../supabase'; // 🔥 ហៅ Supabase មកប្រើជំនួស Axios

export const useProductStore = defineStore('products', () => {
  const products = ref([]);
  const isLoading = ref(false);

  // ១. ទាញទិន្នន័យពី Supabase (READ)
  const fetchProducts = async () => {
    isLoading.value = true;
    
    // Select * ពី Table 'products'
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false }); // រៀបតាម ID ថ្មីនៅលើ

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      products.value = data;
    }
    
    isLoading.value = false;
  };

  // ហៅទិន្នន័យភ្លាមៗពេល Store ដំណើរការ
  fetchProducts();

  return { products, isLoading, fetchProducts };
});