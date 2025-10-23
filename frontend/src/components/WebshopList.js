import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/WebshopList.css';
import { API_URL } from '../config/api';

const WebshopList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [webshops, setWebshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const patternTracker = React.useRef({
    lastUsedPatterns: []
  });

  useEffect(() => {
    const fetchWebshops = async () => {
      try {
        const response = await axios.get(`${API_URL}/webshop`);
        const filteredWebshops = response.data.filter(webshop => webshop.webshop_id !== 0);
        setWebshops(filteredWebshops);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching webshops:', error);
        setError(t('Hiba történt a webshopok betöltése közben.'));
        setLoading(false);
      }
    };

    fetchWebshops();
  }, [t]);

  const filteredWebshops = webshops.filter(webshop =>
    webshop.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========== ÚJ: Webshop kattintás kezelése ==========
  const handleWebshopClick = (webshopId) => {
    if (!isAuthenticated) {
      alert(t('Kérjük, jelentkezz be a webshop megtekintéséhez!'));
      navigate('/login');
      return;
    }
    navigate(`/shop/${webshopId}`);
  };

  // Segédfüggvény a szöveg színének meghatározásához a háttérszín alapján
  const getTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const adjustColor = (color, amount) => {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const addTransparency = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const patternDefinitions = useMemo(() => [
    // 0. Pontozott háló minta
    (color) => ({
      backgroundImage: `radial-gradient(circle, ${addTransparency(adjustColor(color, -40), 0.4)} 1px, transparent 1px)`,
      backgroundSize: '10px 10px'
    }),
    // 1. Csíkok minta
    (color) => ({
      backgroundImage: `repeating-linear-gradient(45deg, ${addTransparency(adjustColor(color, 30), 0.3)} 0px, ${addTransparency(adjustColor(color, 30), 0.3)} 10px, transparent 10px, transparent 20px)`,
    }),
    // 2. Kockás minta
    (color) => ({
      backgroundImage: `
        linear-gradient(${addTransparency(adjustColor(color, -30), 0.3)} 1px, transparent 1px),
        linear-gradient(90deg, ${addTransparency(adjustColor(color, -30), 0.3)} 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }),
    // 3. Átlós vonalak
    (color) => ({
      backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, ${addTransparency(adjustColor(color, 40), 0.3)} 10px, ${addTransparency(adjustColor(color, 40), 0.3)} 20px)`,
    }),
    // 4. Koncentrikus körök
    (color) => ({
      backgroundImage: `radial-gradient(circle, ${addTransparency(adjustColor(color, -40), 0.3)} 2px, transparent 2px)`,
      backgroundSize: '40px 40px'
    }),
    // 5. Hullámos minta
    (color) => ({
      backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, ${color} 10px, transparent 20px)`,
    }),
    // 6. Kereszt minta
    (color) => ({
      backgroundImage: `
        linear-gradient(${addTransparency(adjustColor(color, -30), 0.5)} 2px, transparent 2px),
        linear-gradient(90deg, ${addTransparency(adjustColor(color, -30), 0.5)} 2px, transparent 2px)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: 'center center'
    }),
    // 7. Hexagon minta
    (color) => ({
      backgroundImage: `repeating-linear-gradient(120deg, ${addTransparency(adjustColor(color, 20), 0.3)} 0px, ${addTransparency(adjustColor(color, 20), 0.3)} 1px, transparent 1px, transparent 10px)`,
    }),
    // 8. Kis pontok
    (color) => ({
      backgroundImage: `radial-gradient(${addTransparency(adjustColor(color, -50), 0.5)} 15%, transparent 16%)`,
      backgroundSize: '15px 15px',
      backgroundPosition: '0 0, 8px 8px'
    }),
    // 9. Zigzag minta
    (color) => ({
      backgroundImage: `linear-gradient(135deg, ${addTransparency(adjustColor(color, 30), 0.4)} 25%, transparent 25%), linear-gradient(225deg, ${addTransparency(adjustColor(color, 30), 0.4)} 25%, transparent 25%)`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 0'
    })
  ], []);

  const getRandomPattern = (webshopId) => {
    const availablePatterns = patternDefinitions.map((_, index) => index);
    const recentlyUsed = patternTracker.current.lastUsedPatterns;
    
    const availableChoices = availablePatterns.filter(p => !recentlyUsed.includes(p));
    
    const choices = availableChoices.length >= 3 ? availableChoices : availablePatterns;
    
    const selectedPattern = choices[Math.floor(Math.random() * choices.length)];
    
    patternTracker.current.lastUsedPatterns.push(selectedPattern);
    if (patternTracker.current.lastUsedPatterns.length > 5) {
      patternTracker.current.lastUsedPatterns.shift();
    }
    
    return selectedPattern;
  };

  const patternStyles = useMemo(() => {
    const styles = {};
    filteredWebshops.forEach(webshop => {
      const patternIndex = getRandomPattern(webshop.webshop_id);
      const patternFunc = patternDefinitions[patternIndex];
      styles[webshop.webshop_id] = patternFunc(webshop.header_color_code);
    });
    return styles;
  }, [filteredWebshops, patternDefinitions]);

  if (loading) {
    return <div className="loading">{t('Betöltés...')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="webshop-list-container">
      <h1>{t('Elérhető Webshopok')}</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder={t('Webshop keresése...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="webshop-grid">
        {filteredWebshops.length > 0 ? (
          filteredWebshops.map((webshop) => {
            const textColor = getTextColor(webshop.header_color_code);
            
            return (
              <div
                key={webshop.webshop_id} 
                className="webshop-card"
                style={{ 
                  backgroundColor: webshop.header_color_code,
                  color: textColor,
                  ...patternStyles[webshop.webshop_id],
                  cursor: 'pointer'
                }}
                onClick={() => handleWebshopClick(webshop.webshop_id)}
              >
                <div className="webshop-card-content" style={{ 
                  position: 'relative', 
                  zIndex: 1, 
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  <h2 style={{ color: textColor, marginBottom: '10px' }}>{webshop.subject_name}</h2>
                  <p style={{ color: textColor }}>{t('Pénznem')}: {webshop.paying_instrument}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>{t('Nincs találat')}</p>
        )}
      </div>
    </div>
  );
};

export default WebshopList;