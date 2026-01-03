import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const router = useRouter();

  // 🔥 1. មុខងារទាញយក User ពេល Refresh វេបសាយ
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
    user.value = data.user;
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
    user.value = data.user;
    return true;
  };

  // 🔥 4. Update Profile & Password (កែសម្រួលថ្មី)
  const updateProfile = async (updates) => {
    let payload = {};

    // ប្រសិនបើមាន Password យើងដាក់វាផ្ទាល់ (កុំដាក់ក្នុង data)
    if (updates.password) {
        payload = { password: updates.password };
    } else {
        // ប្រសិនបើជាព័ត៌មានផ្សេងៗ (ឈ្មោះ, រូបភាព) ដាក់ចូល data
        payload = { data: updates };
    }

    const { data, error } = await supabase.auth.updateUser(payload);

    if (error) throw error;
    user.value = data.user; 
    return true;
  };

  // 🔥 5. មុខងារស្នើសុំដូរលេខកូដ (ភ្លេចពាក្យសម្ងាត់) - បន្ថែមថ្មី
  const resetPasswordEmail = async (email) => {
    // ត្រូវប្រាកដថា URL នេះត្រូវនឹង URL របស់បង (localhost ឬ domain ពិត)
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
    resetPasswordEmail, // 🔥 កុំភ្លេច return ចេញទៅក្រៅ
    isAuthenticated, 
    isAdmin 
  };
});