import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  
  // State: ទុកព័ត៌មានអ្នកប្រើប្រាស់
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);

  // Getter: ឆែកថា Login ហើយឬនៅ?
  const isAuthenticated = () => !!user.value;

  // Getter: ឆែកថាជា Admin ឬអត់?
  const isAdmin = () => user.value && user.value.role === 'admin';

  // Action: Login
  const login = (username, password) => {
    // ករណីជា Admin (Password: admin123)
    if (username === 'admin' && password === 'admin123') {
      user.value = { 
        username: 'Admin', 
        role: 'admin', 
        phone: '012 345 678', 
        address: 'Phnom Penh',
        avatar: null // 🔥 បន្ថែម Avatar (សំខាន់សម្រាប់ Profile Picture)
      };
      localStorage.setItem('user', JSON.stringify(user.value));
      return true;
    } 
    // ករណីជា User ធម្មតា (Password: 1234)
    else if (password === '1234') {
      user.value = { 
        username: username, 
        role: 'user', 
        phone: '', 
        address: '',
        avatar: null // 🔥 បន្ថែម Avatar សម្រាប់ User ថ្មី
      };
      localStorage.setItem('user', JSON.stringify(user.value));
      return true;
    }
    return false;
  };

  // Action: Update Profile (កែប្រែព័ត៌មាន + រូបភាព)
  const updateProfile = (updatedInfo) => {
    if (user.value) {
      // បញ្ចូលព័ត៌មានចាស់ ជាមួយព័ត៌មានថ្មី (Merge)
      user.value = { ...user.value, ...updatedInfo };
      
      // Save ចូល LocalStorage
      localStorage.setItem('user', JSON.stringify(user.value));
      return true;
    }
    return false;
  };

  // Action: Logout
  const logout = () => {
    user.value = null;
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  return { 
    user, 
    isAuthenticated, 
    isAdmin, 
    login, 
    logout, 
    updateProfile 
  };
});