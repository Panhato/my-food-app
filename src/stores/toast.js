import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const isVisible = ref(false);
  const message = ref('');
  const type = ref('success'); // អាចជា 'success' ឬ 'error'
  let timeout = null;

  // Function បង្ហាញសារ
  const show = (msg, toastType = 'success', duration = 3000) => {
    // 1. បិទសារចាស់សិន (បើកំពុងលោត) និងលុប Timer ចាស់ចោល
    if (timeout) clearTimeout(timeout);
    isVisible.value = false;

    // 2. ដាក់ទិន្នន័យថ្មី
    setTimeout(() => {
        message.value = msg;
        type.value = toastType;
        isVisible.value = true;
    }, 100); // ដាក់ Delay បន្តិចដើម្បីឱ្យ Animation ដំណើរការល្អបើចុចជាប់គ្នា

    // 3. បិទដោយស្វ័យប្រវត្តិបន្ទាប់ពី duration កំណត់ (Default: 3s)
    timeout = setTimeout(() => {
      isVisible.value = false;
    }, duration);
  };

  // Function បិទសារ (សម្រាប់ចុចបិទមុនកំណត់)
  const hide = () => {
    isVisible.value = false;
    if (timeout) clearTimeout(timeout);
  };

  return { isVisible, message, type, show, hide };
});