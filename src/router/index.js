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
import ForgotPasswordView from '../views/ForgotPasswordView.vue'; // 🔥 បន្ថែមថ្មី
import UpdatePasswordView from '../views/UpdatePasswordView.vue'; // 🔥 បន្ថែមថ្មី

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
      meta: { requiresAuth: true } // ដាក់សម្គាល់ថាត្រូវការ Login
    },

    // 🔥 3. Admin (ត្រូវការ Login + ជា Admin)
    { 
      path: '/admin', 
      name: 'admin', 
      component: AdminView,
      meta: { requiresAdmin: true } // ដាក់សម្គាល់ថាត្រូវការ Admin
    }, 
  ]
});

// 🔥 4. Global Guard (អ្នកយាមផ្លូវ)
// កូដនេះនឹងដំណើរការរាល់ពេលបងចុចប្តូរទំព័រ
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // ពេល Refresh ទំព័រ ដំបូង Store អាចនឹងទទេ ដូច្នេះត្រូវ LoadUser សិន
  if (!authStore.user) {
    await authStore.loadUser();
  }

  // ករណីផ្លូវត្រូវការ Login (requiresAuth)
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    return next('/login');
  }

  // ករណីផ្លូវត្រូវការ Admin (requiresAdmin)
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated()) {
       return next('/login');
    }
    if (!authStore.isAdmin()) {
       alert("អ្នកគ្មានសិទ្ធិចូលកាន់កន្លែងនេះទេ! (Admin Only)");
       return next('/');
    }
  }

  // បើគ្រប់យ៉ាងត្រឹមត្រូវ ឱ្យទៅមុខ
  next();
});

export default router;