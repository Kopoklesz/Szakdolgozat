import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import '../css/Auth.css';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: []
  });

  // Jelszó validáció valós időben
  useEffect(() => {
    if (formData.password) {
      const validation = authService.validatePassword(formData.password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Mező specifikus hiba törlése
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Neptune kód validáció
    const neptuneValidation = authService.validateNeptuneCode(formData.username);
    if (!neptuneValidation.isValid) {
      newErrors.username = neptuneValidation.error;
    }

    // Email validáció
    if (!formData.email) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else {
      const emailValidation = authService.validateEmailDomain(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error;
      }
    }

    // Jelszó validáció
    if (!formData.password) {
      newErrors.password = 'A jelszó megadása kötelező';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'A jelszó nem felel meg a követelményeknek';
    }

    // Jelszó megerősítés
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Regisztráció
    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.rememberMe
    );

    if (result.success) {
      // Sikeres regisztráció - átirányítás
      navigate('/webshops');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>{t('Regisztráció')}</h2>

      {error && <div className="error-message">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">
            {t('Neptune kód')}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="ABC123"
            maxLength={6}
            className={errors.username ? 'error' : ''}
            disabled={loading}
          />
          {errors.username && <div className="field-error">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            {t('Email cím')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="neptun@student.uni-pannon.hu"
            className={errors.email ? 'error' : ''}
            disabled={loading}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">
            {t('Jelszó')}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('Jelszó')}
            className={errors.password ? 'error' : ''}
            disabled={loading}
          />
          {errors.password && <div className="field-error">{errors.password}</div>}
          
          {formData.password && (
            <div className="password-requirements">
              <strong>{t('Jelszó követelmények:')}</strong>
              <ul>
                <li className={formData.password.length >= 8 ? 'valid' : ''}>
                  {t('Legalább 8 karakter')}
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                  {t('Legalább egy nagybetű')}
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                  {t('Legalább egy kisbetű')}
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                  {t('Legalább egy szám')}
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>
                  {t('Legalább egy speciális karakter')}
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            {t('Jelszó megerősítése')}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('Jelszó megerősítése')}
            className={errors.confirmPassword ? 'error' : ''}
            disabled={loading}
          />
          {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="rememberMe">
            {t('Emlékezz rám')}
          </label>
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? t('Regisztráció...') : t('Regisztráció')}
        </button>
      </form>

      <div className="auth-link">
        {t('Már van fiókod?')} <Link to="/login">{t('Jelentkezz be itt')}</Link>
      </div>
    </div>
  );
}

export default Register;