import axios from 'axios';

// Configurar a URL da API - ajustar conforme ambiente
const API_URL = __DEV__
  ? 'http://10.0.2.2:8000/api/v1' // Android Emulator
  : 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
