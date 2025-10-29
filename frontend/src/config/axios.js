import axios from 'axios';
import { API_ENDPOINTS } from './api';

// Külön axios instance létrehozása az API hívásokhoz
const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE,
  withCredentials: true, // CORS credentials támogatás
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 másodperc timeout
});

// Request interceptor - token hozzáadása
apiClient.interceptors.request.use(
  (config) => {
    // Token lekérése
    const token = localStorage.getItem('pannon_shop_token') || 
                  sessionStorage.getItem('pannon_shop_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log fejlesztési környezetben
    if (process.env.NODE_ENV === 'development') {
      const method = config.method ? config.method.toUpperCase() : 'UNKNOWN';
      console.log('API Request:', method, config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hibakezelés
apiClient.interceptors.response.use(
  (response) => {
    // Sikeres válasz
    return response;
  },
  (error) => {
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.error('API Response error:', error.response?.status, error.response?.data);
    }
    
    // 401 Unauthorized - token lejárt vagy érvénytelen
    if (error.response?.status === 401) {
      // Token törlése
      localStorage.removeItem('pannon_shop_token');
      localStorage.removeItem('pannon_shop_user');
      sessionStorage.removeItem('pannon_shop_token');
      sessionStorage.removeItem('pannon_shop_user');
      
      // Átirányítás login oldalra (kivéve ha már ott vagyunk)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // CORS hiba detektálása
    if (error.message === 'Network Error' && !error.response) {
      console.error('CORS hiba vagy a backend nem elérhető');
      error.message = 'Kapcsolódási hiba. Kérjük, próbálja újra később.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;