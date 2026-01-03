<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase'; 
import { useProductStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import FoodCard from '../components/FoodCard.vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay, Pagination } from 'swiper/modules';

const modules = [Autoplay, Pagination];
const productStore = useProductStore();
const cartStore = useCartStore();

// State for Banners
const menuBanners = ref([]);

// Fetch Banners with Fallback
const fetchMenuBanners = async () => {
  const { data } = await supabase.from('banners').select('*');
  if (data && data.length > 0) {
      menuBanners.value = data;
  } else {
      // 🔥 Dummy Data Fallback if DB is empty
      menuBanners.value = [
          { 
            id: 1, 
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop', 
            title: 'Our Menu', 
            subtitle: 'Fresh & Tasty' 
          },
          { 
            id: 2, 
            image: 'https://images.unsplash.com/photo-1543353071-873f1753ade2?q=80&w=2070&auto=format&fit=crop', 
            title: 'Special Offers', 
            subtitle: 'Order Now' 
          }
      ];
  }
};

onMounted(() => {
    fetchMenuBanners();
});

const categories = [
  { name: 'ទាំងអស់', icon: '🍽️' },
  { name: 'សម្ល', icon: '🍲' },
  { name: 'គ្រឿងក្លែម', icon: '🍢' },
  { name: 'ចៀន', icon: '🍗' },
  { name: 'ឆា', icon: '🥘' },
  { name: 'ភេសជ្ជៈ', icon: '🥤' }
];

const activeCategory = ref('ទាំងអស់');
const searchQuery = ref('');

const filteredProducts = computed(() => {
  return productStore.products.filter(p => {
    const matchCategory = activeCategory.value === 'ទាំងអស់' || p.category === activeCategory.value;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCategory && matchSearch;
  });
});
</script>

<template>
  <div class="font-sans min-h-screen bg-[#FDFDFD] pb-20">
    
    <div class="pt-24"></div>

    <div class="max-w-[1700px] mx-auto px-4 md:px-8 mb-4 animate-fade-in">
        <div class="relative w-full h-[160px] md:h-[260px] rounded-[2rem] overflow-hidden shadow-xl shadow-orange-100 border-4 border-white bg-white">
            <Swiper
                v-if="menuBanners.length > 0"
                :modules="modules"
                :slides-per-view="1"
                :loop="true"
                :autoplay="{ delay: 4000, disableOnInteraction: false }"
                :pagination="{ clickable: true }"
                class="w-full h-full"
            >
                <SwiperSlide v-for="(banner, index) in menuBanners" :key="index">
                    <div class="w-full h-full relative cursor-pointer group">
                        <img :src="banner.image" class="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105" />
                        <div class="absolute inset-0 bg-black/40 z-10"></div>
                        <div class="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 pointer-events-none">
                            <h2 class="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-md tracking-wide">
                                {{ banner.title }}
                            </h2>
                            <p class="text-base md:text-xl text-white/90 font-medium max-w-2xl drop-shadow-sm leading-relaxed">
                                {{ banner.subtitle }}
                            </p>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    </div>

    <div class="max-w-[1700px] mx-auto p-4 md:p-8 pt-2"> 
      <div class="flex flex-col lg:flex-row gap-8">
        
        <div class="lg:w-72 flex-shrink-0">
          <div class="sticky top-32 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50">
            <div class="flex items-center gap-2 mb-6 ml-2">
              <span class="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              <h3 class="text-lg font-black uppercase text-slate-600 tracking-[0.2em]">ប្រភេទម្ហូប</h3>
            </div>
            
            <nav class="text-lg flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
              <button 
                v-for="cat in categories" 
                :key="cat.name" 
                @click="activeCategory = cat.name" 
                class="relative flex items-center gap-4 px-5 py-4 rounded-[1.5rem] font-bold transition-all duration-300 text-base whitespace-nowrap min-w-fit lg:min-w-0 group"
                :class="activeCategory === cat.name 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' 
                  : 'bg-transparent text-slate-500 hover:bg-orange-50 hover:text-orange-600'"
              >
                <span class="text-2xl transition-transform group-hover:scale-110">{{ cat.icon }}</span>
                <span class="tracking-wide">{{ cat.name }}</span>
              </button>
            </nav>
          </div>
        </div>

        <div class="flex-grow">
          <div class="mb-6 flex flex-col md:flex-row justify-between items-center px-2 gap-4">
            <p class="text-lg md:text-base font-black text-slate-700 uppercase tracking-widest">
              រកឃើញ <span class="text-orange-600 text-lg">{{ filteredProducts.length }}</span> មុខម្ហូប
            </p>
            
            <div class="relative w-full md:w-[280px] group">
                <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </span>
                <input v-model="searchQuery" type="text" placeholder="ស្វែងរក..." class="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-bold text-slate-700 transition-all placeholder:text-slate-400" />
                <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-2 flex items-center pr-2 text-slate-400 hover:text-red-500 transition-colors">✕</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <div v-for="food in filteredProducts" :key="food.id" class="h-full">
               <FoodCard :food="food" />
            </div>
          </div>

          <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <span class="text-6xl mb-4 opacity-20">🔍</span>
            <p class="text-slate-400 font-black uppercase tracking-widest text-sm">រកមិនឃើញមុខម្ហូបនេះទេ</p>
            <button @click="searchQuery = ''" class="mt-4 text-orange-600 font-bold hover:underline">បង្ហាញទាំងអស់វិញ</button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>