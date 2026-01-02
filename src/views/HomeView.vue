<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { RouterLink } from 'vue-router';
import { useCartStore } from '../stores/cart';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const modules = [Autoplay, Pagination, Navigation];
const cartStore = useCartStore();

// State សម្រាប់ទុកទិន្នន័យពី Supabase
const banners = ref([]);
const chefs = ref([]);
const products = ref([]);

// 1. ទាញ Banner
const fetchBanners = async () => {
  const { data, error } = await supabase.from('banners').select('*');
  if (data) banners.value = data;
};

// 2. ទាញ Chef
const fetchChefs = async () => {
  const { data, error } = await supabase.from('chefs').select('*');
  if (data) chefs.value = data;
};

// 3. ទាញ Products
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*');
  if (data) products.value = data;
};

// យកផលិតផល ១០ មុខដំបូង
const popularProducts = computed(() => {
  return products.value.slice(0, 10);
});

// Format លុយ
const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};

onMounted(() => {
  fetchBanners();
  fetchChefs();
  fetchProducts();
});
</script>

<template>
  <div class="font-sans bg-gray-50/50 min-h-screen pb-20">
    
    <div class="relative w-full h-[200px] md:h-[350px] shadow-sm bg-slate-100">
       <Swiper
        v-if="banners.length > 0"
        :modules="modules"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="h-full w-full group"
      >
        <SwiperSlide v-for="banner in banners" :key="banner.id">
            <div class="relative w-full h-full overflow-hidden">
                <img :src="banner.image" class="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" />
                
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center items-start px-8 md:px-24 text-white">
                    <h1 class="text-3xl md:text-5xl font-black mb-4 drop-shadow-lg animate-fade-in leading-tight">
                        {{ banner.title || 'រសជាតិពិត' }} <br/>
                        <span class="text-orange-500">{{ banner.subtitle || 'ម្ហូបខ្មែរ' }}</span>
                    </h1>
                    <RouterLink to="/menu" class="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl shadow-orange-600/30 text-sm md:text-base flex items-center gap-2">
                        🍽️ កម្ម៉ង់ឥឡូវនេះ
                    </RouterLink>
                </div>
            </div>
        </SwiperSlide>
      </Swiper>

      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          <p class="animate-pulse">កំពុងទាញរូបភាព...</p>
      </div>
    </div>

    <div class="max-w-[1450px] mx-auto px-4 py-12 md:py-16">
      
      <div class="flex justify-between items-end mb-10">
        <div>
           <span class="text-orange-600 font-black uppercase tracking-widest text-xs md:text-sm">ណែនាំសម្រាប់លោកអ្នក</span>
           <h2 class="text-2xl md:text-4xl font-black text-gray-800 flex items-center gap-3 mt-2">
             🔥 ម្ហូបពេញនិយមប្រចាំថ្ងៃ
           </h2>
        </div>
        <RouterLink to="/menu" class="bg-white text-orange-600 font-bold text-xs md:text-base px-6 py-3 rounded-full shadow-sm border border-orange-100 hover:bg-orange-600 hover:text-white transition-all duration-300">
          មើលទាំងអស់ →
        </RouterLink>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-stretch">
        
        <div class="lg:w-[25%] w-full relative group rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-100/50 bg-orange-600 min-h-[400px] border-4 border-white">
          <Swiper
            v-if="chefs.length > 0"
            :modules="modules"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            class="h-full w-full"
          >
            <SwiperSlide v-for="chef in chefs" :key="chef.id">
                <div class="relative w-full h-full">
                    <img :src="chef.image" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-white text-center pb-12">
                        <span class="text-orange-400 font-bold tracking-widest text-xs mb-2">MASTER CHEF</span>
                        <h3 class="text-2xl font-black mb-2 leading-tight">{{ chef.name }}</h3>
                        <p class="text-sm opacity-80 leading-relaxed font-light line-clamp-4">{{ chef.bio }}</p>
                    </div>
                </div>
            </SwiperSlide>
          </Swiper>
          
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-white bg-orange-400 p-6 text-center">
               <span class="text-5xl mb-4">👨‍🍳</span>
               <p class="font-bold">មិនទាន់មានទិន្នន័យចុងភៅ</p>
          </div>
        </div>

        <div class="lg:w-[75%] w-full">
          <div v-if="popularProducts.length === 0" class="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
              <p class="text-gray-400">មិនទាន់មានទិន្នន័យម្ហូប</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            <div v-for="food in popularProducts" :key="food.id" 
                 class="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden group flex flex-col hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 cursor-pointer h-full relative">
              
              <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                <img :src="food.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-10 uppercase tracking-wider">Hot</div>
              </div>

              <div class="p-4 flex flex-col flex-grow text-center">
                  <h3 class="font-bold text-gray-800 text-sm md:text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {{ food.title }}
                  </h3>
                  <p class="text-xs text-gray-400 line-clamp-1 mb-3">{{ food.category }}</p>
                  
                  <div class="flex justify-between items-center mt-auto pt-3 border-t border-dashed border-gray-100">
                     <span class="text-base font-black text-slate-800">{{ formatPrice(food.price) }}</span>
                     <button @click.prevent="cartStore.addToCart(food)" class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
                        +
                     </button>
                  </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.swiper-pagination-bullet-active {
  background-color: #f97316 !important;
  width: 25px !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
}

.animate-fade-in {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>