import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next'; // I18nextProvider importálása
import i18n from './i18n'; // Az i18n importálása
import './App.css';

function Shop() {
  return <h2>Shop Page</h2>;
}

function App() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('hu');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="nav-container">
          {/* Nav Bar */}
          <nav className='externLinksNav'>
            <ul>
              {/* Extern links */}
              <li><a href="https://uni-pannon.hu" target="_blank" rel="noopener noreferrer">{t('PE Főoldal')}</a></li>
              <li><a href="https://alairas.sport.uni-pannon.hu/pdfs/user_manual_2024_hu.pdf" target="_blank" rel="noopener noreferrer">{t('Használati útmutató')}</a></li>
            </ul>
          </nav>
        
          <nav className='interLinksNav'>
            <ul>
              {/* Intern links */}
              <li><Link to="/shop">{t('Bolt')}</Link></li>
              <li><Link to="/login">{t('Bejelentkezés')}</Link></li>
            </ul>
            {/* Language change */}
            <div className="language-selector">
              <button onClick={() => changeLanguage(currentLanguage === 'hu' ? 'en' : 'hu')}>
                <span className="globe-icon">🌐</span> {currentLanguage.toUpperCase()}
              </button>
            </div>
          </nav>
        </div>

        {/* Page render */}
        <Routes>
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;