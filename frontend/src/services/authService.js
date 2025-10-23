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
    // Nagybetűre konvertáljuk a Neptune kódot a frontend oldalon is
    const uppercaseUsername = username.toUpperCase();
    
    const response = await apiClient.post('/auth/register', {
      username: uppercaseUsername,
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
    // Ha 6 karakter hosszú, valószínűleg Neptune kód - nagybetűre konvertáljuk
    const processedIdentifier = identifier.length === 6 ? identifier.toUpperCase() : identifier;
    
    const response = await apiClient.post('/auth/login', {
      identifier: processedIdentifier,
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
    await apiClient.post('/auth/logout');
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
    const response = await apiClient.get('/auth/profile');
    return { success: true, user: response.data };
  } catch (error) {
    clearAuthData();
    return { success: false, error: error.response?.data?.message };
  }
};

// Neptune kód validáció
const validateNeptuneCode = (neptuneCode) => {
  const neptunRegex = /^[A-Z0-9]{6}$/;
  
  if (!neptuneCode || neptuneCode.trim() === '') {
    return {
      isValid: false,
      error: 'A Neptune kód megadása kötelező'
    };
  }
  
  // Nagybetűre konvertáljuk a validációhoz
  if (!neptunRegex.test(neptuneCode.toUpperCase())) {
    return {
      isValid: false,
      error: 'A Neptune kód formátuma érvénytelen (6 karakter: betűk és számok)'
    };
  }
  
  return { isValid: true };
};

// Email domain validáció - FRISSÍTVE
const validateEmailDomain = (email) => {
  const allowedDomains = ['student.uni-pannon.hu', 'teacher.uni-pannon.hu', 'uni-pannon.hu'];
  
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Az email cím megadása kötelező'
    };
  }
  
  const emailDomain = email.split('@')[1];
  
  if (!allowedDomains.includes(emailDomain)) {
    return {
      isValid: false,
      error: 'Csak @student.uni-pannon.hu, @teacher.uni-pannon.hu vagy @uni-pannon.hu domain engedélyezett'
    };
  }
  
  return { isValid: true };
};

// Jelszó komplexitás validáció
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

// Named exports
export {
  register,
  login,
  logout,
  getProfile,
  validatePassword,
  validateNeptuneCode,
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
  validateNeptuneCode,
  validateEmailDomain,
  getAuthData,
  clearAuthData
};