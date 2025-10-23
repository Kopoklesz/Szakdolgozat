import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../css/Nav.css';

const LANGUAGES = { HU: 'hu', EN: 'en' };   

function Nav({ currentLanguage, changeLanguage }) {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/webshops');
  };

  // Szerepkör fordítása - többnyelvű
  const getRoleLabel = (role) => {
    return t(`role_${role}`);
  };

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
          <li><Link to="/webshops">{t('Főoldal')}</Link></li>
          
          {/* Csak tanárok és adminok láthatják az Előadói dashboardot */}
          {isAuthenticated && (user.role === 'teacher' || user.role === 'admin') && (
            <li><Link to="/teacher-dashboard">{t('Előadói')}</Link></li>
          )}
          
          {/* Aláírás generálás - CSAK tanárok és adminok látják */}
          {isAuthenticated && (user.role === 'teacher' || user.role === 'admin') && (
            <li><Link to="/signature-generator">{t('Aláírás generálás')}</Link></li>
          )}
        </ul>

        {/* Auth szekció - jobb oldal */}
        <div className="auth-section">
          {!isAuthenticated ? (
            <Link to="/login" className="login-link">{t('Bejelentkezés')}</Link>
          ) : (
            <div className="user-display">
              <span className="username">{user.username}</span>
              <span className="user-role">({getRoleLabel(user.role)})</span>
              <button className="logout-button" onClick={handleLogout}>
                {t('Kijelentkezés')}
              </button>
            </div>
          )}
        </div>
        
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