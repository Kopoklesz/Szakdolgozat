import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../css/TeacherDashboard.css';

const API_URL = 'http://localhost:3001';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [webshops, setWebshops] = useState([]);
  const [newWebshop, setNewWebshop] = useState({
    subject_name: '',
    paying_instrument: '',
    header_color_code: '#000000',
    paying_device_image: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWebshops();
  }, []);

  const fetchWebshops = async () => {
    try {
      const response = await axios.get(`${API_URL}/webshop`);
      setWebshops(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching webshops:', error);
      setError(t('Hiba történt a webshopok betöltése közben.'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWebshop(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_URL}/webshop`, newWebshop);
      setNewWebshop({
        subject_name: '',
        paying_instrument: '',
        header_color_code: '#000000',
        paying_device_image: ''
      });
      setSuccess(t('Webshop sikeresen létrehozva!'));
      fetchWebshops();
    } catch (error) {
      console.error('Error creating webshop:', error.response?.data || error.message);
      setError(t('Hiba történt a webshop létrehozása közben.'));
    }
  };

  return (
    <div className="teacher-dashboard">
      <h1>{t('Tanári Irányítópult')}</h1>
      
      <div className="create-webshop-form">
        <h2>{t('Új Webshop Létrehozása')}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subject_name">{t('Tantárgy Neve')}</label>
            <input
              id="subject_name"
              name="subject_name"
              value={newWebshop.subject_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="paying_instrument">{t('Pénznem')}</label>
            <input
              id="paying_instrument"
              name="paying_instrument"
              value={newWebshop.paying_instrument}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="header_color_code">{t('Fejléc színe')}</label>
            <input
              type="color"
              id="header_color_code"
              name="header_color_code"
              value={newWebshop.header_color_code}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="paying_device_image">{t('Pénznem Kép URL-je')}</label>
            <input
              id="paying_device_image"
              name="paying_device_image"
              value={newWebshop.paying_device_image}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">{t('Webshop létrehozása')}</button>
        </form>
      </div>

      <h2>{t('Webshopjaid')}</h2>
      <div className="webshops-list">
        {webshops.map((webshop, index) => (
          <div key={index} className="webshop-card">
            <h3>{webshop.subject_name}</h3>
            <p>{t('Paying Instrument')}: {webshop.paying_instrument}</p>
            <div className="color-preview">
              <span>{t('Header Color')}:</span>
              <div
                className="color-box"
                style={{ backgroundColor: webshop.header_color_code }}
              ></div>
            </div>
            <button>{t('Szerkesztés')}</button>
            <button>{t('Termék megtekintés')}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;