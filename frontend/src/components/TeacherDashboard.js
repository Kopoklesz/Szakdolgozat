import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/TeacherDashboard.css';

const API_URL = 'https://api.pannon-shop.hu';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [webshops, setWebshops] = useState([]);
  const [newWebshop, setNewWebshop] = useState({
    subject_name: '',
    paying_instrument: '',
    header_color_code: '#000000',
    paying_instrument_icon: '',
    status: 'active'
  });
  const [editingWebshop, setEditingWebshop] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'new') {
      setNewWebshop(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'edit') {
      setEditingWebshop(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = async (webshopId) => {
    if (window.confirm(t('Biztosan törölni szeretnéd ezt a webshopot és minden termékét?'))) {
      try {
        await axios.delete(`${API_URL}/webshop/${webshopId}`);
        setSuccess(t('Webshop sikeresen törölve!'));
        setIsEditModalOpen(false);
        fetchWebshops();
      } catch (error) {
        console.error('Error deleting webshop:', error);
        setError(t('Hiba történt a webshop törlése közben.'));
      }
    }
  };

  const validateWebshop = (webshop, isEditing = false) => {
    const otherWebshops = isEditing 
      ? webshops.filter(shop => shop.webshop_id !== editingWebshop.webshop_id)
      : webshops;
      if (!isEditing || (isEditing && webshop.subject_name !== editingWebshop.subject_name)) {
        if (otherWebshops.some(shop => shop.subject_name === webshop.subject_name)) {
          setError(t('Már létezik webshop ezzel a tantárgy névvel.'));
          return false;
        }
      }
      if (!isEditing || (isEditing && webshop.paying_instrument !== editingWebshop.paying_instrument)) {
        if (otherWebshops.some(shop => shop.paying_instrument === webshop.paying_instrument)) {
          setError(t('Már létezik webshop ezzel a pénznemmel.'));
          return false;
        }
      }
    return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  
  try {
    if (!validateWebshop(newWebshop)) {
      return;
    }

    const response = await axios.post(`${API_URL}/webshop`, newWebshop);
    
    if (response.data) {
      setNewWebshop({
        subject_name: '',
        paying_instrument: '',
        header_color_code: '#000000',
        paying_instrument_icon: '',
        status: 'active'
      });
      setSuccess(t('Webshop sikeresen létrehozva!'));
      await fetchWebshops();
    }
  } catch (error) {
    console.error('Error creating webshop:', error);
    setError(error.response?.data?.message || t('Hiba történt a webshop létrehozása közben.'));
  }
};

  const handleEdit = (webshop) => {
    setEditingWebshop({ ...webshop });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateWebshop(editingWebshop, true)) {
      return;
    }
    try {
      await axios.put(`${API_URL}/webshop/${editingWebshop.webshop_id}`, editingWebshop);
      setSuccess(t('Webshop sikeresen frissítve!'));
      setIsEditModalOpen(false);
      fetchWebshops();
    } catch (error) {
      console.error('Error updating webshop:', error.response?.data || error.message);
      setError(t('Hiba történt a webshop frissítése közben.'));
    }
  };

  return (
    <div className="teacher-dashboard">
      <h1>{t('Előadói Irányítópult')}</h1>
      
      <div className="create-webshop-form">
        <h2>{t('Új Webshop Létrehozása')}</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subject_name">{t('Tantárgy Neve')}</label>
            <input
              id="subject_name"
              name="subject_name"
              value={newWebshop.subject_name}
              onChange={(e) => handleInputChange(e, 'new')}
              required
            />
          </div>
          <div>
            <label htmlFor="paying_instrument">{t('Pénznem')}</label>
            <input
              id="paying_instrument"
              name="paying_instrument"
              value={newWebshop.paying_instrument}
              onChange={(e) => handleInputChange(e, 'new')}
              required
            />
          </div>
          <div>
            <label htmlFor="paying_instrument_icon">{t('Pénznem Kép URL-je')}</label>
            <input
              id="paying_instrument_icon"
              name="paying_instrument_icon"
              value={newWebshop.paying_instrument_icon}
              onChange={(e) => handleInputChange(e, 'new')}
            />
          </div>
          <div className="color-picker-container">
          <label htmlFor="header_color_code">{t('Fejléc színe')}</label>
          <div className="color-picker-wrapper">
            <input
              type="color"
              id="header_color_code"
              name="header_color_code"
              value={newWebshop.header_color_code}
              onChange={(e) => handleInputChange(e, 'new')}
              required
            />
            <div className="color-preview" style={{ backgroundColor: newWebshop.header_color_code }}>
              <span>{newWebshop.header_color_code}</span>
            </div>
          </div>
        </div>
          <div>
            <label htmlFor="status">{t('Státusz')}</label>
            <select
              id="status"
              name="status"
              value={newWebshop.status}
              onChange={(e) => handleInputChange(e, 'new')}
            >
              <option value="active">{t('Aktív')}</option>
              <option value="inactive">{t('Inaktív')}</option>
            </select>
          </div>
          <button type="submit">{t('Webshop létrehozása')}</button>
        </form>
      </div>

      <h2>{t('Webshopjaid')}</h2>
      <div className="webshops-list">
        {webshops.map((webshop) => (
          <div key={webshop.webshop_id} className="webshop-card">
            <h3>{webshop.subject_name}</h3>
            <p>{t('Pénznem')}: {webshop.paying_instrument}</p>
            <div className="color-preview">
              <span>{t('Fejléc színe')}:</span>
              <div
                className="color-box"
                style={{ backgroundColor: webshop.header_color_code }}
              ></div>
            </div>
            <p>{t('Státusz')}: {webshop.status === 'active' ? t('Aktív') : t('Inaktív')}</p>
            <div className="webshop-card-buttons">
              <button className="webshop-card-button edit" onClick={() => handleEdit(webshop)}>
                {t('Szerkesztés')}
              </button>
              <Link to={`/manage-products/${webshop.webshop_id}`} className="webshop-card-button manage">
                {t('Termékek kezelése')}
              </Link>
            </div>
          </div>
        ))}
        </div>
          {isEditModalOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <h2>{t('Webshop szerkesztése')}</h2>
              <form onSubmit={handleUpdate}>
                <div>
                  <label htmlFor="edit_subject_name">{t('Tantárgy Neve')}</label>
                  <input
                    id="edit_subject_name"
                    name="subject_name"
                    value={editingWebshop.subject_name}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit_paying_instrument">{t('Pénznem')}</label>
                  <input
                    id="edit_paying_instrument"
                    name="paying_instrument"
                    value={editingWebshop.paying_instrument}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit_paying_instrument_icon">{t('Pénznem Kép URL-je')}</label>
                  <input
                    id="edit_paying_instrument_icon"
                    name="paying_instrument_icon"
                    value={editingWebshop.paying_instrument_icon}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  />
                </div>
                <div className="color-picker-container">
                  <label htmlFor="edit_header_color_code">{t('Fejléc színe')}</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      id="edit_header_color_code"
                      name="header_color_code"
                      value={editingWebshop.header_color_code}
                      onChange={(e) => handleInputChange(e, 'edit')}
                      required
                    />
                    <div className="color-preview" style={{ backgroundColor: editingWebshop.header_color_code }}>
                      <span>{editingWebshop.header_color_code}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit_status">{t('Státusz')}</label>
                  <select
                    id="edit_status"
                    name="status"
                    value={editingWebshop.status}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  >
                    <option value="active">{t('Aktív')}</option>
                    <option value="inactive">{t('Inaktív')}</option>
                  </select>
                </div>
                <div className="modal-button-group">
                  <button type="submit"> {t('Frissítés')} </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)}> {t('Mégse')} </button>
                  <button type="button" className="delete-button" onClick={() => handleDelete(editingWebshop.webshop_id)}> {t('Webshop törlése')} </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default TeacherDashboard;
