<script setup>
import { ref } from 'vue';

// ព័ត៌មានហាងបងអាចកែប្រែនៅទីនេះ
const shopInfo = ref({
  name: "MyFood Delivery",
  tagline: "រសជាតិពិត គុណភាពខ្ពស់ សេវាកម្មរហ័ស",
  story: "MyFood Delivery ចាប់ផ្ដើមចេញពីក្ដីស្រឡាញ់ក្នុងការចម្អិនអាហារបែបខ្មែរ និងអន្តរជាតិ។ យើងជឿជាក់ថា អាហារដែលល្អ មិនត្រឹមតែមានរសជាតិឆ្ងាញ់ប៉ុណ្ណោះទេ ប៉ុន្តែត្រូវមានអនាម័យ និងភាពស្រស់ថ្មីជានិច្ច។",
  mission: "ផ្ដល់ជូនបទពិសោធន៍អាហារដ៏អស្ចារ្យដល់គេហដ្ឋានលោកអ្នក ក្នុងតម្លៃសមរម្យបំផុត។",
  address: "រាជធានីភ្នំពេញ, ប្រទេសកម្ពុជា",
  phone: "098 765 432",
  email: "support@myfood.com"
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    
    <div class="relative h-[400px] flex items-center justify-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" 
           class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      
      <div class="relative z-10 text-center px-6">
        <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            {{ shopInfo.name }}
        </h1>
        <p class="text-orange-400 text-xl md:text-2xl font-bold tracking-widest uppercase">
            {{ shopInfo.tagline }}
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto py-20 px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
        <div class="space-y-8">
          <div>
            <h2 class="text-3xl font-black text-slate-800 mb-4 border-b-4 border-orange-500 inline-block">ប្រវត្តិហាងរបស់យើង</h2>
            <p class="text-slate-600 leading-relaxed text-lg mt-4">
              {{ shopInfo.story }}
            </p>
          </div>
          
          <div class="bg-orange-50 p-8 rounded-[32px] border-l-8 border-orange-500">
            <h3 class="text-xl font-black text-orange-600 mb-2 uppercase italic">បេសកកម្មរបស់យើង</h3>
            <p class="text-slate-700 font-medium leading-relaxed">
              " {{ shopInfo.mission }} "
            </p>
          </div>
        </div>

        <div class="relative">
          <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070" 
               class="rounded-[48px] shadow-2xl shadow-orange-100 rotate-2 hover:rotate-0 transition-all duration-500" />
          <div class="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl hidden md:block border">
            <p class="text-orange-500 font-black text-4xl">100%</p>
            <p class="text-slate-500 font-bold text-xs uppercase">អនាម័យជានិច្ច</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-slate-50 p-10 rounded-[40px] text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100">
          <div class="text-4xl mb-4">📍</div>
          <h4 class="font-black text-slate-800 mb-2">អាសយដ្ឋាន</h4>
          <p class="text-slate-500 text-sm font-medium">{{ shopInfo.address }}</p>
        </div>

        <div class="bg-slate-50 p-10 rounded-[40px] text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100">
          <div class="text-4xl mb-4">📞</div>
          <h4 class="font-black text-slate-800 mb-2">លេខទូរស័ព្ទ</h4>
          <p class="text-slate-500 text-sm font-medium">{{ shopInfo.phone }}</p>
        </div>

        <div class="bg-slate-50 p-10 rounded-[40px] text-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100">
          <div class="text-4xl mb-4">📧</div>
          <h4 class="font-black text-slate-800 mb-2">អ៊ីមែល</h4>
          <p class="text-slate-500 text-sm font-medium">{{ shopInfo.email }}</p>
        </div>
      </div>
    </div>

    <div class="bg-slate-900 py-12 text-center">
        <p class="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">សូមអរគុណសម្រាប់ការគាំទ្រ MyFood Delivery</p>
    </div>
  </div>
</template>

<style scoped>
/* បងអាចបន្ថែម Font ខ្មែរដែលបងពេញចិត្តនៅទីនេះ */
</style>