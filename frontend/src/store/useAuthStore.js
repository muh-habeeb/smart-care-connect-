import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ user: res.data, isAuthenticated: true, isLoading: false, error: null });
      return res.data;
    } catch (error) {
      let message = 'Login failed';
      if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  }
}));

export default useAuthStore;
