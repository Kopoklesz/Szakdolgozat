// Központi konfiguráció az API URL kezeléséhez
// Fejlesztés során: http://localhost:3000
// Produkcióban: https://api.pannon-shop.hu

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Alternatíva: automatikus detektálás
// export const API_URL = window.location.hostname === 'localhost' 
//   ? 'http://localhost:3000' 
//   : 'https://api.pannon-shop.hu';

export default { API_URL };