import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const router = useRouter();

  // 🔥 0. Listener: ចាំចាប់ការផ្លាស់ប្តូរស្ថានភាព User (សំខាន់សម្រាប់ Password Reset)
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      user.value = session.user;
    } else {
      user.value = null;
    }
  });

  // 🔥 1. Load User ពេល Refresh
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

  // 🔥 3. Register (កែសម្រួលឱ្យ Auto Login)
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

    // ✨ បន្ថែមថ្មី៖ បើ Supabase បោះ Session មក (មានន័យថាបានបិទ Confirm Email ហើយ)
    // យើងដាក់ User ចូល State តែម្តង ដើម្បីកុំឱ្យគេ Login ម្តងទៀត
    if (data.session) {
      user.value = data.user;
    }

    return true;
  };

  // 🔥 4. Update Profile & Password
  const updateProfile = async (updates) => {
    let payload = {};

    if (updates.password) {
        payload = { password: updates.password };
    } else {
        payload = { data: updates };
    }

    const { data, error } = await supabase.auth.updateUser(payload);

    if (error) throw error;
    // user.value = data.user; // មិនបាច់ដាក់ក៏បាន onAuthStateChange ធ្វើឱ្យហើយ
    return true;
  };

  // 🔥 5. Reset Password (ភ្លេចពាក្យសម្ងាត់)
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
    await supabase.auth.signOut();
    user.value = null;
    window.location.reload(); 
  };

  // Getters
  const isAuthenticated = () => !!user.value;
  
  const isAdmin = () => {
      return user.value?.user_metadata?.role === 'admin' || user.value?.email === 'admin@gmail.com';
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