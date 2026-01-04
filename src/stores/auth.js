import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const router = useRouter();

  // 🔥 0. Listener: ចាំចាប់ការផ្លាស់ប្តូរស្ថានភាព User
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      user.value = session.user;
    } else {
      user.value = null;
    }
  });

  // 🔥 1. Load User
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      user.value = data.user;
    }
  };

  // 🔥 2. Login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;
    return true;
  };

  // 🔥 3. Register
  const register = async (email, password, username, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { 
            username: username, 
            phone: phone,
            role: 'user', 
            avatar: null
        }
      }
    });

    if (error) throw error;

    // Auto Login ប្រសិនបើ Supabase បិទ Confirm Email
    if (data.session) {
      user.value = data.user;
    }

    return true;
  };

  // 🔥 4. Update Profile
  const updateProfile = async (updates) => {
    let payload = {};

    if (updates.password) {
        payload = { password: updates.password };
    } else {
        payload = { data: updates };
    }

    const { data, error } = await supabase.auth.updateUser(payload);

    if (error) throw error;
    
    // ✨ សំខាន់៖ ដាក់ User ចូល State ភ្លាមៗ ដើម្បីឱ្យ ProfileView បង្ហាញទិន្នន័យថ្មីភ្លាម
    if (data.user) {
        user.value = data.user;
    }
    
    return true;
  };

  // 🔥 5. Reset Password
  const resetPasswordEmail = async (email) => {
    const redirectUrl = window.location.origin + '/update-password';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl, 
    });
    
    if (error) throw error;
    return true;
  };

  // 🔥 6. Logout (Robust Logout - ការពារបញ្ហា Antivirus)
  const logout = async () => {
    try {
      // ព្យាយាមប្រាប់ Supabase ឱ្យ Logout
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error (Supabase):", error);
    } finally {
      // ដំណើរការជានិច្ច ទោះបី Supabase ឆ្លើយតប ឬអត់
      user.value = null;
      localStorage.clear(); 
      window.location.href = '/login'; 
    }
  };

  // Getters
  const isAuthenticated = () => !!user.value;
  
  // 🔥 កែសម្រួល៖ បន្ថែម Email របស់បងដើម្បីឱ្យក្លាយជា Admin
  const isAdmin = () => {
      return user.value?.user_metadata?.role === 'admin' || 
             user.value?.email === 'admin@gmail.com' ||
             user.value?.email === 'saopanha933@gmail.com'; // ✅ បន្ថែមឈ្មោះបងនៅទីនេះ
  };

  return { 
    user, 
    loadUser, 
    login, 
    register, 
    logout, 
    updateProfile,
    resetPasswordEmail, 
    isAuthenticated, 
    isAdmin 
  };
});