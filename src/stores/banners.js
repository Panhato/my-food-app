import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useBannerStore = defineStore('banners', () => {
  
  // ==========================================
  // Part 1: Main Banners (Large Slide) - Uses API
  // ==========================================
  const banners = ref([]);
  const API_URL = 'http://localhost/my-food-app/public/api';

  // 1. Fetch Data (READ)
  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-banners.php`);
      if (Array.isArray(response.data)) {
        banners.value = response.data;
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  // Call immediately
  fetchBanners();

  // 2. Add Banner (CREATE)
  const addBanner = async (imageBase64) => {
    try {
      const response = await axios.post(`${API_URL}/add-banner.php`, { 
        image: imageBase64 
      });
      
      if (response.data.message === "Success") {
        banners.value.unshift(response.data.url);
      }
    } catch (error) {
      console.error("Error adding banner:", error);
      alert("Failed to upload image!");
    }
  };

  // 3. Delete Banner (DELETE)
  const deleteBanner = async (index) => {
    if(confirm('Are you sure you want to delete this banner?')) {
      try {
        const urlToDelete = banners.value[index];
        banners.value.splice(index, 1); // Remove from UI

        await axios.post(`${API_URL}/delete-banner.php`, { 
          url: urlToDelete 
        });
      } catch (error) {
        console.error("Error deleting banner:", error);
        fetchBanners(); // Refetch if failed
      }
    }
  };

  // ==========================================
  // Part 2: Menu Banners (Small Slide + Text) - Uses LocalStorage
  // ==========================================
  
  const menuBanners = ref([]);

  // Try to load saved data from LocalStorage
  try {
      const saved = localStorage.getItem('my-menu-banners');
      if (saved) {
          menuBanners.value = JSON.parse(saved);
      } else {
          menuBanners.value = [];
      }
  } catch (e) {
      console.error("Error parsing menu banners:", e);
      menuBanners.value = [];
  }

  // 🔥 Function to Add New Slide
  const addMenuBanner = (bannerData) => {
    try {
      menuBanners.value.push(bannerData);
      localStorage.setItem('my-menu-banners', JSON.stringify(menuBanners.value));
      return true; 
    } catch (e) {
      menuBanners.value.pop();
      console.error("Storage full:", e);
      alert("❌ Failed! File is too large for browser storage.");
      return false; 
    }
  };

  // 🔥🔥🔥 Function to Update Slide (New) 🔥🔥🔥
  const updateMenuBanner = (index, updatedData) => {
    try {
      // Update specific index
      menuBanners.value[index] = updatedData;
      
      // Save to LocalStorage
      localStorage.setItem('my-menu-banners', JSON.stringify(menuBanners.value));
      return true;
    } catch (e) {
      console.error("Error updating banner:", e);
      alert("❌ Failed to update! File might be too large.");
      return false;
    }
  };

  // 🔥 Function to Delete Slide
  const removeMenuBanner = (index) => {
      if(confirm("Are you sure you want to delete this slide?")) {
          menuBanners.value.splice(index, 1);
          localStorage.setItem('my-menu-banners', JSON.stringify(menuBanners.value));
      }
  };

  return { 
    banners, 
    fetchBanners, 
    addBanner, 
    deleteBanner,
    // 🔥 Export Menu Banner functions
    menuBanners,     
    addMenuBanner,   
    updateMenuBanner, // Don't forget to export this!
    removeMenuBanner 
  };
});