import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const router = useRouter();

  // ==========================================
  // 🔥🔥🔥 កន្លែងកំណត់ ADMIN (SETTINGS) 🔥🔥🔥
  // ==========================================
  
  // 1. កំណត់លេខសម្ងាត់សម្រាប់ចូល Admin
  const ADMIN_CODE = "1234Admin##$$"; 

  // 2. កំណត់បញ្ជី Email ដែលជា Admin (ថែមឈ្មោះនៅទីនេះស្រួលជាង)
  const adminEmails = [
      'admin@gmail.com',
      'chanro7080@gmail.com',
      'mengpanha@gmail.com'  // ✅ ថែមឈ្មោះប៉ុន្មាននាក់ក៏បាន
  ];

  // Function ផ្ទៀងផ្ទាត់លេខសម្ងាត់ (សម្រាប់ AdminView)
  const verifyAdminPassword = (input) => {
      return input === ADMIN_CODE;
  }

  // ==========================================

  // 🔥 0. Listener
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

  // 🔥 6. Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error (Supabase):", error);
    } finally {
      user.value = null;
      localStorage.clear(); 
      window.location.href = '/login'; 
    }
  };

  // Getters
  const isAuthenticated = () => !!user.value;
  
  // 🔥 កែសម្រួល៖ ឆែកមើលថាតើ Email មានក្នុងបញ្ជី adminEmails ខាងលើដែរឬទេ?
  const isAdmin = () => {
      if (!user.value) return false;
      return user.value?.user_metadata?.role === 'admin' || 
             adminEmails.includes(user.value?.email);
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
    isAdmin,
    verifyAdminPassword // 🔥 កុំភ្លេច Return អាហ្នឹងផង
  };
});