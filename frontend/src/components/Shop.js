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

  useEffect(() => {
    fetchWebshopData();
  }, [webshopId]);

  const fetchWebshopData = async () => {
    try {
      const webshopResponse = await axios.get(`${API_URL}/webshop/${webshopId}`);
      setWebshop(webshopResponse.data);

      const productsResponse = await axios.get(`${API_URL}/product/webshop/${webshopId}`);
      setProducts(productsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching webshop data:', err);
      setError(t('Nem sikerült betölteni a bolt adatait'));
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    // Ellenőrizzük, hogy be van-e jelentkezve
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

  // Kategóriák lekérése
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Szűrés
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const isAvailable = product.status === 'available';
    return matchesSearch && matchesCategory && isAvailable;
  });

  if (loading) return <div className="loading">{t('Betöltés')}...</div>;
  if (error) return <div className="error">{t('Hiba')}: {error}</div>;
  if (!webshop) return <div>{t('Webshop nem található')}</div>;

  return (
    <div className="shop-container" style={{ backgroundColor: webshop.header_color_code + '20' }}>
      <header style={{ backgroundColor: webshop.header_color_code }}>
        <h1>{webshop.subject_name}</h1>
        <p>{t('Pénznem')}: {webshop.paying_instrument}</p>
      </header>

      <div className="shop-content">
        {webshop.paying_instrument_icon && (
          <img 
            src={webshop.paying_instrument_icon} 
            alt={webshop.paying_instrument}
            className="paying-device"
          />
        )}

        <div className="search-filter">
          <input 
            type="text" 
            placeholder={t('Termék keresés...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">{t('Minden kategória')}</option>
            {categories.filter(c => c !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                payingInstrument={webshop.paying_instrument}
                onAddToCart={addToCart}
              />
            ))
          ) : (
            <p>{t('Nem található termék')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, payingInstrument, onAddToCart }) => {
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
      setQuantity(0); // Reset mennyiség sikeres hozzáadás után
    }
  };

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name}
        onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
      />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{t('Ár')}: {product.price} {payingInstrument}</p>
      <p className="product-stock">{t('Elérhető')}: {product.current_stock}</p>
      
      <div className="quantity-control">
        <button 
          className="quantity-btn" 
          onClick={() => handleQuantityChange(-1)}
          disabled={quantity === 0}
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
        >
          +
        </button>
      </div>
      
      <button 
        className="bookmarkBtn" 
        onClick={handleAddToCart}
        disabled={quantity === 0}
      >
        <span className="IconContainer">
          <svg viewBox="0 0 24 24" height="0.9em" className="icon">
            <path d="M7 4h14l-1.5 9H8.5L7 4zm0 2l1.5 8h10l1.5-8H7zM4 2h2l1 2h12l1-2h2v2H4V2z"></path>
          </svg>
        </span>
        <p className="text">{t('Kosárba')}</p>
      </button>
    </div>
  );
};

export default Shop;