<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase'; 
import { useRouter } from 'vue-router'; 
import { useCartStore } from '../stores/cart';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const modules = [Autoplay, Pagination, Navigation];
const cartStore = useCartStore();
const router = useRouter(); 

// State
const banners = ref([]);
const chefs = ref([]);
const products = ref([]);
const isLoading = ref(true); // បន្ថែម Loading state

// 🔥 1. Fetch Banners
const fetchBanners = async () => {
  try {
      const { data, error } = await supabase.from('banners').select('*');
      if (error) throw error;
      banners.value = data || [];
  } catch (err) {
      console.error("Error loading banners:", err.message);
      banners.value = []; // ❌ លែងដាក់រូប Dummy ហើយ (ដាក់ទទេវិញ)
  }
};

// 🔥 2. Fetch Chefs
const fetchChefs = async () => {
  try {
      const { data, error } = await supabase.from('chefs').select('*');
      if (error) throw error;
      chefs.value = data || [];
  } catch (err) {
      console.error("Error loading chefs:", err.message);
      chefs.value = []; // ❌ លែងដាក់រូប Dummy ហើយ
  }
};

// 🔥 3. Fetch Products (សំខាន់!)
const fetchProducts = async () => {
  try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      products.value = data || [];
  } catch (err) {
      console.error("Error loading products:", err.message);
      // 🔥 កែត្រង់នេះ៖ ដាក់ជា List ទទេ ដើម្បីកុំឱ្យចេញ Burger/Pizza ផ្តេសផ្តាស
      products.value = []; 
  }
};

// Limit to 15 items
const popularProducts = computed(() => {
  return products.value.slice(0, 15);
});

const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};

const goToMenu = () => {
    router.push('/menu');
};

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([fetchBanners(), fetchChefs(), fetchProducts()]);
  isLoading.value = false;
});
</script>

<template>
  <div class="font-sans min-h-screen bg-[#FDFDFD] pb-20">
    
    <div v-if="banners.length > 0" class="w-full h-[160px] md:h-[260px] relative overflow-hidden bg-gray-100">
        <Swiper
            :modules="modules"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            :pagination="{ clickable: true }"
            class="w-full h-full"
        >
            <SwiperSlide v-for="(banner, index) in banners" :key="index">
                <div class="w-full h-full relative">
                    <img :src="banner.image" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-8 md:px-20">
                        <div class="max-w-2xl animate-fade-in-up">
                            <h2 class="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-lg leading-tight">
                                {{ banner.title }}
                            </h2>
                            <p class="text-sm md:text-lg text-white/90 font-medium mb-4 line-clamp-2">
                                {{ banner.subtitle }}
                            </p>
                            <RouterLink to="/menu" class="inline-block px-6 py-2 bg-orange-600 text-white text-sm font-bold rounded-full hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1">
                                កម្ម៉ង់ឥឡូវនេះ
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
    </div>
    <div v-else class="w-full h-[160px] md:h-[260px] bg-slate-100 flex items-center justify-center text-slate-400">
        <span v-if="isLoading">កំពុងផ្ទុក...</span>
        <span v-else>មិនមានរូបភាព Banner</span>
    </div>

    <div class="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        
        <div class="flex justify-between items-end mb-6">
            <div>
                <p class="text-orange-600 font-bold mb-1 uppercase tracking-wider text-xs">ណែនាំសម្រាប់លោកអ្នក</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
                    🔥 ម្ហូបពេញនិយមប្រចាំថ្ងៃ
                </h2>
            </div>
            <RouterLink to="/menu" class="hidden md:flex items-center gap-2 text-slate-500 font-bold hover:text-orange-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 hover:border-orange-200 shadow-sm text-sm">
                មើលទាំងអស់ <span class="text-lg">→</span>
            </RouterLink>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 items-start">
            
            <div class="w-full lg:w-[260px] flex-shrink-0">
                <div v-if="chefs.length > 0" class="bg-orange-600 rounded-[2rem] relative overflow-hidden shadow-xl shadow-orange-200 h-auto border-4 border-white">
                    <Swiper
                        :modules="modules"
                        :slides-per-view="1"
                        :loop="true"
                        :autoplay="{ delay: 4000, disableOnInteraction: false }"
                        class="w-full"
                    >
                        <SwiperSlide v-for="chef in chefs" :key="chef.id">
                            <div class="relative w-full aspect-[3/4]"> 
                                <img :src="chef.image" class="w-full h-full object-cover" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 text-white text-center pb-8">
                                    <span class="text-orange-400 font-bold tracking-widest text-xs mb-1">MASTER CHEF</span>
                                    <h3 class="text-xl font-black mb-1 leading-tight">{{ chef.name }}</h3>
                                    <p class="text-xs opacity-80 leading-relaxed font-light line-clamp-3">{{ chef.bio }}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
                <div v-else class="bg-orange-50 rounded-[2rem] h-[300px] flex items-center justify-center text-orange-300 border-4 border-white">
                    <p class="font-bold">No Chef Info</p>
                </div>
            </div>

            <div class="flex-1 w-full">
                
                <div v-if="popularProducts.length === 0" class="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-slate-50">
                    <p class="text-gray-500 font-bold text-lg mb-2">
                        {{ isLoading ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'មិនមានទិន្នន័យម្ហូបទេ' }}
                    </p>
                    <p v-if="!isLoading" class="text-sm text-gray-400 max-w-md mx-auto">
                        សូមពិនិត្យមើលអ៊ីនធឺណិត ឬសាកល្បងនៅលើទូរស័ព្ទដៃ (ប្រសិនបើកុំព្យូទ័រមានបញ្ហា Antivirus)។
                    </p>
                </div>

                <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <div v-for="food in popularProducts" :key="food.id" 
                         @click="goToMenu"
                         class="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden group flex flex-col hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 cursor-pointer h-full relative transform hover:-translate-y-1">
                        
                        <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                            <img :src="food.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-10 uppercase tracking-wider">Hot</div>
                        </div>

                        <div class="px-3 pb-3 pt-1 flex flex-col flex-grow text-center">
                            <h3 class="font-bold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {{ food.title }}
                            </h3>
                            <p class="text-[10px] text-gray-400 line-clamp-1 mb-2">{{ food.category }}</p>
                            
                            <div class="mt-auto pt-2 border-t border-dashed border-gray-100">
                                <span class="text-sm font-black text-orange-600">{{ formatPrice(food.price) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex justify-center md:hidden">
                    <RouterLink to="/menu" class="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-center hover:bg-slate-200">
                        មើលម្ហូបទាំងអស់SSSSSSSSSSSSSS
                    </RouterLink>
                </div>
            </div>

        </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>