<script setup>
import { ref } from 'vue';
import axios from 'axios';

const form = ref({
  name: '',
  email: '',
  message: ''
});

const showSuccessModal = ref(false);
const API_URL = 'http://localhost/my-food-app/public/api'; 

const submitMessage = async () => {
  if (!form.value.name || !form.value.email || !form.value.message) {
      alert("សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!");
      return;
  }

  try {
    const res = await axios.post(`${API_URL}/submit-contact.php`, form.value);
    
    if (res.data.message === "Success") {
      showSuccessModal.value = true;
      form.value = { name: '', email: '', message: '' }; // Reset Form
      
      // បិទផ្ទាំងវិញដោយស្វ័យប្រវត្តិក្រោយ 4 វិនាទី
      setTimeout(() => {
        showSuccessModal.value = false;
      }, 4000);

    } else {
      alert("មានបញ្ហាក្នុងការផ្ញើ! សូមព្យាយាមម្តងទៀត។");
    }
  } catch (error) {
    console.error(error);
    alert("មានបញ្ហាប្រព័ន្ធ!");
  }
};
</script>

<template>
  <div>
    
    <div class="py-12 md:py-20 px-4 max-w-7xl mx-auto">
      
      <div class="text-center mb-16 space-y-4">
        <h1 class="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          ទាក់ទង<span class="text-orange-600">មកយើង</span>
        </h1>
        <p class="text-slate-500 text-lg max-w-2xl mx-auto">
          មានចម្ងល់ ឬត្រូវការជំនួយ? ក្រុមការងារ MyFood រង់ចាំបម្រើសេវាកម្មជូនលោកអ្នកគ្រប់ពេលវេលា
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="space-y-6 lg:col-span-1">
          <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 flex items-start gap-5 group">
            <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-lg mb-1">ទីតាំងហាង</h3>
              <p class="text-slate-500 text-sm leading-relaxed">
                ភូមិត្រពាំងស្លា ឃុំព្រៃទទឹង <br>ស្រុកបរសេដ្ខ ខេត្តស្មោះស្នេហ៍
              </p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 flex items-start gap-5 group">
            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-lg mb-1">លេខទំនាក់ទំនង</h3>
              <p class="text-slate-500 font-bold text-lg text-orange-600">099 999 333</p>
              <p class="text-slate-400 text-xs mt-1">រៀងរាល់ថ្ងៃ 7:00ព្រឹក - 9:00យប់</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 flex items-start gap-5 group">
            <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-lg mb-1">អ៊ីមែល</h3>
              <p class="text-slate-500 text-sm">Vue.js_group4@gmail.com</p>
              <p class="text-slate-500 text-sm">food_shop@mygmail.com</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-orange-100/50 border border-slate-100">
          <h3 class="text-2xl font-black text-slate-800 mb-6">ផ្ញើសារមកកាន់ពួកយើង</h3>
          
          <form @submit.prevent="submitMessage" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-2">ឈ្មោះរបស់អ្នក</label>
                <input v-model="form.name" type="text" placeholder="បញ្ចូលឈ្មោះ" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-slate-700" required>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-2">លេខទូរស័ព្ទ / អ៊ីមែល</label>
                <input v-model="form.email" type="text" placeholder="បញ្ចូលលេខទំនាក់ទំនង" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-slate-700" required>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-500 ml-2">សាររបស់អ្នក</label>
              <textarea v-model="form.message" rows="4" placeholder="សរសេរអ្វីដែលអ្នកចង់ប្រាប់យើង..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-slate-700 resize-none" required></textarea>
            </div>

            <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
              <span>ផ្ញើសារឥឡូវនេះ</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div 
        v-if="showSuccessModal" 
        class="fixed bottom-6 right-6 z-[50] flex items-end justify-end pointer-events-none"
      >
        <div class="bg-white border border-green-100 rounded-2xl shadow-2xl shadow-green-100 p-5 flex items-center gap-4 max-w-sm pointer-events-auto relative overflow-hidden">
            
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>

            <div class="bg-green-100 text-green-600 p-2 rounded-full flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>

            <div class="flex-grow">
                <h4 class="font-black text-slate-800 text-sm">ផ្ញើសារជោគជ័យ!</h4>
                <p class="text-slate-500 text-xs mt-0.5">ក្រុមការងារយើងនឹងតបត្រឡប់ឆាប់ៗនេះ។</p>
            </div>

            <button @click="showSuccessModal = false" class="text-slate-300 hover:text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>