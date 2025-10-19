import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_URL } from '../config';
import '../css/ManageProducts.css';

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

  const handleCreateProduct = async (e) => {
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
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        max_stock: parseInt(newProduct.max_stock),
        current_stock: parseInt(newProduct.current_stock),
        webshop_id: parseInt(webshopId)
      };

      await axios.post(`${API_URL}/product`, productData);
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

  const handleUpdateProduct = async (e) => {
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
      const productData = {
        name: editingProduct.name,
        category: editingProduct.category,
        image: editingProduct.image,
        description: editingProduct.description,
        price: parseFloat(editingProduct.price),
        max_stock: parseInt(editingProduct.max_stock),
        current_stock: parseInt(editingProduct.current_stock),
        status: editingProduct.status
      };

      await axios.put(`${API_URL}/product/${editingProduct.product_id}`, productData);
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

  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="manage-products-container">
      <h2>{t('Termékek kezelése')}</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Új termék létrehozása form */}
      <div className="create-product-section">
        <h3>{t('Új termék hozzáadása')}</h3>
        <form onSubmit={handleCreateProduct} className="product-form">
          {/* Form mezők... */}
          <input
            type="text"
            name="name"
            placeholder={t('Termék neve')}
            value={newProduct.name}
            onChange={(e) => handleInputChange(e, 'new')}
            required
          />
          <input
            type="text"
            name="category"
            placeholder={t('Kategória')}
            value={newProduct.category}
            onChange={(e) => handleInputChange(e, 'new')}
            required
          />
          <input
            type="url"
            name="image"
            placeholder={t('Kép URL')}
            value={newProduct.image}
            onChange={(e) => handleInputChange(e, 'new')}
            required
          />
          <textarea
            name="description"
            placeholder={t('Leírás')}
            value={newProduct.description}
            onChange={(e) => handleInputChange(e, 'new')}
            required
          />
          <input
            type="number"
            name="price"
            placeholder={t('Ár')}
            value={newProduct.price}
            onChange={(e) => handleInputChange(e, 'new')}
            step="0.01"
            min="0"
            required
          />
          <input
            type="number"
            name="max_stock"
            placeholder={t('Maximális készlet')}
            value={newProduct.max_stock}
            onChange={(e) => handleInputChange(e, 'new')}
            min="0"
            required
          />
          <input
            type="number"
            name="current_stock"
            placeholder={t('Jelenlegi készlet')}
            value={newProduct.current_stock}
            onChange={(e) => handleInputChange(e, 'new')}
            min="0"
            required
          />
          <select
            name="status"
            value={newProduct.status}
            onChange={(e) => handleInputChange(e, 'new')}
          >
            <option value="available">{t('Elérhető')}</option>
            <option value="unavailable">{t('Nem elérhető')}</option>
          </select>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('Létrehozás...') : t('Termék hozzáadása')}
          </button>
        </form>
      </div>

      {/* Termékek listája */}
      <div className="products-list">
        <h3>{t('Meglévő termékek')}</h3>
        {products.length === 0 ? (
          <p>{t('Még nincsenek termékek.')}</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.product_id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h4>{product.name}</h4>
                <p>{product.category}</p>
                <p>{product.price} Ft</p>
                <p>{t('Készlet')}: {product.current_stock}/{product.max_stock}</p>
                <p className={`status ${product.status}`}>
                  {product.status === 'available' ? t('Elérhető') : t('Nem elérhető')}
                </p>
                <div className="product-actions">
                  <button onClick={() => openEditModal(product)}>{t('Szerkesztés')}</button>
                  <button onClick={() => handleDelete(product.product_id)} className="delete-btn">
                    {t('Törlés')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Szerkesztési modal */}
      {isEditModalOpen && editingProduct && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('Termék szerkesztése')}</h3>
            <form onSubmit={handleUpdateProduct} className="product-form">
              <input
                type="text"
                name="name"
                value={editingProduct.name}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
              />
              <input
                type="text"
                name="category"
                value={editingProduct.category}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
              />
              <input
                type="url"
                name="image"
                value={editingProduct.image}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
              />
              <textarea
                name="description"
                value={editingProduct.description}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
              />
              <input
                type="number"
                name="price"
                value={editingProduct.price}
                onChange={(e) => handleInputChange(e, 'edit')}
                step="0.01"
                min="0"
                required
              />
              <input
                type="number"
                name="max_stock"
                value={editingProduct.max_stock}
                onChange={(e) => handleInputChange(e, 'edit')}
                min="0"
                required
              />
              <input
                type="number"
                name="current_stock"
                value={editingProduct.current_stock}
                onChange={(e) => handleInputChange(e, 'edit')}
                min="0"
                required
              />
              <select
                name="status"
                value={editingProduct.status}
                onChange={(e) => handleInputChange(e, 'edit')}
              >
                <option value="available">{t('Elérhető')}</option>
                <option value="unavailable">{t('Nem elérhető')}</option>
              </select>
              <div className="modal-actions">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('Mentés...') : t('Módosítások mentése')}
                </button>
                <button type="button" onClick={closeEditModal}>
                  {t('Mégse')}
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