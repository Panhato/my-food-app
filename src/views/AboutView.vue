<script setup>
import { ref } from 'vue';

// កំណត់ព័ត៌មានហាងនៅទីនេះ (Static Content)
const shopDescription = ref({
  name: "MyFood Delivery",
  story: "ហាងរបស់យើងត្រូវបានបង្កើតឡើងក្នុងឆ្នាំ ២០២៦ ក្នុងគោលបំណងផ្តល់ជូននូវអាហារដែលមានរសជាតិឆ្ងាញ់ និងអនាម័យខ្ពស់បំផុតជូនដល់អតិថិជន។",
  mission: "បេសកកម្មរបស់យើងគឺនាំយកអាហារក្តៅៗ និងឆ្ងាញ់ៗដល់ដៃលោកអ្នកក្នុងរយៈពេលដ៏ខ្លីបំផុត។",
  address: "រាជធានីភ្នំពេញ, ប្រទេសកម្ពុជា",
  phone: "098 765 432"
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="relative h-64 md:h-96 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070" 
           class="w-full h-full object-cover" alt="Shop Banner">
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 class="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
            អំពីយើង (About Us)
        </h1>
      </div>
    </div>

    <div class="max-w-4xl mx-auto py-16 px-6">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-black text-slate-800 mb-4">{{ shopDescription.name }}</h2>
        <div class="w-20 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <h3 class="text-xl font-bold text-slate-800 border-l-4 border-orange-500 pl-4">ប្រវត្តិហាង</h3>
          <p class="text-slate-600 leading-relaxed text-lg">
            {{ shopDescription.story }}
          </p>
          
          <h3 class="text-xl font-bold text-slate-800 border-l-4 border-orange-500 pl-4">គោលដៅរបស់យើង</h3>
          <p class="text-slate-600 leading-relaxed text-lg">
            {{ shopDescription.mission }}
          </p>
        </div>

        <div class="bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 class="text-xl font-bold text-slate-800 mb-6 text-center underline">ព័ត៌មានទំនាក់ទំនង</h3>
          <ul class="space-y-4 font-medium text-slate-600">
            <li class="flex items-center gap-3">📍 ទីតាំង៖ {{ shopDescription.address }}</li>
            <li class="flex items-center gap-3">📞 ទូរស័ព្ទ៖ {{ shopDescription.phone }}</li>
            <li class="flex items-center gap-3">📧 អ៊ីមែល៖ info@myfood.com</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>