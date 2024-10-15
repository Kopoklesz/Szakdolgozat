import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../css/WebshopList.css';

const API_URL = 'http://localhost:3001';

const WebshopList = () => {
  const { t } = useTranslation();
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

  if (loading) return <div>{t('Betöltés')}...</div>;
  if (error) return <div>{t('Hiba')}: {error}</div>;

  return (
    <div className="webshop-list-container">
      <h1>{t('Elérhető Webshopok')}</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder={t('Webshop keresése...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="webshop-search-input"
        />
      </div>
      <div className="webshop-grid">
        {filteredWebshops.length > 0 ? (
          filteredWebshops.map((webshop) => (
            <Link to={`/shop/${webshop.webshop_id}`} key={webshop.webshop_id} className="webshop-card">
              <div className="webshop-card-content">
                <h2>{webshop.subject_name}</h2>
                <p>{t('Pénznem')}: {webshop.paying_instrument}</p>
                <div className="color-preview">
                  <span>{t('Fejléc színe')}:</span>
                  <div
                    className="color-box"
                    style={{ backgroundColor: webshop.header_color_code }}
                  ></div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>{t('Nincs találat')}</p>
        )}
      </div>
    </div>
  );
};

export default WebshopList;