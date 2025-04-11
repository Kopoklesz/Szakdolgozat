import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../css/WebshopList.css';

const API_URL = 'http://api.pannon-shop.hu';

const WebshopList = () => {
  const { t } = useTranslation();
  const [webshops, setWebshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ezeket a változókat a komponens státuszban tároljuk, 
  // de nem használjuk renderelésre
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

  // Segédfüggvény a szöveg színének meghatározásához a háttérszín alapján
  const getTextColor = (backgroundColor) => {
    // Átalakítjuk a hex színkódot RGB-re
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Kiszámoljuk a fényerőt (brightness)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Ha a háttér világos, fekete szöveget használunk, egyébként fehéret
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Függvény a hex színkód módosításához (világosabbá vagy sötétebbé tételéhez)
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

  // Átlátszóság hozzáadása hex színhez
  const addTransparency = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Mintadefiníciók tömbjét csak egyszer hozzuk létre
  const patternDefinitions = useMemo(() => [
    // 0. Párhuzamos vonalak
    (color) => {
      const lighter = adjustColor(color, 20);
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, ${lighter} 10px, ${lighter} 20px)`
      };
    },
    // 1. Pontozott minta
    (color) => {
      const lighter = adjustColor(color, 30);
      return {
        backgroundImage: `radial-gradient(circle, ${lighter} 2px, ${color} 2px, ${color} 8px, ${lighter} 8px)`
      };
    },
    // 2. Sakktábla minta
    (color) => {
      const lighter = adjustColor(color, 25);
      return {
        backgroundImage: `repeating-conic-gradient(${color} 0% 25%, ${lighter} 0% 50%)`
      };
    },
    // 3. Hullámos minta
    (color) => {
      const lighter = adjustColor(color, 15);
      return {
        backgroundImage: `linear-gradient(0deg, ${color} 50%, ${lighter} 50%, ${lighter} 52%, ${color} 52%, ${color} 85%, ${lighter} 85%, ${lighter} 95%, ${color} 95%)`
      };
    },
    // 4. Textúrált háttér
    (color) => {
      const darker = adjustColor(color, -15);
      return {
        backgroundImage: `linear-gradient(120deg, ${color}, ${darker})`
      };
    },
    // 5. Átlós csíkok
    (color) => {
      const lighter = adjustColor(color, 20);
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${color}, ${color} 5px, ${lighter} 5px, ${lighter} 10px)`
      };
    },
    // 6. Pöttyös minta
    (color) => {
      const lighter = adjustColor(color, 25);
      return {
        backgroundImage: `radial-gradient(${lighter} 3px, transparent 3px), radial-gradient(${lighter} 3px, ${color} 3px)`,
        backgroundSize: '16px 16px, 16px 16px',
        backgroundPosition: '0 0, 8px 8px'
      };
    },
    // 7. Rácsos minta
    (color) => {
      const lighter = adjustColor(color, 20);
      return {
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, ${lighter} 1px)`,
        backgroundSize: '20px 20px'
      };
    },
    // 8. Kaptár (Honeycomb) minta
    (color) => {
      const lighter = adjustColor(color, 25);
      return {
        backgroundImage: `
          linear-gradient(${lighter} 0.1px, transparent 0.1px),
          linear-gradient(60deg, ${color} 0.1px, ${lighter} 0.1px),
          linear-gradient(120deg, ${color} 0.1px, ${lighter} 0.1px)
        `,
        backgroundSize: '30px 52px',
        backgroundPosition: '0 0, 0 0, 0 0',
      };
    },
    // 9. Geometrikus minta (Memphis stílus)
    (color) => {
      const lighter = adjustColor(color, 25);
      const darker = adjustColor(color, -15);
      return {
        backgroundImage: `
          radial-gradient(circle at 25px 25px, ${lighter} 2%, transparent 3%),
          radial-gradient(circle at 75px 75px, ${lighter} 2%, transparent 3%),
          radial-gradient(circle at 100px 25px, ${darker} 2%, transparent 3%)
        `,
        backgroundSize: '100px 100px',
        backgroundPosition: '0 0, 0 0, 0 0',
      };
    },      
    // 10. Gradiens hullámos átmenet
    (color) => {
      const secondaryColor = adjustColor(color, -40);
      return {
        backgroundImage: `
          linear-gradient(${color} 50%, ${secondaryColor} 50%)
        `,
        backgroundSize: '100% 20px'
      };
    },     
    // 11. Bauhaus inspirált minta
    (color) => {
      const contrastColor = getTextColor(color) === '#000000' ? '#333333' : '#FFFFFF';
      const translucentContrast = addTransparency(contrastColor, 0.1);
      return {
        backgroundImage: `
          radial-gradient(circle at 40px 40px, ${translucentContrast} 10px, transparent 10px),
          linear-gradient(to right, ${translucentContrast} 2px, transparent 2px),
          linear-gradient(to bottom, ${translucentContrast} 2px, transparent 2px)
        `,
        backgroundSize: '80px 80px, 40px 40px, 40px 40px',
      };
    },    
    // 12. Skandináv minimalizmus
    (color) => {
      const lighter = adjustColor(color, 35);
      return {
        backgroundImage: `
          linear-gradient(to right, ${color}, ${color} 15px, ${lighter} 15px, ${lighter})
        `,
        backgroundSize: '80px 100%',
      };
    },     
    // 13. Japán inspirált cikk-cakk minta (Seigaiha)
    (color) => {
      const lighter = adjustColor(color, 20);
      return {
        backgroundImage: `
          radial-gradient(circle at 0 50%, transparent 25%, ${lighter} 25%, ${lighter} 30%, transparent 30%, transparent 100%),
          radial-gradient(circle at 100% 50%, transparent 25%, ${lighter} 25%, ${lighter} 30%, transparent 30%, transparent 100%)
        `,
        backgroundSize: '40px 40px, 40px 40px',
        backgroundPosition: '0 0, 20px 0',
      };
    },
    // 15. 3D kocka hatás
    (color) => {
      const lighter = adjustColor(color, 30);
      const darker = adjustColor(color, -40);
      return {
        backgroundImage: `
          linear-gradient(45deg, ${darker} 25%, transparent 25%, transparent 75%, ${darker} 75%, ${darker}),
          linear-gradient(45deg, ${darker} 25%, ${color} 25%, ${color} 75%, ${darker} 75%, ${darker})
        `,
        backgroundPosition: '0 0, 15px 15px',
        backgroundSize: '30px 30px',
      };
    },  
    // 16. Tech-inspirált áramkör minta
    (color) => {
      const lighter = adjustColor(color, 40);
      const translucentLight = addTransparency(lighter, 0.5);
      return {
        backgroundImage: `
          linear-gradient(0deg, ${color} 2px, transparent 2px),
          linear-gradient(90deg, ${color} 2px, transparent 2px),
          linear-gradient(0deg, ${translucentLight} 1px, transparent 1px),
          linear-gradient(90deg, ${translucentLight} 1px, transparent 1px)
        `,
        backgroundPosition: '0 0, 0 0, 15px 15px, 15px 15px',
        backgroundSize: '60px 60px, 60px 60px, 15px 15px, 15px 15px',
      };
    },
  ], []);

  // Függvény a minták előkészítésére a renderelés előtt
  // Ez nem okoz újrarenderelést, mivel ez csak a kezdeti renderelés előtt fut le
  const preparePatterns = () => {
    const webshopPatterns = {};
    
    filteredWebshops.forEach(webshop => {
      let newPatternIndex;
      do {
        newPatternIndex = Math.floor(Math.random() * patternDefinitions.length);
      } while (patternTracker.current.lastUsedPatterns.includes(newPatternIndex));
      
      patternTracker.current.lastUsedPatterns.push(newPatternIndex);
      if (patternTracker.current.lastUsedPatterns.length > 2) {
        patternTracker.current.lastUsedPatterns.shift();
      }
      
      // Elmentjük a mintát a webshophoz
      webshopPatterns[webshop.webshop_id] = patternDefinitions[newPatternIndex](webshop.header_color_code);
    });
    
    return webshopPatterns;
  };
  
  // Ez a változó csak egyszer fut le a renderelés alatt
  const patternStyles = useMemo(() => preparePatterns(), [filteredWebshops, patternDefinitions]);

  if (loading) return <div>{t('Betöltés')}...</div>;
  if (error) return <div>{t('Hiba')}: {error}</div>;

  return (
    <div className="webshop-list-container">
      <h1>{t('Elérhető Webshopok')}</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder={t('Webshop keresése...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="webshop-search-input"
        />
      </div>
      <div className="webshop-grid">
        {filteredWebshops.length > 0 ? (
          filteredWebshops.map((webshop) => {
            const textColor = getTextColor(webshop.header_color_code);
            
            return (
              <Link 
                to={`/shop/${webshop.webshop_id}`} 
                key={webshop.webshop_id} 
                className="webshop-card"
                style={{ 
                  backgroundColor: webshop.header_color_code,
                  color: textColor,
                  ...patternStyles[webshop.webshop_id]
                }}
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
              </Link>
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
