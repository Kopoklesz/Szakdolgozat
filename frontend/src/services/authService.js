import apiClient from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

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

// Regisztráció
const register = async (username, email, password, rememberMe = false) => {
  try {
    // ELTÁVOLÍTVA: nagybetűsítés - a username már bármi lehet
    const response = await apiClient.post('/auth/register', {
      username,  // változatlan formában
      email,
      password
    });
    
    const { access_token, user } = response.data;
    setAuthData(access_token, user, rememberMe);
    
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Regisztráció sikertelen'
    };
  }
};

// Bejelentkezés
const login = async (identifier, password, rememberMe = false) => {
  try {
    // ELTÁVOLÍTVA: nagybetűsítés - már nem csak Neptune kód lehet
    const response = await apiClient.post('/auth/login', {
      identifier,  // változatlan formában
      password
    });
    
    const { access_token, user } = response.data;
    setAuthData(access_token, user, rememberMe);
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Bejelentkezés sikertelen'
    };
  }
};

// Kijelentkezés
const logout = async () => {
  try {
    const { token } = getAuthData();
    if (token) {
      await apiClient.post('/auth/logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
  }
};

// Profil lekérése
const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return { success: true, user: response.data };
  } catch (error) {
    console.error('Get profile error:', error);
    clearAuthData();
    return { success: false, error: 'Profil lekérése sikertelen' };
  }
};

// Jelszó validáció
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Legalább 8 karakter hosszú');
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

// Email domain validáció - ÚJ
const validateEmailDomain = (email) => {
  // Admin email
  if (email === 'admin@uni-pannon.hu') {
    return { isValid: true };
  }

  // Csak student és teacher domaineket fogadunk el
  const validDomains = ['@student.uni-pannon.hu', '@teacher.uni-pannon.hu'];
  const isValid = validDomains.some(domain => email.endsWith(domain));

  if (!isValid) {
    return {
      isValid: false,
      error: 'Csak @student.uni-pannon.hu vagy @teacher.uni-pannon.hu email címmel lehet regisztrálni'
    };
  }

  return { isValid: true };
};

// Named exports
export {
  register,
  login,
  logout,
  getProfile,
  validatePassword,
  validateEmailDomain,
  getAuthData,
  clearAuthData
};

// Default export
export default {
  register,
  login,
  logout,
  getProfile,
  validatePassword,
  validateEmailDomain,
  getAuthData,
  clearAuthData
};