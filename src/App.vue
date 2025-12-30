<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useCartStore } from './stores/cart';
import { useAuthStore } from './stores/auth';
import Toast from './components/Toast.vue'; // 🔥 Import Toast Component

const cartStore = useCartStore();
const authStore = useAuthStore();
const isMenuOpen = ref(false); 
const isScrolled = ref(false); 

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50 font-sans relative">
    
    <Toast />

    <nav 
      class="fixed top-0 w-full z-[100] transition-all duration-300"
      :class="[
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2 border-b border-gray-100' : 'bg-transparent py-4',
        isMenuOpen ? 'bg-white shadow-xl' : ''
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <RouterLink to="/" @click="closeMenu" class="flex items-center gap-2 group">
            <div class="bg-orange-500 text-white p-2 rounded-xl transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-2xl font-black tracking-tight text-slate-800">
                My<span class="text-orange-600">Food</span>
              </span>
              <span class="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase ml-0.5">Delivery</span>
            </div>
          </RouterLink>

          <div class="hidden md:flex items-center space-x-8">
            <RouterLink to="/" class="nav-link">ទំព័រដើម</RouterLink>
            <RouterLink to="/menu" class="nav-link">ម៉ឺនុយ</RouterLink>
            <RouterLink to="/about" class="nav-link">អំពីយើង</RouterLink>
            <RouterLink to="/contact" class="nav-link">ទំនាក់ទំនង</RouterLink>
          </div>

          <div class="hidden md:flex items-center gap-3">
            
            <RouterLink v-if="authStore.isAdmin && authStore.isAdmin()" to="/admin" class="icon-btn" title="Admin Panel">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.45.12l-.737-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.93l-.15.894Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </RouterLink>

            <RouterLink to="/history" class="icon-btn" title="Order History">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </RouterLink>

            <RouterLink to="/cart" class="relative group ml-2">
              <div class="bg-slate-100 group-hover:bg-orange-500 transition-all p-3 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-slate-700 group-hover:text-white transition-colors">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </div>
              <span v-if="cartStore.items.length > 0" 
                class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                {{ cartStore.items.length }}
              </span>
            </RouterLink>

            <div v-if="!authStore.isAuthenticated()">
              <RouterLink to="/login" class="px-4 py-2 bg-slate-800 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors">
                  Login
              </RouterLink>
            </div>
            
            <div v-else class="flex items-center gap-3 ml-2">
               <RouterLink to="/profile" class="flex items-center gap-3 group cursor-pointer" title="មើលគណនី">
                  
                  <div class="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-orange-400 transition-all shadow-sm bg-white">
                    <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" alt="Profile" />
                    <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-lg text-slate-400 group-hover:bg-orange-50 transition-colors">
                      👤
                    </div>
                  </div>

                  <div class="flex flex-col">
                      <span class="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors leading-none">
                        {{ authStore.user?.username }}
                      </span>
                  </div>
               </RouterLink>

               <div class="h-6 w-[1px] bg-slate-200 mx-1"></div>

               <button @click="authStore.logout()" class="text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100">
                  Logout
               </button>
            </div>

          </div>

          <div class="md:hidden flex items-center">
            <button @click="isMenuOpen = !isMenuOpen" class="text-slate-700 p-2 focus:outline-none">
              <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <transition 
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div v-if="isMenuOpen" class="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden">
          <div class="px-4 py-4 space-y-1">
            <RouterLink to="/" @click="closeMenu" class="mobile-link">ទំព័រដើម</RouterLink>
            <RouterLink to="/menu" @click="closeMenu" class="mobile-link">ម៉ឺនុយ</RouterLink>
            <RouterLink to="/history" @click="closeMenu" class="mobile-link">ប្រវត្តិការកុម្ម៉ង់</RouterLink>
            <RouterLink to="/about" @click="closeMenu" class="mobile-link">អំពីយើង</RouterLink>
            <RouterLink to="/contact" @click="closeMenu" class="mobile-link">ទំនាក់ទំនង</RouterLink>
            
            <RouterLink v-if="authStore.isAdmin && authStore.isAdmin()" to="/admin" @click="closeMenu" class="mobile-link text-orange-600 font-bold border-t border-gray-50 pt-3 mt-2">Admin Panel</RouterLink>
            
            <RouterLink to="/cart" @click="closeMenu" class="mobile-link flex justify-between bg-orange-50 rounded-xl mt-4">
              <span>កន្ត្រករបស់អ្នក</span>
              <span class="bg-orange-600 text-white px-3 rounded-full text-xs py-1">{{ cartStore.items.length }}</span>
            </RouterLink>

             <div v-if="!authStore.isAuthenticated()" class="mt-4 pt-4 border-t border-gray-100">
              <RouterLink to="/login" @click="closeMenu" class="block w-full text-center py-2 bg-slate-800 text-white rounded-xl font-bold">Login</RouterLink>
            </div>
            
            <div v-else class="mt-4 pt-4 border-t border-gray-100">
               <RouterLink to="/profile" @click="closeMenu" class="flex items-center gap-3 mobile-link mb-2 bg-slate-50 p-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                     <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" />
                     <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-xl text-slate-400">👤</div>
                  </div>
                  <div>
                     <p class="text-xs text-slate-400 font-bold mb-0.5">គណនី</p>
                     <span class="font-black text-lg text-slate-800">{{ authStore.user?.username }}</span>
                  </div>
               </RouterLink>
               <button @click="authStore.logout(); closeMenu()" class="block w-full text-center py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <main class="flex-grow pt-24 pb-12">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="bg-[#0f172a] text-white py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
        <div>
          <h3 class="text-2xl font-black text-orange-500 mb-4">My Food</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            រីករាយជាមួយរសជាតិអាហារដ៏ឈ្ងុយឆ្ងាញ់ ជាមួយសេវាកម្មដឹកជញ្ជូនរហ័សទាន់ចិត្ត គុណភាព និងអនាម័យជាចម្បង
          </p>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white mb-4">ទំនាក់ទំនង</h3>
          <ul class="space-y-3 text-slate-400 text-sm">
            <li><a href="#" class="hover:text-orange-500">099 999 333</a></li>
            <li><a href="#" class="hover:text-orange-500">Food_shop04@gmail.com</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white mb-4">តាមដានយើង</h3>
          <div class="flex justify-center md:justify-start gap-4">
            
            <a href="https://www.facebook.com/profile.php?id=61583997748599" target="_blank" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all transform hover:scale-110">
                <span class="font-bold text-xs">FB</span>
            </a>

            <a href="https://t.me/@Panha6640" target="_blank" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#229ED9] hover:text-white transition-all transform hover:scale-110">
                <span class="font-bold text-xs">TG</span>
            </a>

            <a href="https://www.tiktok.com/@news_day4" target="_blank" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#000000] hover:text-white transition-all transform hover:scale-110 border border-slate-700">
                <span class="font-bold text-xs">TT</span>
            </a>

          </div>
        </div>
      </div>
      <div class="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-xs">
        &copy; 2025 MYFOODSHOP.ក្រុមការងារពិសេស
      </div>
    </footer>
    
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.nav-link { @apply text-slate-600 font-bold hover:text-orange-600 transition-all duration-300 relative py-1; }
.nav-link::after { content: ''; @apply absolute left-0 bottom-0 w-0 h-0.5 bg-orange-500 transition-all duration-300; }
.nav-link:hover::after, .nav-link.router-link-active::after { @apply w-full; }
.nav-link.router-link-active { @apply text-orange-600; }

.icon-btn { @apply text-slate-500 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-orange-50 flex items-center justify-center; }

.mobile-link { @apply block px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all; }
.mobile-link.router-link-active { @apply bg-orange-50 text-orange-600 font-bold; }
</style>