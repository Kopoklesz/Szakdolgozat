import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodeGenerator from './generators/CodeGenerator';
//import QRGenerator from './generators/QRGenerator';
import GeneratedCodesList from './lists/GeneratedCodesList';
//import InstantGenerator from './generators/InstantGenerator';

import '../css/SignatureGenerated.css';

export default function SignatureGenerated() {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState('code');
  const [success, setSuccess] = useState('');

  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="signature-generator">
      <h2>{t('Aláírás Generálás')}</h2>
      
      {success && <div className="success-message">{success}</div>}
      
      <div className="method-selector">
        <button 
          className={`method-button ${selectedMethod === 'code' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('code')}
        >
          {t('Kód Generálás')}
        </button>
        <button 
          className={`method-button ${selectedMethod === 'qr' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('qr')}
        >
          {t('QR Kód')}
        </button>
        <button 
          className={`method-button ${selectedMethod === 'instant' ? 'active' : ''}`}
          onClick={() => setSelectedMethod('instant')}
        >
          {t('Azonnali Hozzáadás')}
        </button>
      </div>

      <div className="generator-content">
        {selectedMethod === 'code' && (
          <>
            <div className="code-generator-section">
              <CodeGenerator onSuccess={handleSuccess} />
              <GeneratedCodesList />
            </div>
          </>
        )}

{/*
  {selectedMethod === 'qr' && (
    <div className="qr-generator-section">
      <QRGenerator onSuccess={handleSuccess} />
    </div>
  )}

  {selectedMethod === 'instant' && (
    <div className="instant-generator-section">
      <InstantGenerator onSuccess={handleSuccess} />
    </div>
  )}
*/}
      </div>
    </div>
  );
}