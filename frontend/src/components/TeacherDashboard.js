import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios';
import '../css/TeacherDashboard.css';
import { API_URL } from '../config/api';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [webshops, setWebshops] = useState([]);
  const [newWebshop, setNewWebshop] = useState({
    subject_name: '',
    paying_instrument: '',
    header_color_code: '#2196F3',
    paying_instrument_icon: '',
    status: 'active'
  });
  const [editingWebshop, setEditingWebshop] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Előre definiált Material Design színek
  const presetColors = [
    { name: 'Kék', color: '#2196F3' },
    { name: 'Piros', color: '#F44336' },
    { name: 'Zöld', color: '#4CAF50' },
    { name: 'Narancssárga', color: '#FF9800' },
    { name: 'Lila', color: '#9C27B0' },
    { name: 'Türkiz', color: '#00BCD4' },
    { name: 'Lime', color: '#CDDC39' },
    { name: 'Rózsaszín', color: '#E91E63' },
    { name: 'Barna', color: '#795548' },
    { name: 'Szürke', color: '#607D8B' },
    { name: 'Indigó', color: '#3F51B5' },
    { name: 'Sárga', color: '#FFC107' }
  ];

  useEffect(() => {
    fetchWebshops();
  }, []);

  const fetchWebshops = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/webshop`);
      const allWebshops = Array.isArray(response.data) ? response.data : [];
      
      if (user?.role === 'admin') {
        setWebshops(allWebshops);
      } else {
        const myWebshops = allWebshops.filter(shop => shop.teacher_id === user?.user_id);
        setWebshops(myWebshops);
      }
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

  const handleColorSelect = (color, formType) => {
    if (formType === 'new') {
      setNewWebshop(prev => ({ ...prev, header_color_code: color }));
    } else if (formType === 'edit') {
      setEditingWebshop(prev => ({ ...prev, header_color_code: color }));
    }
  };

  const handleDelete = async (webshopId) => {
    if (window.confirm(t('Biztosan törölni szeretnéd ezt a webshopot és minden termékét?'))) {
      try {
        await apiClient.delete(`${API_URL}/webshop/${webshopId}`);
        setSuccess(t('Webshop sikeresen törölve!'));
        setIsEditModalOpen(false);
        fetchWebshops();
      } catch (error) {
        console.error('Error deleting webshop:', error);
        setError(error.response?.data?.message || t('Hiba történt a webshop törlése közben.'));
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

      const response = await apiClient.post(`${API_URL}/webshop`, newWebshop);
      
      if (response.data) {
        setNewWebshop({
          subject_name: '',
          paying_instrument: '',
          header_color_code: '#2196F3',
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
    document.body.style.overflow = 'hidden';
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateWebshop(editingWebshop, true)) {
      return;
    }
    
    try {
      await apiClient.put(`${API_URL}/webshop/${editingWebshop.webshop_id}`, editingWebshop);
      setSuccess(t('Webshop sikeresen frissítve!'));
      setIsEditModalOpen(false);
      document.body.style.overflow = 'unset';
      fetchWebshops();
    } catch (error) {
      console.error('Error updating webshop:', error.response?.data || error.message);
      setError(error.response?.data?.message || t('Hiba történt a webshop frissítése közben.'));
    }
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>{t('Előadói Irányítópult')}</h1>
        <p className="dashboard-subtitle">Kezeld webshopjaidat és termékeidet</p>
      </div>
      
      <div className="create-webshop-section">
        <div className="section-header">
          <h2>{t('Új Webshop Létrehozása')}</h2>
        </div>
        
        {error && <div className="message error-message">{error}</div>}
        {success && <div className="message success-message">{success}</div>}
        
        <form className="webshop-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject_name">{t('Tantárgy Neve')}</label>
              <input
                id="subject_name"
                name="subject_name"
                value={newWebshop.subject_name}
                onChange={(e) => handleInputChange(e, 'new')}
                placeholder="pl. Matematika"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="paying_instrument">{t('Pénznem')}</label>
              <input
                id="paying_instrument"
                name="paying_instrument"
                value={newWebshop.paying_instrument}
                onChange={(e) => handleInputChange(e, 'new')}
                placeholder="pl. PG, Ft"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paying_instrument_icon">{t('Pénznem Kép URL-je')}</label>
            <input
              id="paying_instrument_icon"
              name="paying_instrument_icon"
              value={newWebshop.paying_instrument_icon}
              onChange={(e) => handleInputChange(e, 'new')}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>{t('Fejléc színe')}</label>
            <div className="color-selector">
              <div className="preset-colors">
                {presetColors.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    className={`color-preset ${newWebshop.header_color_code === preset.color ? 'active' : ''}`}
                    style={{ backgroundColor: preset.color }}
                    onClick={() => handleColorSelect(preset.color, 'new')}
                    title={preset.name}
                  />
                ))}
              </div>
              
              <div className="custom-color">
                <label htmlFor="custom_color">{t('Egyedi szín:')}</label>
                <div className="custom-color-input">
                  <input
                    type="color"
                    id="custom_color"
                    value={newWebshop.header_color_code}
                    onChange={(e) => handleColorSelect(e.target.value, 'new')}
                  />
                  <div className="color-preview" style={{ backgroundColor: newWebshop.header_color_code }}>
                    <span>{newWebshop.header_color_code}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
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

          <button type="submit" className="submit-btn">
            {t('Létrehozás')}
          </button>
        </form>
      </div>

      <div className="webshops-section">
        <div className="section-header">
          <h2>{t('Webshopjaim')}</h2>
        </div>
        
        {webshops.length === 0 ? (
          <div className="no-webshops">
            <div className="no-webshops-icon">🏪</div>
            <p>{t('Még nincs létrehozott webshopod.')}</p>
          </div>
        ) : (
          <div className="webshop-grid">
            {webshops.map((webshop) => (
              <div key={webshop.webshop_id} className="webshop-card">
                <div 
                  className="webshop-card-header"
                  style={{ backgroundColor: webshop.header_color_code }}
                >
                  <h3>{webshop.subject_name}</h3>
                </div>
                <div className="webshop-card-body">
                  <div className="webshop-info">
                    <span className="info-label">{t('Pénznem')}:</span>
                    <span className="info-value">{webshop.paying_instrument}</span>
                  </div>
                  <div className="webshop-info">
                    <span className="info-label">{t('Státusz')}:</span>
                    <span className={`status-badge ${webshop.status}`}>
                      {webshop.status === 'active' ? t('Aktív') : t('Inaktív')}
                    </span>
                  </div>
                  <div className="webshop-actions">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEdit(webshop)}
                    >
                      ✏️ {t('Szerkesztés')}
                    </button>
                    <Link 
                      to={`/manage-products/${webshop.webshop_id}`} 
                      className="action-btn manage-btn"
                    >
                      📦 {t('Termékek kezelése')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditModalOpen && editingWebshop && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <h2 className="modal-title">{t('Webshop szerkesztése')}</h2>
            
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_subject_name">{t('Tantárgy Neve')}</label>
                  <input
                    id="edit_subject_name"
                    name="subject_name"
                    value={editingWebshop.subject_name}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit_paying_instrument">{t('Pénznem')}</label>
                  <input
                    id="edit_paying_instrument"
                    name="paying_instrument"
                    value={editingWebshop.paying_instrument}
                    onChange={(e) => handleInputChange(e, 'edit')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit_paying_instrument_icon">{t('Pénznem Kép URL-je')}</label>
                <input
                  id="edit_paying_instrument_icon"
                  name="paying_instrument_icon"
                  value={editingWebshop.paying_instrument_icon}
                  onChange={(e) => handleInputChange(e, 'edit')}
                />
              </div>

              <div className="form-group">
                <label>{t('Fejléc színe')}</label>
                <div className="color-selector">
                  <div className="preset-colors">
                    {presetColors.map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        className={`color-preset ${editingWebshop.header_color_code === preset.color ? 'active' : ''}`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => handleColorSelect(preset.color, 'edit')}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  
                  <div className="custom-color">
                    <label htmlFor="edit_custom_color">{t('Egyedi szín:')}</label>
                    <div className="custom-color-input">
                      <input
                        type="color"
                        id="edit_custom_color"
                        value={editingWebshop.header_color_code}
                        onChange={(e) => handleColorSelect(e.target.value, 'edit')}
                      />
                      <div className="color-preview" style={{ backgroundColor: editingWebshop.header_color_code }}>
                        <span>{editingWebshop.header_color_code}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
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

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {t('Frissítés')}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  {t('Mégse')}
                </button>
                <button 
                  type="button" 
                  className="delete-btn" 
                  onClick={() => handleDelete(editingWebshop.webshop_id)}
                >
                  {t('Webshop törlése')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;