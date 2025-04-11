import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../css/ManageProducts.css';

const API_URL = 'http://api.pannon-shop.hu';

const ManageProducts = () => {
  const { t } = useTranslation();
  const { webshopId } = useParams();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    image: '',
    description: '',
    price: '',
    max_stock: '',
    current_stock: '',
    status: 'available'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [webshopId]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/product/webshop/${webshopId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(t('Hiba történt a termékek betöltése közben.'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!newProduct.name.trim()) return t('A termék neve kötelező.');
    if (!newProduct.category.trim()) return t('A kategória kötelező.');
    if (!newProduct.image.trim()) return t('A kép URL kötelező.');
    if (!newProduct.description.trim()) return t('A leírás kötelező.');
    if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) return t('Érvényes árat adjon meg.');
    if (isNaN(parseInt(newProduct.max_stock)) || parseInt(newProduct.max_stock) < 0) return t('Érvényes maximális készletet adjon meg.');
    if (isNaN(parseInt(newProduct.current_stock)) || parseInt(newProduct.current_stock) < 0) return t('Érvényes jelenlegi készletet adjon meg.');
    if (parseInt(newProduct.current_stock) > parseInt(newProduct.max_stock)) return t('A jelenlegi készlet nem lehet nagyobb, mint a maximális készlet.');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...newProduct,
        webshop_id: parseInt(webshopId),
        price: parseFloat(newProduct.price),
        max_stock: parseInt(newProduct.max_stock),
        current_stock: parseInt(newProduct.current_stock)
      };
      
      console.log('Sending product data:', productData);
    
      const response = await axios.post(`${API_URL}/product`, productData);
      
      console.log('Server response:', response.data);
      
      setNewProduct({
        name: '',
        category: '',
        image: '',
        description: '',
        price: '',
        max_stock: '',
        current_stock: '',
        status: 'available'
      });
      setSuccess(t('Termék sikeresen hozzáadva!'));
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error.message);
      setError(t('Hiba történt a termék létrehozása közben.') + ' ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="manage-products">
      <h1>{t('Termékek kezelése')}</h1>
      
      <div className="add-product-form">
        <h2>{t('Új termék hozzáadása')}</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder={t('Termék neve')}
            required
          />
          <input
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            placeholder={t('Kategória')}
            required
          />
          <input
            name="image"
            value={newProduct.image}
            onChange={handleInputChange}
            placeholder={t('Kép URL')}
            required
          />
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            placeholder={t('Leírás')}
            required
          />
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder={t('Ár')}
            required
            min="0"
            step="0.01"
          />
          <input
            type="number"
            name="max_stock"
            value={newProduct.max_stock}
            onChange={handleInputChange}
            placeholder={t('Maximális készlet')}
            required
            min="0"
          />
          <input
            type="number"
            name="current_stock"
            value={newProduct.current_stock}
            onChange={handleInputChange}
            placeholder={t('Jelenlegi készlet')}
            required
            min="0"
          />
          <select
            name="status"
            value={newProduct.status}
            onChange={handleInputChange}
            required
          >
            <option value="available">{t('Elérhető')}</option>
            <option value="unavailable">{t('Nem elérhető')}</option>
          </select>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('Mentés...') : t('Termék hozzáadása')}
          </button>
        </form>
      </div>

      <h2>{t('Meglévő termékek')}</h2>
      <div className="products-list">
        {products.map((product) => (
          <div key={product.product_id} className="product-item">
            <h3>{product.name}</h3>
            <p>{t('Kategória')}: {product.category}</p>
            <p>{t('Ár')}: {product.price}</p>
            <p>{t('Készlet')}: {product.current_stock} / {product.max_stock}</p>
            <p>{t('Státusz')}: {product.status === 'available' ? t('Elérhető') : t('Nem elérhető')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
