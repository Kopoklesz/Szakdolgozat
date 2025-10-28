import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../config/axios';
import '../css/ManagePartners.css';
import { API_URL } from '../config/api';

const ManagePartners = () => {
  const { t } = useTranslation();
  const { webshopId } = useParams();
  const navigate = useNavigate();
  
  const [webshop, setWebshop] = useState(null);
  const [partners, setPartners] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebshopData();
    fetchPartners();
    fetchAvailableTeachers();
  }, [webshopId]);

  const fetchWebshopData = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/webshop/${webshopId}`);
      setWebshop(response.data);
    } catch (error) {
      console.error('Error fetching webshop:', error);
      setError(t('Hiba történt a webshop betöltése közben.'));
    }
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_URL}/webshop/${webshopId}/partners`);
      // Biztonsági ellenőrzés
      const partnersData = Array.isArray(response.data) ? response.data : [];
      setPartners(partnersData);
    } catch (error) {
      console.error('Error fetching partners:', error);
      if (error.response?.status === 403) {
        setError(t('Nincs jogosultságod a partnerek megtekintéséhez.'));
      } else {
        setError(t('Hiba történt a partnerek betöltése közben.'));
      }
      setPartners([]); // Üres tömb hiba esetén
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/auth/users`);
      const allUsers = Array.isArray(response.data) ? response.data : [];
      
      // Szűrjük ki a tanárokat és adminokat, biztonságos módon
      const teachers = allUsers.filter(user => 
        user && (user.role === 'teacher' || user.role === 'admin')
      );
      
      setAvailableTeachers(teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setAvailableTeachers([]); // Üres tömb hiba esetén
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTeacherId) {
      setError(t('Válassz egy tanárt a partnerek közé!'));
      return;
    }

    try {
      await apiClient.post(`${API_URL}/webshop/${webshopId}/partners`, {
        partner_teacher_id: parseInt(selectedTeacherId)
      });
      
      setSuccess(t('Partner sikeresen hozzáadva!'));
      setIsAddModalOpen(false);
      setSelectedTeacherId('');
      fetchPartners();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding partner:', error);
      setError(error.response?.data?.message || t('Hiba történt a partner hozzáadása közben.'));
    }
  };

  const handleRemovePartner = async (partnerId) => {
    if (!window.confirm(t('Biztosan el szeretnéd távolítani ezt a partnert?'))) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await apiClient.delete(`${API_URL}/webshop/${webshopId}/partners/${partnerId}`);
      setSuccess(t('Partner sikeresen eltávolítva!'));
      fetchPartners();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing partner:', error);
      setError(error.response?.data?.message || t('Hiba történt a partner eltávolítása közben.'));
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedTeacherId('');
    document.body.style.overflow = 'unset';
  };

  // Szűrjük ki azokat a tanárokat, akik már partnerek vagy az owner
  const getFilteredTeachers = () => {
    if (!webshop || !Array.isArray(availableTeachers) || !Array.isArray(partners)) {
      return [];
    }
    
    const partnerIds = partners.map(p => p?.user_id).filter(id => id !== undefined);
    const ownerId = webshop.teacher_id;
    
    return availableTeachers.filter(teacher => 
      teacher && 
      teacher.user_id && 
      teacher.user_id !== ownerId && 
      !partnerIds.includes(teacher.user_id)
    );
  };

  if (loading && !webshop) {
    return (
      <div className="manage-partners">
        <div className="loading">{t('Betöltés...')}</div>
      </div>
    );
  }

  return (
    <div className="manage-partners">
      <div className="partners-header">
        <button className="back-btn" onClick={() => navigate('/teacher')}>
          ← {t('Vissza')}
        </button>
        <h1>{t('Partner Kezelés')}</h1>
        {webshop && webshop.subject_name && (
          <p className="webshop-name">
            {webshop.subject_name}
          </p>
        )}
      </div>

      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}

      <div className="partners-section">
        <div className="section-header">
          <h2>{t('Jelenlegi Partnerek')}</h2>
          <button className="add-partner-btn" onClick={openAddModal}>
            + {t('Partner Hozzáadása')}
          </button>
        </div>

        {loading ? (
          <div className="loading">{t('Betöltés...')}</div>
        ) : partners.length === 0 ? (
          <div className="no-partners">
            <p>{t('Még nincsenek partnerek ehhez a webshophoz.')}</p>
            <button className="add-first-partner-btn" onClick={openAddModal}>
              {t('Adj hozzá egy partnert!')}
            </button>
          </div>
        ) : (
          <div className="partners-grid">
            {partners.map((partner) => {
              // Biztonsági ellenőrzés minden partner objektumra
              if (!partner || !partner.user_id) {
                return null;
              }
              
              return (
                <div key={partner.user_id} className="partner-card">
                  <div className="partner-info">
                    <div className="partner-avatar">
                      {partner.username ? partner.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="partner-details">
                      <h3>{partner.username || 'N/A'}</h3>
                      <p className="partner-email">{partner.email || 'N/A'}</p>
                      <span className="partner-role">
                        {partner.role === 'admin' ? t('Admin') : t('Tanár')}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="remove-partner-btn"
                    onClick={() => handleRemovePartner(partner.user_id)}
                  >
                    {t('Eltávolítás')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Owner információ */}
      {webshop && webshop.teacher && (
        <div className="owner-section">
          <div className="section-header">
            <h2>{t('Tulajdonos')}</h2>
          </div>
          <div className="owner-card">
            <div className="owner-info">
              <div className="owner-avatar">
                {webshop.teacher.username ? webshop.teacher.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="owner-details">
                <h3>{webshop.teacher.username || 'N/A'}</h3>
                <p className="owner-email">{webshop.teacher.email || 'N/A'}</p>
                <span className="owner-badge">{t('Tulajdonos')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner hozzáadás modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAddModal}>×</button>
            <h2 className="modal-title">{t('Partner Hozzáadása')}</h2>
            
            <form onSubmit={handleAddPartner}>
              <div className="form-group">
                <label htmlFor="teacher_select">{t('Válassz tanárt')}</label>
                <select
                  id="teacher_select"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  required
                >
                  <option value="">{t('-- Válassz --')}</option>
                  {getFilteredTeachers().map((teacher) => {
                    if (!teacher || !teacher.user_id) return null;
                    
                    return (
                      <option key={teacher.user_id} value={teacher.user_id}>
                        {teacher.username || 'N/A'} ({teacher.email || 'N/A'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {getFilteredTeachers().length === 0 && (
                <p className="no-teachers-message">
                  {t('Nincs több elérhető tanár, akit hozzá lehetne adni partnerként.')}
                </p>
              )}

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={getFilteredTeachers().length === 0}
                >
                  {t('Hozzáadás')}
                </button>
                <button type="button" className="cancel-btn" onClick={closeAddModal}>
                  {t('Mégse')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePartners;