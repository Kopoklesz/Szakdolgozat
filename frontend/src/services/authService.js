import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.AUTH;

// Token és user mentése localStorage-ba
const setAuthData = (token, user, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('pannon_shop_token', token);
    localStorage.setItem('pannon_shop_user', JSON.stringify(user));
  } else {
    sessionStorage.setItem('pannon_shop_token', token);
    sessionStorage.setItem('pannon_shop_user', JSON.stringify(user));
  }
};

// Token és user lekérése
const getAuthData = () => {
  const token = localStorage.getItem('pannon_shop_token') || sessionStorage.getItem('pannon_shop_token');
  const userStr = localStorage.getItem('pannon_shop_user') || sessionStorage.getItem('pannon_shop_user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

// Auth adatok törlése
const clearAuthData = () => {
  localStorage.removeItem('pannon_shop_token');
  localStorage.removeItem('pannon_shop_user');
  sessionStorage.removeItem('pannon_shop_token');
  sessionStorage.removeItem('pannon_shop_user');
};

// Axios interceptor - automatikus token hozzáadása
axios.interceptors.request.use(
  (config) => {
    const { token } = getAuthData();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Regisztráció
const register = async (username, email, password, rememberMe = false) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password
    });
    
    const { access_token, user } = response.data;
    setAuthData(access_token, user, rememberMe);
    
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Regisztráció sikertelen'
    };
  }
};

// Bejelentkezés
const login = async (identifier, password, rememberMe = false) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      identifier,
      password
    });
    
    const { access_token, user } = response.data;
    setAuthData(access_token, user, rememberMe);
    
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Bejelentkezés sikertelen'
    };
  }
};

// Kijelentkezés
const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
    clearAuthData();
    return { success: true };
  } catch (error) {
    // Még hiba esetén is töröljük a helyi adatokat
    clearAuthData();
    return { success: false, error: error.response?.data?.message };
  }
};

// Profil lekérése (token validálás)
const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`);
    return { success: true, user: response.data };
  } catch (error) {
    clearAuthData();
    return { success: false, error: error.response?.data?.message };
  }
};

// Jelszó komplexitás validáció (frontend segédlet)
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Legalább 8 karakter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Legalább egy nagybetű');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Legalább egy kisbetű');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Legalább egy szám');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Legalább egy speciális karakter (!@#$%^&*...)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export {
  register,
  login,
  logout,
  getProfile,
  validatePassword,
  getAuthData,
  clearAuthData
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  validatePassword,
  getAuthData,
  clearAuthData
};

export default authService;