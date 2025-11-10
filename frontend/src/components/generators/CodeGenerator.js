import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../../css/generators/CodeGenerator.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.pannon-shop.hu';

export default function CodeGenerator() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [webshops, setWebshops] = useState([]);
  const [formData, setFormData] = useState({
    webshop: null,
    codeCount: 1,
    codeValue: '',
    expiryDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Minimum dátum beállítása holnapra
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    fetchWebshops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWebshops = async () => {
    try {
      const response = await axios.get(`${API_URL}/webshop`);
      setWebshops(response.data.filter(shop => shop.status === 'active'));
    } catch (error) {
      console.error('Error fetching webshops:', error);
      setError(t('Hiba történt a webshopok betöltése közben.'));
    }
  };

  const handleWebshopSelect = (webshop) => {
    setFormData(prev => ({ ...prev, webshop }));
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 2:
        if (formData.codeCount < 1 || formData.codeCount > 100) {
          setError(t('A kódok száma 1 és 100 között lehet.'));
          return false;
        }
        break;
      case 3:
        if (!formData.codeValue || formData.codeValue <= 0) {
          setError(t('Kérjük adjon meg érvényes értéket.'));
          return false;
        }
        break;
      case 4:
        if (!formData.expiryDate) {
          setError(t('Kérjük válasszon lejárati dátumot.'));
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const generationData = {
        webshopId: formData.webshop.webshop_id,
        codeCount: formData.codeCount,
        codeValue: formData.codeValue,
        expiryDate: formData.expiryDate
      };

      await axios.post(`${API_URL}/generate-codes`, generationData);
      setSuccess(t('Kódok sikeresen generálva!'));
      setFormData({
        webshop: null,
        codeCount: 1,
        codeValue: '',
        expiryDate: ''
      });
      setStep(1);
    } catch (error) {
      setError(t('Hiba történt a kódok generálása közben.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-generator-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="step-content">
        {step === 1 && (
          <>
            <h2>{t('Webshop kiválasztása')}</h2>
            <div className="webshop-grid">
              {webshops.map((webshop) => (
                <div
                  key={webshop.webshop_id}
                  className={`webshop-card ${formData.webshop?.webshop_id === webshop.webshop_id ? 'selected' : ''}`}
                  onClick={() => handleWebshopSelect(webshop)}
                >
                  <h3>{webshop.subject_name}</h3>
                  <p>{t('Pénznem')}: {webshop.paying_instrument}</p>
                  <div className="color-preview">
                    <div className="color-box" style={{ backgroundColor: webshop.header_color_code }}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>{t('Kódok száma')}</h2>
            <div className="form-group">
              <label>{t('Generálandó kódok száma (1-100):')} </label>
              <input
                type="number"
                name="codeCount"
                min="1"
                max="100"
                value={formData.codeCount}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>{t('Érték megadása')}</h2>
            <div className="form-group">
              <label>
                {t('Kód értéke')} ({formData.webshop.paying_instrument}):
              </label>
              <input
                type="number"
                name="codeValue"
                min="1"
                value={formData.codeValue}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>{t('Lejárati dátum')}</h2>
            <div className="form-group">
              <label>{t('Lejárati dátum')}:</label>
              <input
                type="date"
                name="expiryDate"
                min={minDate}
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2>{t('Összegzés')}</h2>
            <div className="summary">
              <p><strong>{t('Választott webshop')}:</strong> {formData.webshop.subject_name}</p>
              <p><strong>{t('Kódok száma')}:</strong> {formData.codeCount}</p>
              <p><strong>{t('Kód értéke')}:</strong> {formData.codeValue} {formData.webshop.paying_instrument}</p>
              <p><strong>{t('Lejárati dátum')}:</strong> {new Date(formData.expiryDate).toLocaleDateString()}</p>
            </div>
          </>
        )}

        <div className="step-actions">
          {step > 1 && <button onClick={handleBack}>{t('Vissza')}</button>}
          {step < 5 && <button onClick={handleNext}>{t('Tovább')}</button>}
          {step === 5 && (
            <button 
              onClick={handleGenerate} 
              disabled={loading}
            >
              {loading ? t('Generálás...') : t('Generálás')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}