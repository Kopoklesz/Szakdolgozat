import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Shop from './components/Shop';
import Nav from './components/Nav';
import './css/App.css';

const LANGUAGES = { HU: 'hu', EN: 'en' };

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.HU);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Nav currentLanguage={currentLanguage} changeLanguage={changeLanguage} />
        <Routes>
          <Route path="/" element={<Navigate replace to="/shop" />} />
          <Route path="/shop" element={<Shop />} />
          {/* Add more routes here as you develop more features */}
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;