import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase'; 

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const router = useRouter();

  // ==========================================
  // 🛡️ ការកំណត់សិទ្ធិ ADMIN (SETTINGS)
  // ==========================================
  
  // បញ្ជី Email ដែលបងអនុញ្ញាតឱ្យក្លាយជា Admin
  const adminEmails = [
      'admin@gmail.com',
      'chanro7080@gmail.com',
      'mengpanha@gmail.com',
      'jeeson833@gmail.com', 
      'jeeson83@gmail.com'   
  ];

  /**
   * ពិនិត្យថាអ្នកដែលកំពុង Login ជា Admin ឬអត់ (ឆែកតាម Email ក្នុងបញ្ជីខាងលើ)
   */
  const isAdmin = () => {
      if (!user.value) return false;
      // បើ Email គាត់មានក្នុងបញ្ជី adminEmails គឺគាត់ជា Admin
      return adminEmails.includes(user.value?.email);
  };
  // ==========================================

  // 🔥 0. Listener: តាមដានស្ថានភាព User (Session Persistence)
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      user.value = session.user;
    } else {
      user.value = null;
    }
  });

  // 🔥 1. Load User ពី Supabase ពេលបើកកម្មវិធី
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) user.value = data.user;
  };

  // 🔥 2. Login ដោយប្រើ Email និង Password ធម្មតា
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    user.value = data.user;
    return true;
  };

  // 🔥 3. Register សមាជិកថ្មី
  const register = async (email, password, username, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, phone, role: 'user', avatar: null }
      }
    });
    if (error) throw error;
    if (data.user) user.value = data.user;
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

  // 🔥 6. Logout និងសម្អាត Session
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
    isAdmin // លុប verifyAdminPassword ចោលព្រោះលែងប្រើលេខកូដសោរ
  };
});