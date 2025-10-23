
/**
 * Központosított API konfiguráció
 * 
 * Automatikusan váltogat development és production környezet között
 * Development: http://localhost:3001
 * Production: https://api.pannon-shop.hu
 */

// Alapértelmezett API URL meghatározása
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.pannon-shop.hu' 
    : 'http://localhost:3001');

// API végpontok
export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/auth`,
  WEBSHOP: `${API_BASE_URL}/webshop`,
  PRODUCT: `${API_BASE_URL}/product`,
  CART: `${API_BASE_URL}/cart`,
  PURCHASE: `${API_BASE_URL}/purchase`,
  USER: `${API_BASE_URL}/user`,
  GENERATE_CODES: `${API_BASE_URL}/generate-codes`,
  GENERATED_CODES: `${API_BASE_URL}/generated-codes`,
};

// Kompatibilitás a régi kóddal
export const API_URL = API_BASE_URL;

// Default export
export default API_BASE_URL;