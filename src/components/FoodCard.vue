<script setup>
import { computed } from 'vue'; // មិនបាច់ import defineProps
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

// 1. ទទួលទិន្នន័យជា Object "food"
const props = defineProps({
  food: Object 
});

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

// 2. ប្រើ computed ដើម្បីចាប់យកចំនួនម្ហូបក្នុងកន្ត្រកភ្លាមៗ
const cartItem = computed(() => {
  if (!props.food || !props.food.id) return null;
  return cartStore.items.find(item => item.id == props.food.id);
});

const formatPrice = (value) => {
  if (value > 100) return new Intl.NumberFormat('km-KH').format(value) + ' ៛';
  return '$' + parseFloat(value).toFixed(2);
};

// 🔥 Function ថ្មីសម្រាប់ឆែកមើលថា Login ហើយឬនៅ?
const handleOrder = () => {
  if (!authStore.isAuthenticated()) {
    // បោះទៅទំព័រ Login តែម្តង (មិនបាច់ Alert)
    router.push('/login'); 
  } else {
    // បើ Login រួចហើយ -> ដាក់ចូលកន្ត្រកតាមធម្មតា
    cartStore.addToCart(props.food);
  }
};
</script>

<template>
  <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 hover:shadow-lg transition-all duration-300 group relative overflow-hidden h-full flex flex-col z-0">
    
    <div class="absolute top-4 right-4 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 pointer-events-none">HOT</div>

    <div class="h-40 rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50 flex items-center justify-center shrink-0 relative z-0">
      <img :src="food.image || 'https://via.placeholder.com/150'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>

    <div class="flex flex-col flex-grow relative z-10">
      <h3 class="font-black text-slate-800 text-lg line-clamp-1">{{ food.title }}</h3>
      <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">{{ food.desc || 'គ្រឿងផ្សំពិសេស...' }}</p>
      
      <div class="mt-auto pt-2">
        <div class="flex items-end justify-between mb-3">
          <div>
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">តម្លៃ</span>
            <span class="text-xl font-black text-slate-800">{{ formatPrice(food.price) }}</span>
          </div>
        </div>

        <div class="h-12 w-full relative z-20">
            
            <div v-if="cartItem" class="flex items-center justify-between bg-orange-50 rounded-xl p-1 h-full border border-orange-200 animate-fade-in relative z-20">
                <button 
                    @click.stop="cartStore.updateQuantity(food.id, -1)" 
                    class="w-10 h-full bg-white text-orange-600 rounded-lg shadow-sm font-black text-xl hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer relative z-30"
                >
                    -
                </button>
                
                <span class="font-black text-orange-700 text-lg w-8 text-center select-none relative z-20">
                    {{ cartItem.quantity }}
                </span>
                
                <button 
                    @click.stop="cartStore.updateQuantity(food.id, 1)" 
                    class="w-10 h-full bg-orange-600 text-white rounded-lg shadow-md font-black text-xl hover:bg-orange-700 transition-colors flex items-center justify-center cursor-pointer relative z-30"
                >
                    +
                </button>
            </div>

            <button 
                v-else 
                @click.stop="handleOrder" 
                class="w-full h-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer relative z-30"
            >
                <span>+ កម្ម៉ងឥឡូវនេះ</span>
            </button>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>