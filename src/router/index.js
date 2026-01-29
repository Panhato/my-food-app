import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth'; 

// Views (រក្សានៅដដែល)
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

    // 👤 Profile (ត្រូវការ Login)
    { 
      path: '/profile', 
      name: 'profile', 
      component: ProfileView,
      meta: { requiresAuth: true } 
    },

    // 🛡️ Admin (ត្រូវការ Login + ជា Admin ពិតប្រាកដ)
    { 
      path: '/admin', 
      name: 'admin', 
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true } 
    }, 
  ]
});

// 👮 Global Guard (អ្នកយាមផ្លូវ)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // ១. ទាញទិន្នន័យ User បើមិនទាន់មាន (Session Persistence)
  if (!authStore.user) {
    await authStore.loadUser();
  }

  // ២. បើផ្លូវនោះត្រូវការ Login តែគាត់មិនទាន់ Login ទេ -> បញ្ជូនទៅទំព័រ Login
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    return next('/login');
  }

  // ៣. បើផ្លូវនោះសម្រាប់តែ Admin តែគាត់មិនមែនជា Admin ក្នុងបញ្ជីទេ
  if (to.meta.requiresAdmin) {
    // ឆែក Email ក្នុងបញ្ជី adminEmails ពី auth.js
    if (!authStore.isAdmin()) {
      alert("សូមអភ័យទោស! អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ។ (Admin Only)");
      return next('/'); // ដេញទៅទំព័រដើម
    }
  }

  next(); // អនុញ្ញាតឱ្យទៅមុខ
});

export default router;