<script setup>
import { computed } from 'vue';
import { useToastStore } from '../stores/toast';

const toast = useToastStore();

// កំណត់ Style និង Icon តាមប្រភេទ (ប្រើ Computed ដើម្បីសុវត្ថិភាព)
const activeConfig = computed(() => {
  const configs = {
    success: {
      container: 'bg-green-50 border-green-500 text-green-800',
      iconBg: 'bg-green-100 text-green-600',
      title: 'ជោគជ័យ!',
      iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' // Check Icon
    },
    error: {
      container: 'bg-red-50 border-red-500 text-red-800',
      iconBg: 'bg-red-100 text-red-600',
      title: 'បរាជ័យ!',
      iconPath: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z' // Exclamation Icon
    }
  };

  // Fallback ទៅ success បើរក type មិនឃើញ
  return configs[toast.type] || configs.success;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toast.isVisible" 
           class="fixed top-5 right-5 z-[9999] flex items-start gap-4 p-4 pr-12 rounded-2xl shadow-2xl border min-w-[320px] max-w-md backdrop-blur-md transition-all duration-300"
           :class="activeConfig.container"
      >
        
        <div class="p-2 rounded-full shrink-0" :class="activeConfig.iconBg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" :d="activeConfig.iconPath" />
          </svg>
        </div>
        
        <div class="pt-0.5">
           <h4 class="font-black text-base mb-0.5">{{ activeConfig.title }}</h4>
           <p class="font-medium text-sm leading-relaxed opacity-90">{{ toast.message }}</p>
        </div>

        <button @click="toast.hide()" class="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 transition-colors text-current opacity-60 hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Animation ពេលលោតចេញ/ចូល */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Bouncy effect */
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
</style>