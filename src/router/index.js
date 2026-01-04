import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // 🔥 1. Import Auth Store

// Views
import HomeView from '../views/HomeView.vue';
import MenuView from '../views/MenuView.vue';
import AboutView from '../views/AboutView.vue';
import ContactView from '../views/ContactView.vue';
import CartView from '../views/CartView.vue';
import AdminView from '../views/AdminView.vue';
import ReceiptView from '../views/ReceiptView.vue';
import HistoryView from '../views/HistoryView.vue';
import LoginView from '../views/LoginView.vue'; 
import ProfileView from '../views/ProfileView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue'; 
import UpdatePasswordView from '../views/UpdatePasswordView.vue'; 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/menu', name: 'menu', component: MenuView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/receipt', name: 'receipt', component: ReceiptView },
    { path: '/history', name: 'history', component: HistoryView },
    
    // Auth Routes
    { path: '/login', name: 'login', component: LoginView },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/update-password', name: 'update-password', component: UpdatePasswordView },

    // 🔥 2. Profile (ត្រូវការ Login)
    { 
      path: '/profile', 
      name: 'profile', 
      component: ProfileView,
      meta: { requiresAuth: true } 
    },

    // 🔥 3. Admin (ត្រូវការ Login + ជា Admin)
    { 
      path: '/admin', 
      name: 'admin', 
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true } // ដាក់ទាំងពីរដើម្បីសុវត្ថិភាព
    }, 
  ]
});

// 🔥 4. Global Guard (អ្នកយាមផ្លូវ)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // ជំហានទី ១: ឆែកមើលថាមាន User នៅ? បើអត់មាន សាក Load ពី Supabase
  if (!authStore.user) {
    await authStore.loadUser();
  }

  // ជំហានទី ២: ការពារផ្លូវដែលត្រូវការ Login (General Auth)
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    // បើមិនទាន់ Login -> បញ្ជូនទៅទំព័រ Login
    return next('/login');
  }

  // ជំហានទី ៣: ការពារផ្លូវ Admin (Admin Only)
  if (to.meta.requiresAdmin) {
    // ដោយសារយើងដាក់ requiresAuth ខាងលើហើយ មិនបាច់ឆែក isAuthenticated ម្តងទៀតទេ
    // គ្រាន់តែឆែកថាជា Admin ឬអត់?
    if (!authStore.isAdmin()) {
       alert("សូមអភ័យទោស! អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ។ (Admin Only)");
       return next('/'); // បើមិនមែន Admin ឱ្យទៅផ្ទះវិញ
    }
  }

  // បើគ្មានបញ្ហា ឱ្យទៅមុខ
  next();
});

export default router;