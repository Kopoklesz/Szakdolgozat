import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodeGenerator from './generators/CodeGenerator';
//import QRGenerator from './generators/QRGenerator';
//import DirectAdd from './generators/DirectAdd';
import '../css/SignatureGenerated.css';

export default function SignatureGenerated() {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState('code');
  const [success, setSuccess] = useState('');

  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="signature-generator">
      <div className="signature-header">
        <h1>{t('Aláírás Generálás')}</h1>
        <p className="signature-subtitle">{t('Válassz módszert az egyenleg hozzáadásához')}</p>
      </div>
      
      {success && (
        <div className="success-message">
          <span className="message-icon">✓</span>
          {success}
        </div>
      )}
      
      <div className="method-selector">
        <button 
          className={`method-button ${selectedMethod === 'code' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('code')}
        >
          <span className="method-icon">🎫</span>
          <span className="method-title">{t('Kód Generálás')}</span>
          <span className="method-desc">{t('Nyomtatható kódok')}</span>
        </button>
        <button 
          className={`method-button ${selectedMethod === 'qr' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('qr')}
        >
          <span className="method-icon">📱</span>
          <span className="method-title">{t('QR Kód')}</span>
          <span className="method-desc">{t('Mobilra optimalizált')}</span>
        </button>
        <button 
          className={`method-button ${selectedMethod === 'direct' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('direct')}
        >
          <span className="method-icon">💰</span>
          <span className="method-title">{t('Direkt Hozzáadás')}</span>
          <span className="method-desc">{t('Azonnali egyenleg')}</span>
        </button>
      </div>

      <div className="generator-content">
        {selectedMethod === 'code' && (
          <CodeGenerator onSuccess={handleSuccess} />
        )}

        {selectedMethod === 'qr' && (
          <QRGenerator onSuccess={handleSuccess} />
        )}

        {selectedMethod === 'direct' && (
          <DirectAdd onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}