import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../../css/lists/GeneratedCodesList.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.pannon-shop.hu';

const GeneratedCodesList = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [openEventId, setOpenEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGeneratedCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    refreshList: fetchGeneratedCodes
  }));

  const fetchGeneratedCodes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/generated-codes`);
      setGeneratedCodes(response.data);
    } catch (error) {
      console.error('Error fetching codes:', error);
      setError(t('Hiba történt a kódok betöltése közben.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventId) => {
    setOpenEventId(openEventId === eventId ? null : eventId);
  };

  const isDateExpired = (date) => {
    return new Date(date) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="empty-state">{t('Betöltés...')}</div>;
  if (error) return <div className="empty-state error">{error}</div>;
  if (generatedCodes.length === 0) return <div className="empty-state">{t('Még nincsenek generált kódok.')}</div>;

  return (
    <div className="generated-codes">
      {generatedCodes.map((event, index) => (
        <div key={event.eventId} className="code-event">
          <div 
            className={`event-header ${openEventId === event.eventId ? 'active' : ''}`}
            onClick={() => toggleEvent(event.eventId)}
          >
            <div className="event-name">
              {event.webshopName}
              <span className="event-count">#{index + 1}</span>
            </div>
            <div>{event.totalCodes} {t('kód')}</div>
            <div>{formatDate(event.createdAt)}</div>
            <div className={`expiry-date ${isDateExpired(event.expiryDate) ? 'expired' : 'valid'}`}>
              {formatDate(event.expiryDate)}
            </div>
            <div className={`chevron-icon ${openEventId === event.eventId ? 'open' : ''}`}>
              ▼
            </div>
          </div>
          <div className={`event-details ${openEventId === event.eventId ? 'open' : ''}`}>
            <table className="codes-table">
              <thead>
                <tr>
                  <th>{t('Kód')}</th>
                  <th>{t('Státusz')}</th>
                  <th>{t('Érték')}</th>
                  <th>{t('Létrehozva')}</th>
                  <th>{t('Lejárat')}</th>
                </tr>
              </thead>
              <tbody>
                {event.codes.map((code) => (
                  <tr key={code.code}>
                    <td>{code.code}</td>
                    <td>
                      <span className={`code-status ${code.used ? 'used' : 'unused'}`}>
                        {code.used ? t('Felhasználva') : t('Aktív')}
                      </span>
                    </td>
                    <td>{code.value} {event.payingInstrument}</td>
                    <td>{formatDate(event.createdAt)}</td>
                    <td className={`expiry-date ${isDateExpired(event.expiryDate) ? 'expired' : 'valid'}`}>
                      {formatDate(event.expiryDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
});

export default GeneratedCodesList;