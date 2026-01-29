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
  
  // 1. កំណត់លេខសម្ងាត់សម្រាប់ដោះសោរទំព័រ Admin
  const ADMIN_CODE = "#1234Admin#$$$"; 

// 2. បញ្ជី Email ដែលមានសិទ្ធិចូលប្រើមុខងារ Admin
  const adminEmails = [
      'admin@gmail.com',
      'chanro7080@gmail.com',
      'mengpanha@gmail.com',
      'jeeson833@gmail.com', // អ៊ីមែលចាស់របស់អ្នក
      'jeeson83@gmail.com'   // 🔥 បន្ថែមអ៊ីមែលថ្មីពីក្នុងរូបភាពនៅទីនេះ
  ];
  /**
   * ផ្ទៀងផ្ទាត់លេខសម្ងាត់ Admin
   */
  const verifyAdminPassword = (input) => {
      return input === ADMIN_CODE;
  };

  /**
   * ពិនិត្យថាអ្នកដែលកំពុង Login ជា Admin ឬអត់
   */
  const isAdmin = () => {
      if (!user.value) return false;
      return user.value?.user_metadata?.role === 'admin' || 
             adminEmails.includes(user.value?.email);
  };
  // ==========================================

  // 🔥 0. Listener: តាមដានស្ថានភាព User
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) user.value = session.user;
    else user.value = null;
  });

  // 🔥 1. Load User
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) user.value = data.user;
  };

  // 🔥 2. Login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return true;
  };

  // 🔥 3. Register
  const register = async (email, password, username, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, phone, role: 'user', avatar: null }
      }
    });
    if (error) throw error;
    if (data.session) user.value = data.user;
    return true;
  };

  // 🔥 4. Update Profile
  const updateProfile = async (updates) => {
    const payload = updates.password ? { password: updates.password } : { data: updates };
    const { data, error } = await supabase.auth.updateUser(payload);
    if (error) throw error;
    if (data.user) user.value = data.user;
    return true;
  };

  // 🔥 5. Reset Password
  const resetPasswordEmail = async (email) => {
    const redirectUrl = window.location.origin + '/update-password';
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    if (error) throw error;
    return true;
  };

  // 🔥 6. Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      user.value = null;
      localStorage.clear(); 
      window.location.href = '/login'; 
    }
  };

  const isAuthenticated = () => !!user.value;

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
    verifyAdminPassword 
  };
});