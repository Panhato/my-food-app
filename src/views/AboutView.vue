<template>
  <div class="max-w-6xl mx-auto px-4 py-16 font-sans">
    <div class="flex flex-col md:flex-row items-center gap-12 bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-50">
      <div class="md:w-1/2 h-[400px] relative">
        <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800" 
             class="w-full h-full object-cover" alt="Chef Cooking" />
        <div class="absolute inset-0 bg-orange-600/10"></div>
      </div>

      <div class="md:w-1/2 p-10 md:pr-16">
        <span class="text-orange-600 font-bold tracking-widest uppercase text-sm">About MyFood</span>
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-800 mt-4 mb-6 leading-tight">
          រសជាតិខ្មែរពិត <span class="text-orange-600">អនាម័យខ្ពស់</span> គុណភាពដែលអ្នកទុកចិត្ត
        </h1>
        <p class="text-gray-600 text-lg leading-relaxed mb-8">
          យើងសម្រិតសម្រាំងរាល់គ្រឿងផ្សំ ដើម្បីផ្ដល់ជូនលោកអ្នកនូវអាហារដែលស្រស់ស្អាត ឆ្ងាញ់ និងមានសុវត្ថិភាពបំផុតសម្រាប់ក្រុមគ្រួសាររបស់លោកអ្នក
        </p>
        <div class="grid grid-cols-2 gap-6 border-t pt-8">
          <div>
            <p class="text-2xl font-bold text-orange-600">100%</p>
            <p class="text-sm text-gray-500 font-bold uppercase">Natural Ingredients</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-600">24/7</p>
            <p class="text-sm text-gray-500 font-bold uppercase">Fast Delivery</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>