import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/Nav.css';

const LANGUAGES = { HU: 'hu', EN: 'en' };   

function Nav({ currentLanguage, changeLanguage }) {
  const { t } = useTranslation();

  return (
    <div className="nav-container">
      <nav className='externLinksNav'>
        <ul>
          <li><a href="https://uni-pannon.hu" target="_blank" rel="noopener noreferrer">{t('PE Főoldal')}</a></li>
          <li><a href="https://alairas.sport.uni-pannon.hu/pdfs/user_manual_2024_hu.pdf" target="_blank" rel="noopener noreferrer">{t('Használati útmutató')}</a></li>
        </ul>
      </nav>
    
      <nav className='interLinksNav'>
        <ul>
          <li><Link to="/shop">{t('Főoldal')}</Link></li>
          <li><Link to="/webshops">{t('Webshopok')}</Link></li>
          <li><Link to="/teacher-dashboard">{t('Tanári')}</Link></li>
          <li><Link to="/login">{t('Bejelentkezés')}</Link></li>
        </ul>
        <div className="language-selector">
          <button onClick={() => changeLanguage(currentLanguage === LANGUAGES.HU ? LANGUAGES.EN : LANGUAGES.HU)}>
            <span className="globe-icon">🌐</span> {currentLanguage.toUpperCase()}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Nav;