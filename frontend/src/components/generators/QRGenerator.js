import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import GeneratedQRsList from '../lists/GeneratedQRsList';
import '../../css/generators/QRGenerator.css';

export default function QRGenerator({ onSuccess }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [webshops, setWebshops] = useState([]);
  const [formData, setFormData] = useState({
    webshop: null,
    maxActivations: 50,
    codeValue: '',
    expiryDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  // Minimum dátum beállítása holnapra
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    fetchWebshops();
  }, []);

  const fetchWebshops = async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.WEBSHOP}/my-webshops`);
      const activeShops = response.data.filter(shop => shop.status === 'active');
      setWebshops(activeShops);
    } catch (error) {
      console.error('Error fetching webshops:', error);
      setError(t('Hiba történt a webshopok betöltése közben.'));
    }
  };

  const handleWebshopSelect = (webshop) => {
    setFormData(prev => ({ ...prev, webshop }));
    setError('');
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const validateStep = () => {
    switch (step) {
      case 2:
        if (formData.maxActivations < 1 || formData.maxActivations > 10000) {
          setError(t('Az aktiválások száma 1 és 10000 között lehet.'));
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
        const selectedDate = new Date(formData.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) {
          setError(t('A lejárati dátumnak jövőbeli dátumnak kell lennie.'));
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
    if (!validateStep()) return;

    setLoading(true);
    setError('');
    
    try {
      const generationData = {
        webshopId: formData.webshop.webshop_id,
        maxActivations: parseInt(formData.maxActivations),
        codeValue: parseFloat(formData.codeValue),
        expiryDate: formData.expiryDate
      };

      const response = await apiClient.post(
        `${API_ENDPOINTS.BASE}/signature/generate-qr`,
        generationData,
        {
          responseType: 'blob'
        }
      );

      // PNG letöltés
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr_code_${Date.now()}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onSuccess(t('QR kód sikeresen generálva és letöltve!'));
      
      // Reset form
      setFormData({
        webshop: null,
        maxActivations: 50,
        codeValue: '',
        expiryDate: ''
      });
      setStep(1);
      setRefreshList(prev => prev + 1);
      
    } catch (error) {
      console.error('Error generating QR:', error);
      setError(error.response?.data?.message || t('Hiba történt a QR kód generálása közben.'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <div className="step-header">
              <h2>{t('1. Webshop kiválasztása')}</h2>
              <p>{t('Válaszd ki a webshopot, amelyhez QR kódot szeretnél generálni')}</p>
            </div>
            
            {webshops.length === 0 ? (
              <div className="no-webshops">
                <span className="no-webshops-icon">🏪</span>
                <p>{t('Nincs aktív webshop')}</p>
              </div>
            ) : (
              <div className="webshop-grid">
                {webshops.map((webshop) => (
                  <div
                    key={webshop.webshop_id}
                    className={`webshop-card ${formData.webshop?.webshop_id === webshop.webshop_id ? 'selected' : ''}`}
                    onClick={() => handleWebshopSelect(webshop)}
                  >
                    <div className="webshop-card-header" style={{ backgroundColor: webshop.header_color_code }}>
                      <h3>{webshop.subject_name}</h3>
                    </div>
                    <div className="webshop-card-body">
                      <div className="webshop-info">
                        <span className="info-label">{t('Pénznem')}:</span>
                        <span className="info-value">{webshop.paying_instrument}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="step-container">
            <div className="step-header">
              <h2>{t('2. Maximális aktiválások')}</h2>
              <p>{t('Hányan tudják aktiválni a QR kódot? (1-10000)')}</p>
            </div>
            
            <div className="form-group-large">
              <label htmlFor="maxActivations">{t('Maximális aktiválások száma')}</label>
              <input
                type="number"
                id="maxActivations"
                name="maxActivations"
                min="1"
                max="10000"
                value={formData.maxActivations}
                onChange={handleInputChange}
                className="input-large"
              />
              <span className="input-hint">
                {t('Az első N fő aktiválhatja, az N+1. személy már nem tudja használni')}
              </span>
            </div>

            <div className="step-actions">
              <button onClick={handleBack} className="btn-secondary">
                {t('Vissza')}
              </button>
              <button onClick={handleNext} className="btn-primary">
                {t('Következő')}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-container">
            <div className="step-header">
              <h2>{t('3. QR kód értéke')}</h2>
              <p>{t('Mennyi egyenleget adjon minden aktiválás?')}</p>
            </div>
            
            <div className="form-group-large">
              <label htmlFor="codeValue">{t('Érték aktiválásonként')}</label>
              <div className="input-with-currency">
                <input
                  type="number"
                  id="codeValue"
                  name="codeValue"
                  min="0.01"
                  step="0.01"
                  value={formData.codeValue}
                  onChange={handleInputChange}
                  className="input-large"
                />
                <span className="currency-label">{formData.webshop?.paying_instrument}</span>
              </div>
              <span className="input-hint">
                {t('Minden aktiválás ezt az értéket adja hozzá a felhasználó egyenlegéhez')}
              </span>
            </div>

            <div className="step-actions">
              <button onClick={handleBack} className="btn-secondary">
                {t('Vissza')}
              </button>
              <button onClick={handleNext} className="btn-primary">
                {t('Következő')}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-container">
            <div className="step-header">
              <h2>{t('4. Lejárati dátum')}</h2>
              <p>{t('Meddig legyen érvényes a QR kód?')}</p>
            </div>
            
            <div className="form-group-large">
              <label htmlFor="expiryDate">{t('Lejárati dátum')}</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                min={minDate}
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="input-large"
              />
              <span className="input-hint">
                {t('A lejárt QR kód automatikusan inaktiválódik')}
              </span>
            </div>

            <div className="summary-box">
              <h3>{t('Összegzés')}</h3>
              <div className="summary-item">
                <span className="summary-label">{t('Webshop')}:</span>
                <span className="summary-value">{formData.webshop?.subject_name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('Max aktiválások')}:</span>
                <span className="summary-value">{formData.maxActivations} fő</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('Érték/aktiválás')}:</span>
                <span className="summary-value">
                  {formData.codeValue} {formData.webshop?.paying_instrument}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('Lejárat')}:</span>
                <span className="summary-value">
                  {formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString('hu-HU') : '-'}
                </span>
              </div>
              <div className="summary-total">
                <span className="summary-label">{t('Maximális teljes érték')}:</span>
                <span className="summary-value-large">
                  {(formData.maxActivations * formData.codeValue).toFixed(2)} {formData.webshop?.paying_instrument}
                </span>
              </div>
            </div>

            <div className="step-actions">
              <button onClick={handleBack} className="btn-secondary">
                {t('Vissza')}
              </button>
              <button onClick={handleGenerate} className="btn-success" disabled={loading}>
                {loading ? t('Generálás...') : t('QR Kód Generálása')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="qr-generator">
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="progress-bar">
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className={`progress-step ${step >= num ? 'active' : ''} ${step === num ? 'current' : ''}`}
          >
            <div className="progress-circle">{num}</div>
            <span className="progress-label">
              {num === 1 && t('Webshop')}
              {num === 2 && t('Limit')}
              {num === 3 && t('Érték')}
              {num === 4 && t('Lejárat')}
            </span>
          </div>
        ))}
      </div>

      {renderStep()}

      <div className="separator">
        <span>{t('Generált QR Kódok')}</span>
      </div>

      <GeneratedQRsList key={refreshList} />
    </div>
  );
}