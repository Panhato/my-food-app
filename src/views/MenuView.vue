<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useProductStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import { useBannerStore } from '../stores/banners'; //  Import Banner Store
import FoodCard from '../components/FoodCard.vue';

// បន្ថែម import ទាំងនេះ
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay, Pagination } from 'swiper/modules';

// បន្ថែម modules
const modules = [Autoplay, Pagination];
const productStore = useProductStore();
const cartStore = useCartStore();
const bannerStore = useBannerStore(); //  ហៅប្រើ Store

const categories = [
  { name: 'ទាំងអស់', icon: '' },
  { name: 'សម្ល', icon: '' },
  { name: 'គ្រឿងក្លែម', icon: '' },
  { name: 'ចៀន', icon: '' },
  { name: 'ឆា', icon: '' },
  { name: 'ភេសជ្ជៈ', icon: '' }
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
    
    <div class="fixed top-5 left-4 right-4 md:left-8 md:right-8 z-[100] bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-100/50 border border-white/50 rounded-[2.5rem] py-3 px-6 transition-all duration-300">
      <div class="max-w-[1700px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        
        <div class="flex items-center gap-3 self-start xl:self-center pl-1">
            <div class="bg-orange-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 text-white transform -rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
            </div>
            <div class="leading-none">
                <h1 class="text-xl font-black text-slate-800 uppercase tracking-tighter">MyFood</h1>
                <p class="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Delivery</p>
            </div>
        </div>

        <nav class="hidden xl:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full">
            <RouterLink to="/" class="px-6 py-2.5 rounded-full text-slate-500 font-bold hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all text-base">ទំព័រដើម</RouterLink>
            <RouterLink to="/menu" class="px-6 py-2.5 rounded-full bg-white text-orange-600 font-black shadow-sm text-base">ម៉ឺនុយ</RouterLink>
            <RouterLink to="/about" class="px-6 py-2.5 rounded-full text-slate-500 font-bold hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all text-base">អំពីយើង</RouterLink>
            <RouterLink to="/contact" class="px-6 py-2.5 rounded-full text-slate-500 font-bold hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all text-base">ទំនាក់ទំនង</RouterLink>
        </nav>

        <div class="flex items-center gap-4 w-full xl:w-auto justify-end">
            <div class="relative w-full md:w-[280px] group">
                <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </span>
                <input v-model="searchQuery" type="text" placeholder="ស្វែងរក..." class="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-bold text-slate-700 transition-all placeholder:text-slate-400" />
                <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-2 flex items-center pr-2 text-slate-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div class="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div class="flex items-center gap-2">
                <RouterLink to="/admin" class="p-3 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.138-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg></RouterLink>
                <RouterLink to="/history" class="p-3 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></RouterLink>
                <RouterLink to="/cart" class="relative p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors group/cart">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    <span v-if="cartStore.items.length > 0" class="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{{ cartStore.items.length }}</span>
                </RouterLink>
            </div>
        </div>
      </div>
    </div>

    <div class="max-w-[1700px] mx-auto px-4 md:px-8 mt-16 lg:mt-12 mb-4 animate-fade-in">
        <div class="relative w-full h-[100px] md:h-[160px] rounded-[2rem] overflow-hidden shadow-xl shadow-orange-100 border-4 border-white bg-white">
            
            <Swiper
                :modules="modules"
                :slides-per-view="1"
                :loop="true"
                :autoplay="{ delay: 4000, disableOnInteraction: false }"
                :pagination="{ clickable: true }"
                class="w-full h-full"
            >
                <SwiperSlide v-for="(banner, index) in bannerStore.menuBanners" :key="index">
                    <div class="w-full h-full relative cursor-pointer group">
                        
                        <div class="w-full h-full absolute inset-0">
                            <video 
                                v-if="(typeof banner === 'object' ? banner.image : banner).startsWith('data:video')"
                                :src="typeof banner === 'object' ? banner.image : banner" 
                                class="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105"
                                autoplay loop muted playsinline
                            ></video>

                            <img 
                                v-else
                                :src="typeof banner === 'object' ? banner.image : banner" 
                                class="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105" 
                            />
                        </div>
                        
                        <div class="absolute inset-0 bg-black/40 z-10"></div>

                        <div v-if="typeof banner === 'object'" class="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 pointer-events-none">
                            <h2 class="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-md tracking-wide" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                                {{ banner.title }}
                            </h2>
                            <p class="text-base md:text-xl text-white/90 font-medium max-w-2xl drop-shadow-sm leading-relaxed" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
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
          <div class="mb-6 flex justify-between items-center px-2">
            <p class="text-lg md:text-base font-black text-slate-700 uppercase tracking-widest">
              រកឃើញ <span class="text-orange-600 text-lg">{{ filteredProducts.length }}</span> មុខម្ហូប
            </p>
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
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>