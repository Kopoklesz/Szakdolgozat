import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/WebshopList.css';
import { API_URL } from '../config/api';

const WebshopList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [webshops, setWebshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebshops = async () => {
      try {
        const response = await axios.get(`${API_URL}/webshop`);
        const filteredWebshops = response.data.filter(webshop => webshop.webshop_id !== 0);
        setWebshops(filteredWebshops);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching webshops:', error);
        setError(t('Hiba történt a webshopok betöltése közben.'));
        setLoading(false);
      }
    };

    fetchWebshops();
  }, [t]);

  const filteredWebshops = webshops.filter(webshop =>
    webshop.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWebshopClick = (webshopId) => {
    if (!isAuthenticated) {
      alert(t('Kérjük, jelentkezz be a webshop megtekintéséhez!'));
      navigate('/login');
      return;
    }
    navigate(`/shop/${webshopId}`);
  };

  const getTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  if (loading) {
    return (
      <div className="webshop-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{t('Betöltés...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="webshop-list-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="webshop-list-container">
      <div className="webshop-list-header">
        <h1>{t('Elérhető Webshopok')}</h1>
        <p className="header-subtitle">Válassz a tantárgyak közül</p>
      </div>
      
      <div className="search-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder={t('Keresés webshop neve szerint...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        {searchTerm && (
          <div className="search-results-info">
            {filteredWebshops.length} {t('találat')} "{searchTerm}" {t('keresésre')}
          </div>
        )}
      </div>

      <div className="webshop-grid">
        {filteredWebshops.length > 0 ? (
          filteredWebshops.map((webshop) => {
            const textColor = getTextColor(webshop.header_color_code);
            
            return (
              <div
                key={webshop.webshop_id} 
                className="webshop-card"
                onClick={() => handleWebshopClick(webshop.webshop_id)}
              >
                <div 
                  className="webshop-card-header"
                  style={{ 
                    backgroundColor: webshop.header_color_code,
                    color: textColor
                  }}
                >
                  <h2>{webshop.subject_name}</h2>
                  <div className="card-icon">🏪</div>
                </div>
                <div className="webshop-card-body">
                  <div className="webshop-info">
                    <span className="info-icon">💰</span>
                    <div className="info-content">
                      <span className="info-label">{t('Pénznem')}</span>
                      <span className="info-value">{webshop.paying_instrument}</span>
                    </div>
                  </div>
                  <button 
                    className="enter-btn"
                    style={{ 
                      backgroundColor: webshop.header_color_code,
                      color: textColor
                    }}
                  >
                    {t('Belépés')} →
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>{t('Nincs találat')}</h3>
            <p>{t('Próbálj meg más keresési kifejezést használni')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebshopList;