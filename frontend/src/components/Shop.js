import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import '../css/Shop.css';

const Shop = () => {
  const { t } = useTranslation();
  const { webshopId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [webshop, setWebshop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchWebshopData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webshopId]);

  const fetchWebshopData = async () => {
    try {
      const webshopResponse = await axios.get(`${API_URL}/webshop/${webshopId}`);
      setWebshop(webshopResponse.data);

      const productsResponse = await axios.get(`${API_URL}/product/webshop/${webshopId}`);
      setProducts(productsResponse.data);
      
      if (isAuthenticated && user) {
        try {
          const balanceResponse = await axios.get(`${API_URL}/user/${user.user_id}/balances`);
          const balances = balanceResponse.data;
          const currentBalance = balances.find(b => b.webshop.webshop_id === parseInt(webshopId));
          setBalance(currentBalance?.amount || 0);
        } catch (balanceError) {
          console.error('Error fetching balance:', balanceError);
          setBalance(0);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching webshop data:', err);
      setError(t('Nem sikerült betölteni a bolt adatait'));
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    if (!isAuthenticated) {
      alert(t('Kérjük, jelentkezz be a kosárba helyezéshez!'));
      navigate('/login');
      return;
    }

    if (quantity <= 0) {
      alert(t('Kérjük, válassz mennyiséget!'));
      return;
    }

    try {
      await axios.post(`${API_URL}/cart/${user.user_id}/${webshopId}`, {
        productId,
        quantity: parseInt(quantity)
      });
      
      alert(t('Termék hozzáadva a kosárhoz!'));
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || t('Hiba történt a kosárba helyezés közben');
      alert(errorMessage);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
  };

  const getDarkerShade = (color, amount = 20) => {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const getLighterShade = (color, amount = 40) => {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const getTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const isAvailable = product.status === 'available';
    return matchesSearch && matchesCategory && isAvailable;
  });

  if (loading) return <div className="loading">{t('Betöltés')}...</div>;
  if (error) return <div className="error">{t('Hiba')}: {error}</div>;
  if (!webshop) return <div>{t('Webshop nem található')}</div>;

  const headerColor = webshop.header_color_code;
  const darkerColor = getDarkerShade(headerColor, 30);
  const textColor = getTextColor(headerColor);
  const accentColor = headerColor;
  const lightAccent = getLighterShade(headerColor, 60);

  return (
    <div className="shop-container">
      <header 
        className="shop-header"
        style={{ 
          background: `linear-gradient(135deg, ${headerColor} 0%, ${darkerColor} 100%)`,
          color: textColor
        }}
      >
        <div className="header-content">
          <div className="header-text">
            <h1>{webshop.subject_name}</h1>
            <p className="header-subtitle">
              <span className="currency-label">{t('Pénznem')}:</span>
              <span className="currency-value">{webshop.paying_instrument}</span>
            </p>
          </div>
          {webshop.paying_instrument_icon && (
            <div className="header-icon-balance">
              <div className="header-icon">
                <img 
                  src={webshop.paying_instrument_icon} 
                  alt={webshop.paying_instrument}
                />
              </div>
              {isAuthenticated && (
                <div className="header-balance" style={{ color: textColor }}>
                  <span className="balance-amount">{balance}</span>
                  <span className="balance-currency">{webshop.paying_instrument}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="header-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,80 900,40 L1200,0 L1200,120 L0,120 Z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </header>

      <div className="shop-content">
        <div className="search-filter-section">
          <div className="search-box" style={{ borderColor: lightAccent }}>
            <svg className="search-icon" style={{ fill: accentColor }} viewBox="0 0 24 24" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input 
              type="text" 
              placeholder={t('Keresés a termékek között...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
                style={{ color: accentColor }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="category-pills">
            <button
              className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
              style={{
                backgroundColor: selectedCategory === 'all' ? accentColor : 'transparent',
                color: selectedCategory === 'all' ? textColor : '#666',
                borderColor: selectedCategory === 'all' ? accentColor : '#ddd'
              }}
            >
              <span className="pill-icon">🏪</span>
              {t('Minden kategória')}
            </button>
            {categories.filter(c => c !== 'all').map(category => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: selectedCategory === category ? accentColor : 'transparent',
                  color: selectedCategory === category ? textColor : '#666',
                  borderColor: selectedCategory === category ? accentColor : '#ddd'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                payingInstrument={webshop.paying_instrument}
                onAddToCart={addToCart}
                onOpenModal={openProductModal}
                accentColor={accentColor}
              />
            ))
          ) : (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <p>{t('Nem található termék')}</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          payingInstrument={webshop.paying_instrument}
          onClose={closeProductModal}
          onAddToCart={addToCart}
          accentColor={accentColor}
        />
      )}
    </div>
  );
};

const ProductCard = ({ product, payingInstrument, onAddToCart, onOpenModal, accentColor }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(0);

  const handleQuantityChange = (change) => {
    setQuantity(prevQuantity => {
      const newQuantity = (parseInt(prevQuantity) || 0) + change;
      return Math.max(0, Math.min(newQuantity, product.current_stock));
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(0);
    } else {
      const numValue = parseInt(value);
      if (numValue >= 0 && numValue <= product.current_stock) {
        setQuantity(numValue);
      }
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(product.product_id, quantity);
      setQuantity(0);
    }
  };

  return (
    <div className="product-card" onClick={() => onOpenModal(product)}>
      <div className="product-image-wrapper">
        <img 
          src={product.image} 
          alt={product.name}
          onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
        />
        <span className="product-category-badge" style={{ backgroundColor: accentColor }}>
          {product.category}
        </span>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price" style={{ color: accentColor }}>
          {product.price} {payingInstrument}
        </p>
        <p className="product-stock">
          <span className="stock-icon">📦</span>
          {t('Elérhető')}: {product.current_stock} db
        </p>
      </div>
      
      <div className="product-actions" onClick={(e) => e.stopPropagation()}>
        <div className="quantity-control">
          <button 
            className="quantity-btn" 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity === 0}
            style={{ borderColor: accentColor }}
          >
            -
          </button>
          <input 
            type="number" 
            min="0" 
            max={product.current_stock}
            value={quantity}
            onChange={handleInputChange}
          />
          <button 
            className="quantity-btn" 
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.current_stock}
            style={{ borderColor: accentColor }}
          >
            +
          </button>
        </div>
        
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={quantity === 0}
          style={{ 
            backgroundColor: quantity > 0 ? accentColor : '#ccc'
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span>{t('Kosárba')}</span>
        </button>
      </div>
    </div>
  );
};

const ProductModal = ({ product, payingInstrument, onClose, onAddToCart, accentColor }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change) => {
    setQuantity(prevQuantity => {
      const newQuantity = (parseInt(prevQuantity) || 0) + change;
      return Math.max(1, Math.min(newQuantity, product.current_stock));
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(1);
    } else {
      const numValue = parseInt(value);
      if (numValue >= 1 && numValue <= product.current_stock) {
        setQuantity(numValue);
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product.product_id, quantity);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-body">
          <div className="modal-image">
            <img 
              src={product.image} 
              alt={product.name}
              onError={(e) => e.target.src = 'https://via.placeholder.com/400'}
            />
          </div>
          
          <div className="modal-details">
            <h2>{product.name}</h2>
            <span className="modal-category" style={{ backgroundColor: accentColor }}>
              {product.category}
            </span>
            
            <p className="modal-description">{product.description}</p>
            
            <div className="modal-info">
              <p className="modal-price">
                {t('Ár')}: <strong style={{ color: accentColor }}>{product.price} {payingInstrument}</strong>
              </p>
              <p className="modal-stock">
                {t('Elérhető')}: <strong style={{ color: accentColor }}>{product.current_stock} db</strong>
              </p>
            </div>

            <div className="modal-quantity-control">
              <label>{t('Mennyiség')}:</label>
              <div className="quantity-control">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity === 1}
                  style={{ borderColor: accentColor }}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.current_stock}
                  value={quantity}
                  onChange={handleInputChange}
                />
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.current_stock}
                  style={{ borderColor: accentColor }}
                >
                  +
                </button>
              </div>
            </div>

            <button 
              className="modal-add-to-cart"
              onClick={handleAddToCart}
              style={{ backgroundColor: accentColor }}
            >
              {t('Kosárba helyezés')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;