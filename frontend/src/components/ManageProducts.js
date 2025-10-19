import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_URL } from '../config';
import '../css/ManageProducts.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.pannon-shop.hu';

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
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleInputChange = (e, type = 'new') => {
    const { name, value } = e.target;
    if (type === 'new') {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    } else {
      setEditingProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (productData) => {
    if (!productData.name.trim()) return t('A termék neve kötelező.');
    if (!productData.category.trim()) return t('A kategória kötelező.');
    if (!productData.image.trim()) return t('A kép URL kötelező.');
    if (!productData.description.trim()) return t('A leírás kötelező.');
    if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) 
      return t('Érvényes árat adjon meg.');
    if (isNaN(parseInt(productData.max_stock)) || parseInt(productData.max_stock) < 0) 
      return t('Érvényes maximális készletet adjon meg.');
    if (isNaN(parseInt(productData.current_stock)) || parseInt(productData.current_stock) < 0) 
      return t('Érvényes jelenlegi készletet adjon meg.');
    if (parseInt(productData.current_stock) > parseInt(productData.max_stock)) 
      return t('A jelenlegi készlet nem lehet nagyobb, mint a maximális készlet.');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm(newProduct);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/product`, {
        ...newProduct,
        webshop_id: parseInt(webshopId),
        price: parseFloat(newProduct.price),
        max_stock: parseInt(newProduct.max_stock),
        current_stock: parseInt(newProduct.current_stock),
      });

      setSuccess(t('Termék sikeresen létrehozva!'));
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
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      setError(t('Hiba történt a termék létrehozása közben.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm(editingProduct);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.put(`${API_URL}/product/${editingProduct.product_id}`, {
        name: editingProduct.name,
        category: editingProduct.category,
        image: editingProduct.image,
        description: editingProduct.description,
        price: parseFloat(editingProduct.price),
        max_stock: parseInt(editingProduct.max_stock),
        current_stock: parseInt(editingProduct.current_stock),
        status: editingProduct.status,
      });

      setSuccess(t('Termék sikeresen frissítve!'));
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setError(t('Hiba történt a termék frissítése közben.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t('Biztosan törölni szeretnéd ezt a terméket?'))) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await axios.delete(`${API_URL}/product/${productId}`);
      setSuccess(t('Termék sikeresen törölve!'));
      
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        setEditingProduct(null);
      }
      
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(t('Hiba történt a termék törlése közben.'));
    }
  };

  return (
    <div className="manage-products">
      <h1>{t('Termékek kezelése')}</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {/* Új termék hozzáadása */}
      <div className="add-product-form">
        <h2>{t('Új termék hozzáadása')}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            value={newProduct.name}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Termék neve')}
            required
            disabled={isSubmitting}
          />
          <input
            name="category"
            value={newProduct.category}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Kategória')}
            required
            disabled={isSubmitting}
          />
          <input
            name="image"
            value={newProduct.image}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Kép URL')}
            required
            disabled={isSubmitting}
          />
          <textarea
            name="description"
            value={newProduct.description}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Leírás')}
            required
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Ár')}
            required
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="max_stock"
            value={newProduct.max_stock}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Maximális készlet')}
            required
            min="0"
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="current_stock"
            value={newProduct.current_stock}
            onChange={(e) => handleInputChange(e, 'new')}
            placeholder={t('Jelenlegi készlet')}
            required
            min="0"
            disabled={isSubmitting}
          />
          <select
            name="status"
            value={newProduct.status}
            onChange={(e) => handleInputChange(e, 'new')}
            required
            disabled={isSubmitting}
          >
            <option value="available">{t('Elérhető')}</option>
            <option value="unavailable">{t('Nem elérhető')}</option>
          </select>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('Mentés...') : t('Termék hozzáadása')}
          </button>
        </form>
      </div>

      {/* Meglévő termékek */}
      <h2>{t('Meglévő termékek')}</h2>
      <div className="products-list">
        {products.map((product) => (
          <div key={product.product_id} className="product-item">
            <img 
              src={product.image} 
              alt={product.name}
              onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
            />
            <h3>{product.name}</h3>
            <p><strong>{t('Kategória')}:</strong> {product.category}</p>
            <p><strong>{t('Ár')}:</strong> {product.price}</p>
            <p><strong>{t('Készlet')}:</strong> {product.current_stock} / {product.max_stock}</p>
            <p><strong>{t('Státusz')}:</strong> {product.status === 'available' ? t('Elérhető') : t('Nem elérhető')}</p>
            <div className="product-actions">
              <button 
                className="edit-button"
                onClick={() => handleEdit(product)}
              >
                {t('Szerkesztés')}
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDelete(product.product_id)}
              >
                {t('Törlés')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Szerkesztés Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>{t('Termék szerkesztése')}</h2>
            <form onSubmit={handleUpdate}>
              <input
                name="name"
                value={editingProduct.name}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Termék neve')}
                required
                disabled={isSubmitting}
              />
              <input
                name="category"
                value={editingProduct.category}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Kategória')}
                required
                disabled={isSubmitting}
              />
              <input
                name="image"
                value={editingProduct.image}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Kép URL')}
                required
                disabled={isSubmitting}
              />
              <textarea
                name="description"
                value={editingProduct.description}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Leírás')}
                required
                disabled={isSubmitting}
              />
              <input
                type="number"
                name="price"
                value={editingProduct.price}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Ár')}
                required
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
              <input
                type="number"
                name="max_stock"
                value={editingProduct.max_stock}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Maximális készlet')}
                required
                min="0"
                disabled={isSubmitting}
              />
              <input
                type="number"
                name="current_stock"
                value={editingProduct.current_stock}
                onChange={(e) => handleInputChange(e, 'edit')}
                placeholder={t('Jelenlegi készlet')}
                required
                min="0"
                disabled={isSubmitting}
              />
              <select
                name="status"
                value={editingProduct.status}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
                disabled={isSubmitting}
              >
                <option value="available">{t('Elérhető')}</option>
                <option value="unavailable">{t('Nem elérhető')}</option>
              </select>
              
              <div className="modal-button-group">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                    setError('');
                  }}
                  disabled={isSubmitting}
                >
                  {t('Mégse')}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('Mentés...') : t('Mentés')}
                </button>
                <button 
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(editingProduct.product_id)}
                  disabled={isSubmitting}
                >
                  {t('Törlés')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;