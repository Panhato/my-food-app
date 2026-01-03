<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase'; 

// 🔥 Credentials
const TG_BOT_TOKEN = '8253458210:AAG2bggWcLeBEuhwyW0pTMJf0q_dLic6124'; 
const TG_CHAT_ID = '7309869072';

const form = ref({
  name: '',
  email: '', 
  message: ''
});

const showSuccessModal = ref(false);
const isLoading = ref(false);

// មុខងារផ្ញើទៅ Telegram
const sendToTelegram = async (data) => {
  const text = `
📩 <b>សារថ្មី (Contact Us)</b>
--------------------------------
👤 <b>ឈ្មោះ:</b> ${data.name}
📞 <b>ទំនាក់ទំនង:</b> ${data.email}
💬 <b>សារ:</b> ${data.message}
--------------------------------
⏰ <i>${new Date().toLocaleString('km-KH')}</i>
  `;

  try {
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Telegram Error:', error);
  }
};

// មុខងាររក្សាទុកចូល Supabase
const saveToSupabase = async (data) => {
    try {
        const { error } = await supabase.from('contacts').insert([
          {
            name: data.name,
            contact_info: data.email,
            message: data.message
          }
        ]);
        if (error) console.warn("Supabase Error:", error.message);
    } catch (err) {
        console.warn("Supabase skipped:", err);
    }
};

const submitMessage = async () => {
  if (!form.value.name || !form.value.email || !form.value.message) {
      alert("សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!");
      return;
  }

  isLoading.value = true;

  try {
    // 1. ផ្ញើទៅ Telegram
    await sendToTelegram(form.value);

    // 2. រក្សាទុកក្នុង Database
    await saveToSupabase(form.value);

    // 3. បង្ហាញជោគជ័យ
    showSuccessModal.value = true;
    form.value = { name: '', email: '', message: '' }; // Reset Form
    
    setTimeout(() => {
      showSuccessModal.value = false;
    }, 4000);

  } catch (err) {
    console.error(err);
    alert("មានបញ្ហាប្រព័ន្ធ! សូមព្យាយាមម្តងទៀត។");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
    
    <div class="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
      
      <div class="md:w-5/12 bg-gradient-to-br from-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
        
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

        <div class="relative z-10">
          <h2 class="text-3xl font-black tracking-tight mb-2">MyFood Delivery</h2>
          <p class="text-orange-100 text-sm leading-relaxed">
            ម្ហូបឆ្ងាញ់ សេវាកម្មរហ័សទាន់ចិត្ត! មានបញ្ហា ឬសំណូមពរ សូមទាក់ទងមកយើងឥឡូវនេះ។
          </p>
        </div>

        <div class="space-y-8 mt-12 md:mt-0 relative z-10">
          
          <div class="flex items-start gap-4 group">
            <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">អាស័យដ្ឋាន</h3>
              <p class="text-orange-100 text-sm">ស្រុកបរសេដ្ខ ខេត្តកំពង់ស្ពឺ</p>
            </div>
          </div>

          <div class="flex items-start gap-4 group">
            <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">ទូរស័ព្ទ</h3>
              <p class="text-orange-100 text-sm font-mono tracking-wider font-bold">099 999 333</p>
            </div>
          </div>

          <div class="flex items-start gap-4 group">
            <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">អ៊ីមែល</h3>
              <p class="text-orange-100 text-sm">food_shop@gmail.com</p>
            </div>
          </div>
        </div>

        <div class="mt-12 md:mt-0 pt-6 border-t border-white/20 relative z-10">
          <p class="text-xs text-orange-200 text-center md:text-left">
            © 2026 MyFood Delivery. រក្សាសិទ្ធិគ្រប់យ៉ាង.
          </p>
        </div>
      </div>

      <div class="md:w-7/12 p-8 md:p-12 bg-white">
        <div class="mb-8">
            <h3 class="text-2xl font-black text-slate-800 mb-2">ផ្ញើសារមកកាន់ពួកយើង 👋</h3>
            <p class="text-slate-500 text-sm">សូមបំពេញព័ត៌មានខាងក្រោម យើងនឹងតបត្រឡប់ក្នុងរយៈពេល ២៤ម៉ោង។</p>
        </div>

        <form @submit.prevent="submitMessage" class="space-y-6">
          
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">ឈ្មោះរបស់អ្នក</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-400 group-focus-within:text-orange-500 transition-colors">👤</span>
              </div>
              <input v-model="form.name" type="text" placeholder="ឧ. ម៉េង បញ្ញា" 
                class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">លេខទូរស័ព្ទ ឬ អ៊ីមែល</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-400 group-focus-within:text-orange-500 transition-colors">📞</span>
              </div>
              <input v-model="form.email" type="text" placeholder="ឧ. 012 345 678" 
                class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 font-medium placeholder:text-slate-400"
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">សាររបស់អ្នក</label>
            <div class="relative group">
              <div class="absolute top-3.5 left-4 pointer-events-none">
                <span class="text-gray-400 group-focus-within:text-orange-500 transition-colors">💬</span>
              </div>
              <textarea v-model="form.message" rows="4" placeholder="តើអ្នកចង់ប្រាប់អ្វីដល់ពួកយើង?" 
                class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 font-medium resize-none placeholder:text-slate-400"
                required
              ></textarea>
            </div>
          </div>

          <button type="submit" :disabled="isLoading" 
            class="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2">
            <span v-if="isLoading">កំពុងផ្ញើ...</span>
            <span v-else>ផ្ញើសារឥឡូវនេះ</span>
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

        </form>
      </div>

    </div>

    <Transition name="slide-fade">
      <div v-if="showSuccessModal" class="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-green-500 rounded-xl shadow-2xl p-4 flex items-center gap-4 pr-10">
        <div class="text-green-500 bg-green-50 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 class="font-bold text-slate-800">ជោគជ័យ!</h4>
          <p class="text-xs text-slate-500 mt-0.5">សាររបស់អ្នកត្រូវបានផ្ញើរួចរាល់។</p>
        </div>
        <button @click="showSuccessModal = false" class="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Custom Transition for Toast */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px) translateY(10px);
  opacity: 0;
}
</style>