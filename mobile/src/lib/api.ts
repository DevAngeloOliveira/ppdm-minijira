import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Configurar a URL da API - ajustar conforme ambiente
const getApiUrl = () => {
  if (!__DEV__) {
    // Produção - ajustar para URL real
    return 'https://api.minijira.com/api/v1';
  }

  // Desenvolvimento
  if (Platform.OS === 'android') {
    // Android Emulator usa 10.0.2.2 para localhost
    return 'http://10.0.2.2:8000/api/v1';
  } else if (Platform.OS === 'ios') {
    // iOS Simulator pode usar localhost
    return 'http://localhost:8000/api/v1';
  } else {
    // Web
    return 'http://localhost:8000/api/v1';
  }
};

export const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - adiciona token automaticamente
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao obter token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tipos de erro da API
export interface ApiError {
  detail: string;
  status: number;
}

// Interceptor de response - tratamento centralizado de erros
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail: string }>) => {
    const apiError: ApiError = {
      detail: 'Erro de conexão com o servidor',
      status: 0,
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.detail = error.response.data?.detail || getDefaultErrorMessage(error.response.status);

      // Token expirado ou inválido
      if (error.response.status === 401) {
        await SecureStore.deleteItemAsync('auth_token');
        // O componente deve verificar isAuthenticated e redirecionar
      }
    } else if (error.request) {
      apiError.detail = 'Servidor não responde. Verifique sua conexão.';
    } else {
      apiError.detail = error.message || 'Erro desconhecido';
    }

    return Promise.reject(apiError);
  }
);

function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Dados inválidos',
    401: 'Sessão expirada. Faça login novamente.',
    403: 'Você não tem permissão para esta ação',
    404: 'Recurso não encontrado',
    429: 'Muitas tentativas. Aguarde um momento.',
    500: 'Erro interno do servidor',
  };
  return messages[status] || 'Erro desconhecido';
}
