import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import '../../css/lists/GeneratedCodesList.css';

export default function GeneratedCodesList() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [openEventId, setOpenEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGeneratedCodes();
  }, []);

  const fetchGeneratedCodes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.BASE}/signature/my-codes`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching codes:', error);
      setError(t('Hiba történt a kódok betöltése közben.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm(t('Biztosan törölni szeretnéd ezt a kódot?'))) {
      return;
    }

    try {
      await apiClient.delete(`${API_ENDPOINTS.BASE}/signature/code/${codeId}`);
      fetchGeneratedCodes(); // Refresh list
    } catch (error) {
      console.error('Error deleting code:', error);
      alert(t('Hiba történt a kód törlése közben.'));
    }
  };

  const toggleEvent = (eventId) => {
    setOpenEventId(openEventId === eventId ? null : eventId);
  };

  const isExpired = (date) => {
    return new Date(date) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="list-loading">
        <div className="loading-spinner"></div>
        <p>{t('Betöltés...')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="list-error">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="list-empty">
        <span className="empty-icon">📋</span>
        <p>{t('Még nincsenek generált kódok.')}</p>
      </div>
    );
  }

  return (
    <div className="generated-codes-list">
      {events.map((event, index) => {
        const expired = isExpired(event.expiryDate);
        const usedCount = event.codes.filter(c => c.isRedeemed).length;
        const unusedCount = event.totalCodes - usedCount;

        return (
          <div key={event.eventId} className="code-event">
            <div
              className={`event-header ${openEventId === event.eventId ? 'open' : ''}`}
              onClick={() => toggleEvent(event.eventId)}
            >
              <div className="event-main-info">
                <div className="event-title">
                  <span className="event-name">{event.webshopName}</span>
                  <span className="event-badge">#{index + 1}</span>
                </div>
                <div className="event-stats">
                  <span className="stat-item">
                    <span className="stat-label">{t('Kódok')}:</span>
                    <span className="stat-value">{event.totalCodes} db</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">{t('Érték')}:</span>
                    <span className="stat-value">{event.codeValue} Ft</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">{t('Használt')}:</span>
                    <span className="stat-value used">{usedCount}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">{t('Szabad')}:</span>
                    <span className="stat-value free">{unusedCount}</span>
                  </span>
                </div>
              </div>

              <div className="event-meta">
                <span className="event-date">{t('Létrehozva')}: {formatDate(event.createdAt)}</span>
                <span className={`expiry-badge ${expired ? 'expired' : 'valid'}`}>
                  {expired ? t('Lejárt') : t('Érvényes')} - {formatDate(event.expiryDate)}
                </span>
                <span className="chevron-icon">
                  {openEventId === event.eventId ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {openEventId === event.eventId && (
              <div className="event-details">
                <div className="codes-table-container">
                  <table className="codes-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('Kód')}</th>
                        <th>{t('Státusz')}</th>
                        <th>{t('Beváltva')}</th>
                        <th>{t('Időpont')}</th>
                        <th>{t('Művelet')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.codes.map((code, idx) => (
                        <tr key={code.codeId} className={code.isRedeemed ? 'redeemed' : ''}>
                          <td>{idx + 1}</td>
                          <td>
                            <span className="code-value">{code.code}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${code.isRedeemed ? 'used' : 'unused'}`}>
                              {code.isRedeemed ? t('Felhasználva') : t('Szabad')}
                            </span>
                          </td>
                          <td>{code.redeemedBy || '-'}</td>
                          <td>{code.redeemedAt ? formatDate(code.redeemedAt) : '-'}</td>
                          <td>
                            {!code.isRedeemed && (
                              <button
                                onClick={() => handleDeleteCode(code.codeId)}
                                className="delete-code-btn"
                                title={t('Kód törlése')}
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}