<script setup>
import { computed, ref } from 'vue';
import { useProductStore } from '../stores/products';
import { useCartStore } from '../stores/cart';
import { useBannerStore } from '../stores/banners';
import { useChefStore } from '../stores/chef'; 
import { RouterLink } from 'vue-router';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const productStore = useProductStore();
const cartStore = useCartStore();
const bannerStore = useBannerStore();
const chefStore = useChefStore(); 
const modules = [Autoplay, Pagination, Navigation];

// State for Modal
const isModalOpen = ref(false);
const currentImage = ref('');

const openImage = (imageUrl) => {
  currentImage.value = imageUrl;
  isModalOpen.value = true;
};

const closeImage = () => {
  isModalOpen.value = false;
  currentImage.value = '';
};

// Get popular products (first 10)
const popularProducts = computed(() => {
  return productStore.products.slice(0, 10);
});

// Currency formatter
const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};
</script>

<template>
  <div class="font-sans bg-gray-50/50 min-h-screen">
    
    <div class="relative w-full h-[220px] md:h-[350px] shadow-sm">
       <Swiper
        :modules="modules"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="h-full w-full group"
      >
        <SwiperSlide v-for="(banner, index) in bannerStore.banners" :key="index">
            <div class="relative w-full h-full overflow-hidden">
                <img :src="banner" class="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" />
                
                <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center items-start px-9 md:px-30 text-white">
                    <h1 class="text-3xl md:text-5xl font-black mb-7 drop-shadow-lg animate-fade-in">រសជាតិពិត <span class="text-orange-500">ម្ហូបខ្មែរ</span></h1>
                    <p class="text-lg md:text-lg mb-7 font-light opacity-100 whitespace-nowrap">សេវាកម្មដឹកជញ្ជូនរហ័ស ទំនុកចិត្ត និងអនាម័យខ្ពស់បំផុតសម្រាប់លោកអ្នក</p>
                    <RouterLink to="/menu" class="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 md:py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl shadow-orange-600/30 text-sm md:text-base">
                        🍽️ កម្ម៉ង់ឥឡូវនេះ
                    </RouterLink>
                </div>
            </div>
        </SwiperSlide>
        
        <SwiperSlide v-if="bannerStore.banners.length === 0">
             <div class="relative w-full h-full bg-slate-900 flex items-center justify-center">
                 <p class="text-gray-400 text-sm italic">សូមបន្ថែម Banner ក្នុង Admin Panel</p>
             </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <div class="max-w-[1450px] mx-auto px-4 py-12 md:py-16">
      
      <div class="flex justify-between items-end mb-10">
        <div>
           <span class="text-orange-600 font-black uppercase tracking-widest text-lg"> ណែនាំសម្រាប់លោកអ្នក</span>
           <h2 class="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-3 mt-1">
             || ម្ហូបពេញនិយមប្រចាំថ្ងៃ
           </h2>
        </div>
        <RouterLink to="/menu" class="bg-white text-orange-600 font-bold text-xs md:text-lg px-5 py-2 rounded-full shadow-sm border border-orange-100 hover:bg-orange-600 hover:text-white transition-all duration-300">
          មើលទាំងអស់ →
        </RouterLink>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-stretch">
        
        <div class="lg:w-[22%] w-full relative group rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-100/50 bg-orange-600 min-h-[350px] lg:min-h-auto border-4 border-white">
          
          <Swiper
            v-if="chefStore.chefs.length > 0"
            :modules="modules"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            class="h-full w-full"
          >
            <SwiperSlide v-for="(chef, index) in chefStore.chefs" :key="index">
                <div class="relative w-full h-full">
                    <img :src="chef.image" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 text-white text-center pb-12">
                        <h3 class="text-lg md:text-xl font-black mb-1 leading-tight">{{ chef.name }}</h3>
                        <p class="text-xs opacity-80 leading-relaxed font-light line-clamp-3">{{ chef.bio }}</p>
                    </div>
                </div>
            </SwiperSlide>
          </Swiper>

          <div v-else class="w-full h-full flex flex-col items-center justify-center text-white bg-orange-400 p-6 text-center">
              <span class="text-4xl mb-2">👨‍🍳</span>
              <p class="font-bold">មិនទាន់មានចុងភៅ</p>
          </div>

        </div>

        <div class="lg:w-[78%] w-full">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            
            <div v-for="food in popularProducts" :key="food.id" 
                 class="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden group flex flex-col hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 cursor-pointer h-full">
              
              <div class="relative aspect-square overflow-hidden m-2 rounded-[1.5rem]">
                <img :src="food.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div class="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm z-10 uppercase tracking-tighter">Hot</div>
              </div>

              <div class="p-3 md:p-4 flex flex-col flex-grow text-center">
                  <h3 class="font-bold text-gray-800 text-xs md:text-sm mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {{ food.title }}
                  </h3>
                  
                  <div class="flex justify-between items-center mt-auto pt-3 border-t border-dashed border-gray-100">
                     <span class="text-sm md:text-base font-black text-gray-900 tracking-tight">{{ formatPrice(food.price) }}</span>
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