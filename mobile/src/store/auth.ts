import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, ApiError } from '../lib/api';
import { User, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loadToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    const token = response.data.access_token;
    
    await SecureStore.setItemAsync('auth_token', token);
    set({ token, isAuthenticated: true });
    
    // Carregar dados do usuário após login
    await get().loadUser();
  },

  register: async (data: RegisterRequest) => {
    await api.post('/auth/register', data);
  },

  loadToken: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        set({ token, isAuthenticated: true });
        // Validar token carregando dados do usuário
        await get().loadUser();
      } else {
        set({ token: null, isAuthenticated: false, user: null });
      }
    } catch (error) {
      set({ token: null, isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      const response = await api.get('/users/me');
      set({ user: response.data });
    } catch (error) {
      // Se falhar ao carregar usuário, provavelmente token inválido
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        await get().logout();
      }
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));
