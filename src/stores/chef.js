import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChefStore = defineStore('chef', () => {
  
  // 🔥 ទុកទិន្នន័យជា Array (បញ្ជី)
  const chefs = ref([]);

  // 1. ទាញទិន្នន័យពី LocalStorage
  try {
      const saved = localStorage.getItem('my-chefs');
      if (saved) {
          chefs.value = JSON.parse(saved);
      } else {
          chefs.value = [];
      }
  } catch (e) {
      console.error("Error parsing chefs:", e);
      chefs.value = [];
  }

  // Save ទៅ LocalStorage
  const saveToStorage = () => {
      localStorage.setItem('my-chefs', JSON.stringify(chefs.value));
  };

  // 2. បន្ថែម (Create)
  const addChef = (chefData) => {
      chefs.value.push(chefData);
      saveToStorage();
      return true;
  };

  // 3. កែប្រែ (Update)
  const updateChef = (index, updatedData) => {
      chefs.value[index] = updatedData;
      saveToStorage();
      return true;
  };

  // 4. លុប (Delete)
  const removeChef = (index) => {
      if(confirm("តើអ្នកចង់លុបព័ត៌មានចុងភៅនេះមែនទេ?")) {
          chefs.value.splice(index, 1);
          saveToStorage();
      }
  };

  return { chefs, addChef, updateChef, removeChef };
});