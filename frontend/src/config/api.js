/**
 * Centralizált API konfiguráció
 * 
 * A REACT_APP_API_URL környezeti változó alapján automatikusan váltogat
 * development (localhost:3001) és production (api.pannon-shop.hu) környezet között.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.pannon-shop.hu';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/auth`,
  WEBSHOP: `${API_BASE_URL}/webshop`,
  PRODUCT: `${API_BASE_URL}/product`,
  CART: `${API_BASE_URL}/cart`,
  PURCHASE: `${API_BASE_URL}/purchase`,
  GENERATE_CODES: `${API_BASE_URL}/generate-codes`,
  GENERATED_CODES: `${API_BASE_URL}/generated-codes`,
};

export default API_BASE_URL;