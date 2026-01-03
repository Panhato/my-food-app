import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; // 🔥 1. Import Supabase

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const router = useRouter();

  // 🔥 2. មុខងារទាញយក User ពេល Refresh វេបសាយ (កុំឱ្យដាច់ Login)
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      user.value = data.user;
    }
  };

  // 🔥 3. Login ជាមួយ Supabase
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error; // បោះ Error ទៅឱ្យ LoginView ចាប់
    user.value = data.user;
    return true;
  };

  // 🔥 4. Register ជាមួយ Supabase
  const register = async (email, password, username, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // ដាក់ព័ត៌មានបន្ថែមក្នុង User Metadata
        data: { 
            username: username, 
            phone: phone,
            role: 'user', // Default role
            avatar: null
        }
      }
    });

    if (error) throw error;
    user.value = data.user;
    return true;
  };

  // 🔥 5. Update Profile (ឈ្មោះ, រូបភាព, លេខទូរស័ព្ទ)
  const updateProfile = async (updatedInfo) => {
    // updatedInfo គួរតែជា object ដូចជា { username: 'New Name', phone: '012...' }
    const { data, error } = await supabase.auth.updateUser({
      data: updatedInfo
    });

    if (error) throw error;
    user.value = data.user; // Update state ក្នុង store ភ្លាមៗ
    return true;
  };

  // 🔥 6. Logout
  const logout = async () => {
    await supabase.auth.signOut();
    user.value = null;
    // Refresh ទំព័រដើម្បី Clear ទិន្នន័យចាស់ៗចោល
    window.location.reload(); 
  };

  // Getters
  const isAuthenticated = () => !!user.value;
  
  // ពិនិត្យមើល Role ឬ Email ថាជា Admin ឬអត់
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
    isAuthenticated, 
    isAdmin 
  };
});