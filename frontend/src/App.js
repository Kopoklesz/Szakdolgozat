// 1. Külső könyvtárak
import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';

// 2. Komponensek
import Shop from './components/Shop';
import Nav from './components/Nav';
import TeacherDashboard from './components/TeacherDashboard';
import Cart from './components/Cart';
import WebshopList from './components/WebshopList';
import ManageProducts from './components/ManageProducts';
import SignatureGenerated from './components/SignatureGenerated';

// 3. Stílusok
import './App.css';

const LANGUAGES = { HU: 'hu', EN: 'en' };

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.HU);
  const [userId, setUserId] = useState(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return (
    <Suspense fallback="Loading...">
      <Router>
        <Nav currentLanguage={currentLanguage} changeLanguage={changeLanguage} />
        <Routes>
          <Route path="/" element={<Navigate replace to="/webshops" />} />
          <Route path="/webshops" element={<WebshopList />} />
          <Route path="/shop/:webshopId?" element={<Shop />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/cart/:webshopId" element={<Cart userId={userId} />} />
          <Route path="/manage-products/:webshopId" element={<ManageProducts />} />
          <Route path="/signature-generator" element={<SignatureGenerated />} />
        </Routes>
      </Router>
    </Suspense>
  );
}

export default App;