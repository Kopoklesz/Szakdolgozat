import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "PE Főoldal": "PE Homepage",
      "Használati útmutató": "User Manual",
      "Főoldal": "Homepage",
      "Bejelentkezés": "Login",
      "Termék keresés...": "Search products...",
      "Nem sikerült betölteni a bolt adatait": "Failed to load shop data",
      "Betöltés": "Loading",
      "Hiba": "Error",
      "Pénznem": "Currency",
      "Minden kategória": "All Categories",
      "Nem található termék": "No products found",
      "Ár": "Price",
      "Elérhető": "Available",
      "Kosárba": "Add to Cart",
      "Tanári": "Teacher's",
      "Tanári Irányítópult": "Teacher Dashboard",
      "Új Webshop Létrehozása": "Create new webshop",
      "Tantárgy Neve": "Subject name",
      "Fejléc színe": "Header color",
      "Pénznem Kép URL-je": "Currency picture URL",
      "Webshop létrehozása": "Create webshop",
      "Webshopjaid": "Your webshops",
      "Szerkesztés": "Edit",
      "Termék megtekintés": "Product view",
      "Kosár": "Cart",
      "A kosár üres": "The cart is empty",
      "Eltávolítás": "Remove",
      "Összesen": "Total",
      "Fizetés": "Checkout",
      "Profil": "Profile",
      "Egyenleg": "Balance",
      "Vásárlási előzmények": "Purchase history",
      "Nem sikerült betölteni a kosár tartalmát": "Failed to load cart contents",
      "Nem sikerült betölteni a profil adatokat": "Failed to load profile data"
    }
  },
  hu: {
    translation: {
      "PE Főoldal": "PE Főoldal",
      "Használati útmutató": "Használati útmutató",
      "Főoldal": "Főoldal",
      "Bejelentkezés": "Bejelentkezés",
      "Termék keresés...": "Termék keresés...",
      "Nem sikerült betölteni a bolt adatait": "Nem sikerült betölteni a bolt adatait",
      "Betöltés": "Betöltés",
      "Hiba": "Hiba",
      "Pénznem": "Pénznem",
      "Minden kategória": "Minden kategória",
      "Nem található termék": "Nem található termék",
      "Ár": "Ár",
      "Elérhető": "Elérhető",
      "Kosárba": "Kosárba",
      "Tanári": "Tanári",
      "Tanári Irányítópult": "Tanári Irányítópult",
      "Új Webshop Létrehozása": "Új Webshop Létrehozása",
      "Tantárgy Neve": "Tantárgy Neve",
      "Fejléc színe": "Fejléc színe",
      "Fizetőeszköz Kép URL-je": "Fizetőeszköz Kép URL-je",
      "Webshop létrehozása": "Webshop létrehozása",
      "Webshopjaid": "Webshopjaid",
      "Szerkesztés": "Szerkesztés",
      "Termék megtekintés": "Termék megtekintés",
      "Kosár": "Kosár",
      "A kosár üres": "A kosár üres",
      "Eltávolítás": "Eltávolítás",
      "Összesen": "Összesen",
      "Fizetés": "Fizetés",
      "Profil": "Profil",
      "Egyenleg": "Egyenleg",
      "Vásárlási előzmények": "Vásárlási előzmények",
      "Nem sikerült betölteni a kosár tartalmát": "Nem sikerült betölteni a kosár tartalmát",
      "Nem sikerült betölteni a profil adatokat": "Nem sikerült betölteni a profil adatokat"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hu', // Kezdő nyelv
    fallbackLng: 'hu', // Biztonsági nyelv
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;