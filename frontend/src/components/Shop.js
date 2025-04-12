import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../css/Shop.css';

const API_URL = 'https://api.pannon-shop.hu';

const Shop = () => {
  const { t } = useTranslation();
  const { webshopId = 0 } = useParams();
  const [webshop, setWebshop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [webshopResponse, productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${API_URL}/webshop/${webshopId}`),
          axios.get(`${API_URL}/product/webshop/${webshopId}`),
          axios.get(`${API_URL}/webshop/${webshopId}/categories`)
        ]);
        
        setWebshop(webshopResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setError(`${t('Nem sikerült betölteni a bolt adatait')}. ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [webshopId, t]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || product.category === selectedCategory)
  );

  if (loading) return <div>{t('Betöltés')}...</div>;
  if (error) return <div>{t('Hiba')}: {error}</div>;

  return (
    <div className="shop-container">
      <img 
        src={webshop?.paying_instrument_icon} 
        alt={webshop?.paying_instrument || 'Currency'} 
        className="paying-device" 
      />
      <div className="shop-content">
        <h1>{webshop?.subject_name}</h1>
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
            <option value="">{t('Minden kategória')}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.product_id} product={product} payingInstrument={webshop?.paying_instrument} />
            ))
          ) : (
            <p>{t('Nem található termék')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, payingInstrument }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(0);

  const handleQuantityChange = (change) => {
    setQuantity(prevQuantity => {
      const newQuantity = (parseInt(prevQuantity) || 0) + change;
      return Math.max(0, Math.min(newQuantity, product.current_stock)).toString();
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= product.current_stock)) {
      setQuantity(value);
    }
  };

  const handleBlur = () => {
    if (quantity === '') {
      setQuantity('0');
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{t('Ár')}: {product.price} {payingInstrument}</p>
      <p className="product-stock">{t('Elérhető')}: {product.current_stock}</p>
      <div className="quantity-control">
        <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
        <input 
          type="number" 
          min="0" 
          max={product.current_stock}
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
      </div>
      <button className="bookmarkBtn" onClick={() => {/* Kosárba helyezés logika - később implementálandó */}}>
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
