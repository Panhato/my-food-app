<script setup>
import { ref, computed } from 'vue';
import { useProductStore } from '../stores/products';

const productStore = useProductStore();

// Get first 4 products
const featuredItems = computed(() => {
  return productStore.products.slice(0, 4);
});

// --- Image Modal Logic ---
const isModalOpen = ref(false);
const currentImage = ref('');

const openImage = (image) => {
  currentImage.value = image;
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeImage = () => {
  isModalOpen.value = false;
  currentImage.value = '';
  document.body.style.overflow = 'auto';
};

const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};
</script>

<template>
  <div class="py-12 bg-slate-50/50">
    
    <div class="max-w-[1700px] mx-auto px-4">
      <div class="mb-10 text-center md:text-left">
        <h4 class="text-orange-500 font-extrabold uppercase tracking-[0.2em] text-xs mb-3">Recommended For You</h4>
        <h2 class="text-3xl md:text-4xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <span class="text-4xl">🔥</span> ម្ហូបពេញនិយមប្រចាំថ្ងៃ
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          v-for="item in featuredItems" 
          :key="item.id" 
          class="group flex flex-col bg-white rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-orange-100 h-full"
        >
          <div class="relative aspect-square overflow-hidden rounded-[2rem] bg-slate-50 flex items-center justify-center p-2 cursor-zoom-in border border-slate-100"
               @click="openImage(item.image)">
            <img 
              :src="item.image" 
              class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm" 
              alt="Food Image"
            />
            <div class="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-10 uppercase tracking-widest">
              Hot
            </div>
            
            <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
              <span class="bg-white text-slate-800 text-xs font-bold px-5 py-2.5 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                🔍 មើលរូបធំ
              </span>
            </div>
          </div>

          <div class="mt-6 text-center px-2 flex flex-col flex-grow">
            <h3 class="font-bold text-slate-800 text-xl mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors tracking-tight">
              {{ item.title }}
            </h3>
            
            <div class="mb-4">
               <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">
                 {{ item.category }}
               </span>
            </div>
            
            <div class="mt-auto pt-5 border-t border-dashed border-slate-200">
              <span class="text-2xl font-black text-slate-900 tracking-tighter">
                {{ formatPrice(item.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="isModalOpen" 
           class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 md:p-10" 
           @click="closeImage">
        
        <div class="relative max-w-5xl w-full max-h-full flex items-center justify-center" @click.stop>
          <img 
            :src="currentImage" 
            class="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-zoom-in select-none border-4 border-white/10"
          />
          <button 
            @click="closeImage"
            class="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
</style>