import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MenuView from '../views/MenuView.vue';
import AboutView from '../views/AboutView.vue';
import ContactView from '../views/ContactView.vue';
import CartView from '../views/CartView.vue';
import AdminView from '../views/AdminView.vue';
import ReceiptView from '../views/ReceiptView.vue';
import HistoryView from '../views/HistoryView.vue';
import LoginView from '../views/LoginView.vue'; 
import ProfileView from '../views/ProfileView.vue'; // 🔥 1. Import ProfileView

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
    { path: '/login', name: 'login', component: LoginView },

    // 🔥 2. បន្ថែមផ្លូវ Profile (ចូលបានតែអ្នក Login រួច)
    { 
      path: '/profile', 
      name: 'profile', 
      component: ProfileView,
      beforeEnter: (to, from, next) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          next(); // មាន User -> ឱ្យចូល
        } else {
          next('/login'); // អត់មាន -> ទៅ Login
        }
      }
    },

    // 🔥 3. ការពារផ្លូវ Admin (ចូលបានតែ Admin)
    { 
      path: '/admin', 
      name: 'admin', 
      component: AdminView,
      beforeEnter: (to, from, next) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
          next(); 
        } else {
          alert("អ្នកគ្មានសិទ្ធិចូលកាន់កន្លែងនេះទេ!");
          next('/login'); 
        }
      }
    }, 
  ]
});

export default router;