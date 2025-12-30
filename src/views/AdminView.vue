<script setup>
import { ref } from 'vue';
import { useProductStore } from '../stores/products';
import { useBannerStore } from '../stores/banners';
import { useChefStore } from '../stores/chef';
import { useToastStore } from '../stores/toast'; 

const productStore = useProductStore();
const bannerStore = useBannerStore();
const chefStore = useChefStore();
const toast = useToastStore();

const activeTab = ref('products');
const isSubmitting = ref(false);

const productFileInput = ref(null);
const bannerFileInput = ref(null);
const chefFileInput = ref(null);

// ==============================
// 1. MENU BANNER LOGIC
// ==============================
const tempMenuBanner = ref(null); 
const bannerTitle = ref('');    
const bannerSubtitle = ref(''); 
const isEditingBanner = ref(false);
const editingBannerIndex = ref(null);

const handleAddMenuBanner = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
        toast.show('ឯកសារធំពេក! សូមដាក់ក្រោម 2MB។', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => tempMenuBanner.value = e.target.result;
    reader.readAsDataURL(file);
  }
};

const startEditBanner = (index, banner) => {
  isEditingBanner.value = true;
  editingBannerIndex.value = index;
  if (typeof banner === 'object') {
    tempMenuBanner.value = banner.image;
    bannerTitle.value = banner.title;
    bannerSubtitle.value = banner.subtitle;
  } else {
    tempMenuBanner.value = banner;
    bannerTitle.value = '';
    bannerSubtitle.value = '';
  }
  document.getElementById('menuBannerForm')?.scrollIntoView({ behavior: 'smooth' });
};

const cancelEditBanner = () => {
  isEditingBanner.value = false;
  editingBannerIndex.value = null;
  resetBannerForm();
};

const resetBannerForm = () => {
  tempMenuBanner.value = null;
  bannerTitle.value = '';
  bannerSubtitle.value = '';
  const input = document.getElementById('menuBannerInput');
  if(input) input.value = '';
}

const submitMenuBanner = () => {
    if (tempMenuBanner.value) {
        const bannerData = {
            image: tempMenuBanner.value,
            title: bannerTitle.value,
            subtitle: bannerSubtitle.value
        };
        let success = false;
        if (isEditingBanner.value) {
            success = bannerStore.updateMenuBanner(editingBannerIndex.value, bannerData);
            if (success) {
                toast.show('បានកែប្រែ Slide ជោគជ័យ!', 'success');
                cancelEditBanner();
            }
        } else {
            success = bannerStore.addMenuBanner(bannerData);
            if (success) {
                toast.show('បានបន្ថែម Slide ថ្មីជោគជ័យ!', 'success');
                resetBannerForm();
            }
        }
    }
};

// ==============================
// 2. CHEF LOGIC (🔥 កូដដែលបងប្រហែលជាខ្វះ)
// ==============================
const chefForm = ref({ name: '', bio: '', image: '' });
const isEditingChef = ref(false);
const editingChefIndex = ref(null);

const handleChefImageSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
        toast.show('រូបភាពធំពេក!', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => chefForm.value.image = e.target.result;
    reader.readAsDataURL(file);
  }
};

const startEditChef = (index, chef) => {
  isEditingChef.value = true;
  editingChefIndex.value = index;
  chefForm.value = { ...chef }; 
  document.getElementById('chefForm')?.scrollIntoView({ behavior: 'smooth' });
};

const cancelEditChef = () => {
  isEditingChef.value = false;
  editingChefIndex.value = null;
  resetChefForm();
};

const resetChefForm = () => {
  chefForm.value = { name: '', bio: '', image: '' };
  const input = document.getElementById('chefImageInput');
  if(input) input.value = '';
};

const submitChef = () => {
  if (!chefForm.value.name || !chefForm.value.image) {
      toast.show('សូមដាក់ឈ្មោះ និងរូបភាព!', 'error');
      return;
  }

  if (isEditingChef.value) {
      chefStore.updateChef(editingChefIndex.value, chefForm.value);
      toast.show('កែប្រែជោគជ័យ!', 'success');
      cancelEditChef();
  } else {
      chefStore.addChef(chefForm.value);
      toast.show('បន្ថែមជោគជ័យ!', 'success');
      resetChefForm();
  }
};

// ==============================
// 3. PRODUCT LOGIC
// ==============================
const showDeleteModal = ref(false);
const productIdToDelete = ref(null);
const isEditing = ref(false);
const editingId = ref(null);
const newProduct = ref({ title: '', price: '', category: 'ចៀន', image: '', desc: '' });
const defaultImage = 'https://via.placeholder.com/150?text=No+Image';

const formatPrice = (value) => {
  let val = parseFloat(value);
  if (!val && val !== 0) return '$0.00';
  if (val > 100) return new Intl.NumberFormat('km-KH').format(val) + ' ៛';
  return '$' + val.toFixed(2);
};

const handleProductUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = (e) => newProduct.value.image = e.target.result;
    reader.readAsDataURL(file);
  }
};

const handleProductSubmit = async () => {
  if (!newProduct.value.title) { toast.show('សូមបំពេញឈ្មោះម្ហូប!', 'error'); return; }
  isSubmitting.value = true;
  if (!newProduct.value.image) newProduct.value.image = defaultImage;
  const productPayload = { ...newProduct.value, price: parseFloat(newProduct.value.price) || 0 };
  try {
    if (isEditing.value) {
      await productStore.updateProduct({ id: editingId.value, ...productPayload });
      toast.show('កែប្រែទិន្នន័យជោគជ័យ!', 'success');
    } else {
      await productStore.addProduct(productPayload);
      toast.show('បន្ថែមម្ហូបថ្មីជោគជ័យ!', 'success');
    }
    cancelProductEdit();
  } catch (error) {
    toast.show('មានបញ្ហាក្នុងការរក្សាទុក!', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const startEdit = (food) => {
  isEditing.value = true;
  editingId.value = food.id;
  newProduct.value = { ...food, desc: food.desc || '' };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelProductEdit = () => {
  isEditing.value = false;
  editingId.value = null;
  newProduct.value = { title: '', price: '', category: 'ចៀន', image: '', desc: '' };
  if(productFileInput.value) productFileInput.value.value = '';
};

const initiateDelete = (id) => {
  productIdToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (productIdToDelete.value) {
    await productStore.deleteProduct(productIdToDelete.value);
    toast.show('បានលុបជោគជ័យ!', 'success');
    showDeleteModal.value = false;
    productIdToDelete.value = null;
  }
};

// ==============================
// 4. MAIN BANNER LOGIC
// ==============================
const newBannerImage = ref('');
const handleBannerUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = (e) => newBannerImage.value = e.target.result;
    reader.readAsDataURL(file);
  }
};
const addBanner = async () => {
  if(!newBannerImage.value) return;
  isSubmitting.value = true;
  try {
    await bannerStore.addBanner(newBannerImage.value);
    newBannerImage.value = '';
    if(bannerFileInput.value) bannerFileInput.value.value = '';
    toast.show('Upload Banner ជោគជ័យ!', 'success');
  } catch (error) {
    toast.show('បរាជ័យក្នុងការ Upload', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50/50 min-h-screen">
    
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
        
        <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
            <button @click="activeTab = 'products'" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all" :class="activeTab === 'products' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Products</button>
            <button @click="activeTab = 'banners'" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all" :class="activeTab === 'banners' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Banners</button>
            <button @click="activeTab = 'chef'" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all" :class="activeTab === 'chef' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'">Chef Info</button>
        </div>
    </div>

    <div v-if="activeTab === 'products'" class="flex flex-col xl:flex-row gap-8 items-start">
      <div class="w-full xl:w-[450px] flex-shrink-0 sticky top-6 z-10">
        <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100">
            <h2 class="font-black text-2xl mb-6 flex items-center gap-2 pb-4 border-b border-gray-100" :class="isEditing ? 'text-blue-600' : 'text-gray-800'">
               {{ isEditing ? ' កែប្រែ' : ' បន្ថែមថ្មី' }}
            </h2>
            <form @submit.prevent="handleProductSubmit" class="space-y-5">
                <div>
                    <label class="text-sm font-bold text-slate-600 mb-2 block ml-1">ឈ្មោះមុខម្ហូប</label>
                    <input v-model="newProduct.title" class="w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 text-base font-bold focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400" placeholder="ឧ. បាយឆា..." />
                </div>
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <label class="text-sm font-bold text-slate-600 mb-2 block ml-1">តម្លៃ ($)</label>
                        <input v-model="newProduct.price" type="number" step="any" class="w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 text-base font-bold focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none" />
                    </div>
                    <div class="w-1/2">
                        <label class="text-sm font-bold text-slate-600 mb-2 block ml-1">ប្រភេទ</label>
                        <select v-model="newProduct.category" class="w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 text-base font-bold focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none appearance-none">
                            <option>ចៀន</option><option>សម្ល</option><option>ឆា</option><option>គ្រឿងក្លែម</option><option>ភេសជ្ជៈ</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="text-sm font-bold text-slate-600 mb-2 block ml-1">ការរៀបរាប់</label>
                    <textarea v-model="newProduct.desc" rows="3" class="w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 text-base font-medium focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none resize-none" placeholder="សរសេរអំពីម្ហូប..."></textarea>
                </div>
                <div>
                    <label class="text-sm font-bold text-slate-600 mb-2 block ml-1">រូបភាព</label>
                    <div class="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl hover:bg-slate-50 hover:border-orange-400 transition-all h-32 flex flex-col items-center justify-center bg-white">
                        <input ref="productFileInput" type="file" @change="handleProductUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <img v-if="newProduct.image" :src="newProduct.image" class="absolute inset-0 w-full h-full object-cover rounded-2xl p-1" />
                        <div v-else class="text-center p-4">
                            <span class="text-2xl block mb-1 opacity-30"></span>
                            <span class="text-xs text-gray-400 font-bold uppercase tracking-widest">ចុចដើម្បីដាក់រូប</span>
                        </div>
                    </div>
                </div>
                <div class="pt-4 flex gap-3">
                    <button v-if="isEditing" type="button" @click="cancelProductEdit" class="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-base hover:bg-gray-200 transition-colors">បោះបង់</button>
                    <button type="submit" :disabled="isSubmitting" class="flex-[2] text-white py-3 rounded-2xl font-bold text-base shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                        :class="isEditing ? 'bg-blue-600 shadow-blue-200' : 'bg-orange-600 hover:bg-orange-700'">
                        {{ isEditing ? 'រក្សាទុក' : 'បញ្ចូល' }}
                    </button>
                </div>
            </form>
        </div>
      </div>
      <div class="w-full xl:flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 class="font-bold text-gray-800 text-xl">បញ្ជីមុខម្ហូប ({{ productStore.products.length }})</h3>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
            <thead class="bg-white text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                <tr>
                <th class="p-4 w-24 text-center">រូបភាព</th>
                <th class="p-4">ឈ្មោះ & ការរៀបរាប់</th>
                <th class="p-4 w-32">ប្រភេទ</th>
                <th class="p-4 w-32">តម្លៃ</th>
                <th class="p-4 w-32 text-center">សកម្មភាព</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                <tr v-for="food in productStore.products" :key="food.id" class="hover:bg-orange-50/30 transition-all group text-sm">
                <td class="p-4 text-center align-middle">
                    <img :src="food.image || defaultImage" class="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm" />
                </td>
                <td class="p-4 align-middle">
                    <p class="font-bold text-slate-800 text-base mb-1">{{ food.title }}</p>
                    <p class="text-xs text-gray-500 line-clamp-2">{{ food.desc || '-' }}</p>
                </td>
                <td class="p-4 align-middle">
                    <span class="inline-block text-xs bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-600 border border-gray-200">{{ food.category }}</span>
                </td>
                <td class="p-4 align-middle font-bold text-orange-600 text-base">
                    {{ formatPrice(food.price) }}
                </td>
                <td class="p-4 align-middle">
                    <div class="flex items-center justify-center gap-2">
                    <button @click="startEdit(food)" class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                    </button>
                    <button @click="initiateDelete(food.id)" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </button>
                    </div>
                </td>
                </tr>
            </tbody>
            </table>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'banners'" class="space-y-8 animate-fade-in max-w-5xl mx-auto mt-2">
       <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 class="font-black text-2xl mb-6 text-gray-800 border-b border-gray-100 pb-4">Main Slider (ទំព័រដើម)</h2>
          <div class="border-2 border-dashed border-gray-200 rounded-2xl p-4 mb-6 relative hover:border-blue-300 transition-colors cursor-pointer bg-slate-50 h-32 flex flex-col justify-center text-center">
             <input ref="bannerFileInput" type="file" @change="handleBannerUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
             <div class="flex flex-col items-center">
                <p class="font-bold text-gray-500 mb-2 text-lg">{{ newBannerImage ? 'បានជ្រើសរើសរូបភាព ' : 'ចុចទីនេះដើម្បី Upload Slide' }}</p>
                <img v-if="newBannerImage" :src="newBannerImage" class="h-20 rounded-xl shadow-sm object-cover" />
             </div>
          </div>
          <button @click="addBanner" :disabled="!newBannerImage || isSubmitting" class="w-full bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-base shadow-lg disabled:opacity-50 disabled:shadow-none transition-all">
             <span v-if="isSubmitting">កំពុង Upload...</span>
             <span v-else> បន្ថែមទៅក្នុង Slide</span>
          </button>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              <div v-for="(img, index) in bannerStore.banners" :key="index" class="relative group h-40 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <button @click="bannerStore.deleteBanner(index)" class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
          </div>
       </div>

       <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 class="font-black text-2xl mb-6 text-gray-800 border-b border-gray-100 pb-4">Menu Banner Slideshow</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                  <p class="text-base font-bold text-slate-500 mb-3">បញ្ជី Slide បច្ចុប្បន្ន ({{ bannerStore.menuBanners.length }})៖</p>
                  <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      <div 
                        v-for="(item, index) in bannerStore.menuBanners" 
                        :key="index" 
                        class="relative group rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-black" 
                        :class="{'ring-2 ring-blue-400': isEditingBanner && editingBannerIndex === index}"
                      >
                          <div class="w-full h-32 relative">
                              <video 
                                v-if="(typeof item === 'object' ? item.image : item).startsWith('data:video')" 
                                :src="typeof item === 'object' ? item.image : item" 
                                class="w-full h-full object-cover opacity-80" 
                                autoplay loop muted
                              ></video>
                              <img v-else :src="typeof item === 'object' ? item.image : item" class="w-full h-full object-cover opacity-80" />
                              <div v-if="typeof item === 'object'" class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent text-white">
                                  <h3 class="font-bold text-sm leading-tight">{{ item.title }}</h3>
                                  <p class="text-[10px] opacity-80 line-clamp-1">{{ item.subtitle }}</p>
                              </div>
                          </div>
                          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                            <button @click.stop="startEditBanner(index, item)" class="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transform cursor-pointer" title="កែប្រែ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                            </button>
                            <button @click.stop="bannerStore.removeMenuBanner(index)" class="bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transform cursor-pointer" title="លុប">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                          </div>
                      </div>
                      <div v-if="bannerStore.menuBanners.length === 0" class="text-center py-8 text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          មិនទាន់មាន Slide នៅឡើយទេ
                      </div>
                  </div>
              </div>
              <div id="menuBannerForm">
                  <p class="text-base font-bold text-slate-500 mb-3">
                    {{ isEditingBanner ? 'កែប្រែ Slide៖' : 'បន្ថែម Slide ថ្មី៖' }}
                  </p>
                  <div class="bg-slate-50 p-6 rounded-3xl border border-gray-200" :class="{'border-blue-300 shadow-md': isEditingBanner}">
                      <div class="border-2 border-dashed border-gray-300 rounded-2xl mb-4 cursor-pointer hover:bg-white hover:border-blue-400 transition-all relative h-32 flex items-center justify-center overflow-hidden bg-white shadow-sm group">
                          <input id="menuBannerInput" type="file" accept="image/*,video/*" @change="handleAddMenuBanner" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div v-if="!tempMenuBanner" class="text-gray-400 flex flex-col items-center group-hover:text-blue-500 transition-colors">
                              <span class="text-2xl block mb-2"></span>
                              <span class="font-bold text-sm">ចុចដាក់រូប/វីដេអូ</span>
                          </div>
                          <div v-else class="w-full h-full relative bg-black">
                              <video v-if="tempMenuBanner.startsWith('data:video')" :src="tempMenuBanner" class="w-full h-full object-contain" autoplay loop muted></video>
                              <img v-else :src="tempMenuBanner" class="w-full h-full object-contain" />
                          </div>
                      </div>
                      <div class="mb-3">
                          <label class="text-sm font-bold text-slate-600 mb-1 block">ចំណងជើង (Title)</label>
                          <input v-model="bannerTitle" type="text" placeholder="ឧ. Happy Hour 50%" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-400 font-bold text-sm" />
                      </div>
                      <div class="mb-5">
                          <label class="text-sm font-bold text-slate-600 mb-1 block">ការរៀបរាប់ (Subtitle)</label>
                          <textarea v-model="bannerSubtitle" rows="2" placeholder="ឧ. បញ្ចុះតម្លៃពិសេសសម្រាប់ថ្ងៃនេះ..." class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-400 font-medium text-sm"></textarea>
                      </div>
                      <div class="flex gap-3">
                        <button v-if="isEditingBanner" @click="cancelEditBanner" class="flex-1 py-3 rounded-2xl font-bold text-base bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all">បោះបង់</button>
                        <button @click="submitMenuBanner" :disabled="!tempMenuBanner" class="flex-[2] py-3 rounded-2xl font-bold text-base shadow-lg transition-all transform active:scale-95" :class="tempMenuBanner ? (isEditingBanner ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200 text-white') : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'">{{ isEditingBanner ? '💾 រក្សាទុក' : '📥 បញ្ចូល' }}</button>
                      </div>
                  </div>
              </div>
          </div>
       </div>
    </div>

    <div v-else-if="activeTab === 'chef'" class="space-y-8 animate-fade-in max-w-5xl mx-auto mt-2">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 class="font-black text-2xl mb-6 text-gray-800 border-b border-gray-100 pb-4">
           👨‍🍳 Chef Slideshow Management
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            <div>
                <p class="text-base font-bold text-slate-500 mb-3">បញ្ជីចុងភៅបច្ចុប្បន្ន ({{ chefStore.chefs.length }})៖</p>
                <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div 
                        v-for="(chef, index) in chefStore.chefs" 
                        :key="index" 
                        class="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white flex items-center p-3 gap-4"
                        :class="{'ring-2 ring-green-400 bg-green-50': isEditingChef && editingChefIndex === index}"
                    >
                        <img :src="chef.image" class="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                        <div class="flex-1 overflow-hidden">
                            <h3 class="font-bold text-slate-800 truncate">{{ chef.name }}</h3>
                            <p class="text-xs text-slate-500 line-clamp-2">{{ chef.bio }}</p>
                        </div>
                        <div class="flex flex-col gap-2">
                            <button @click="startEditChef(index, chef)" class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                            </button>
                            <button @click="chefStore.removeChef(index)" class="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                        </div>
                    </div>
                    <div v-if="chefStore.chefs.length === 0" class="text-center py-8 text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        មិនទាន់មានទិន្នន័យចុងភៅទេ
                    </div>
                </div>
            </div>

            <div id="chefForm">
                <p class="text-base font-bold text-slate-500 mb-3">
                  {{ isEditingChef ? 'កែប្រែព័ត៌មាន៖' : 'បន្ថែមចុងភៅថ្មី៖' }}
                </p>
                <div class="bg-slate-50 p-6 rounded-3xl border border-gray-200" :class="{'border-green-300 shadow-md': isEditingChef}">
                    <div class="border-2 border-dashed border-gray-300 rounded-2xl mb-4 cursor-pointer hover:bg-white hover:border-green-400 transition-all relative h-32 flex items-center justify-center overflow-hidden bg-white shadow-sm group">
                        <input id="chefImageInput" type="file" accept="image/*" @change="handleChefImageSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div v-if="!chefForm.image" class="text-gray-400 flex flex-col items-center group-hover:text-green-500 transition-colors">
                            <span class="text-2xl block mb-2"></span>
                            <span class="font-bold text-sm">ដាក់រូបចុងភៅ</span>
                        </div>
                        <img v-else :src="chefForm.image" class="w-full h-full object-cover" />
                    </div>
                    <div class="mb-3">
                        <label class="text-sm font-bold text-slate-600 mb-1 block">ឈ្មោះ (Name)</label>
                        <input v-model="chefForm.name" type="text" placeholder="ឧ. Master Chef Dara" class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 font-bold text-sm" />
                    </div>
                    <div class="mb-5">
                        <label class="text-sm font-bold text-slate-600 mb-1 block">ប្រវត្តិ/ជំនាញ (Bio)</label>
                        <textarea v-model="chefForm.bio" rows="3" placeholder="ឧ. មានបទពិសោធន៍ ១០ឆ្នាំ ផ្នែកម្ហូបអឺរ៉ុប..." class="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 font-medium text-sm"></textarea>
                    </div>
                    <div class="flex gap-3">
                      <button v-if="isEditingChef" @click="cancelEditChef" class="flex-1 py-3 rounded-2xl font-bold text-base bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all">បោះបង់</button>
                      <button @click="submitChef" :disabled="!chefForm.image || !chefForm.name" class="flex-[2] py-3 rounded-2xl font-bold text-base shadow-lg transition-all transform active:scale-95" :class="chefForm.image ? (isEditingChef ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white' : 'bg-green-600 hover:bg-green-700 shadow-green-200 text-white') : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'">{{ isEditingChef ? '💾 រក្សាទុក' : '📥 បញ្ចូលបញ្ជី' }}</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center transform transition-all scale-100">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            </div>
            <h3 class="text-xl font-black text-gray-800 mb-2">លុបមុខម្ហូបនេះ?</h3>
            <p class="text-gray-500 text-sm mb-8">ទិន្នន័យនឹងបាត់ជារៀងរហូត។</p>
            <div class="flex gap-4">
                <button @click="showDeleteModal = false" class="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 text-sm">បោះបង់</button>
                <button @click="confirmDelete" class="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 text-sm">លុបចេញ</button>
            </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>