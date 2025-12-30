import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useProductStore = defineStore('products', () => {
  const products = ref([]);
  
  // 🔥 កុំភ្លេចឆែកមើល URL នេះឱ្យត្រូវនឹង Folder របស់បង
  const API_URL = 'http://localhost/my-food-app/public/api';

  // ១. ទាញទិន្នន័យ (READ)
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-products.php`);
      
      products.value = response.data.map(item => ({
        ...item,
        price: parseFloat(item.price), // បម្លែងតម្លៃទៅជាលេខ
        desc: item.desc || '' // ការពារកុំឱ្យ desc ទៅជា null
      }));
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };
  
  // ហៅទិន្នន័យមកភ្លាមៗពេលបើក App
  fetchProducts();

  // ២. បន្ថែម (CREATE)
  const addProduct = async (newFood) => {
    try {
      // ហៅ API ដើម្បីរក្សាទុកក្នុង Database
      const response = await axios.post(`${API_URL}/add-product.php`, newFood);
      
      // ប្រសិនបើជោគជ័យ បន្ថែមចូលក្នុងបញ្ជី Local ភ្លាម
      if (response.data && response.data.id) {
        products.value.push({ 
            ...newFood, 
            id: response.data.id // យក ID ពី Database
        });
      } else {
        fetchProducts(); 
      }
    } catch (error) {
      console.error("Error adding:", error);
    }
  };

  // ៣. លុប (DELETE)
  // 🔥 កែត្រង់នេះ៖ ដក confirm() ចេញ ព្រោះយើងប្រើ Modal នៅ AdminView ហើយ
  const deleteProduct = async (id) => {
      try {
        // លុបចេញពី Local ភ្លាមៗ (ឲ្យអ្នកប្រើឃើញលឿន)
        products.value = products.value.filter(p => p.id !== id);

        // បន្ទាប់មកទើបហៅ API លុបក្នុង Database
        await axios.post(`${API_URL}/delete-product.php`, { id: id });
      } catch (error) {
        console.error("Error deleting:", error);
        fetchProducts(); // បើលុបបរាជ័យ ហៅទិន្នន័យមកវិញ
      }
  };

  // ៤. កែប្រែ (UPDATE)
  const updateProduct = async (updatedFood) => {
    try {
      // ១. Update ក្នុង Local State ភ្លាមៗ (កុំឱ្យ User ចាំយូរ)
      const index = products.value.findIndex(p => p.id === updatedFood.id);
      if (index !== -1) {
        products.value[index] = { 
            ...products.value[index], // រក្សាទុកទិន្នន័យចាស់ខ្លះ
            ...updatedFood,           // ដាក់ទិន្នន័យថ្មីចូល (រួមទាំង desc)
            price: parseFloat(updatedFood.price) 
        };
      }

      // ២. បន្ទាប់មកទើបបញ្ជូនទៅ Backend
      await axios.post(`${API_URL}/update-product.php`, updatedFood);
      
    } catch (error) {
      console.error("Error updating:", error);
      fetchProducts(); // បើមានបញ្ហា ហៅទិន្នន័យដើមមកវិញ
    }
  };

  return { products, fetchProducts, addProduct, deleteProduct, updateProduct };
});