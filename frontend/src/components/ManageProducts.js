import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios';
import { API_URL } from '../config/api';
import '../css/ManageProducts.css';

const MAX_IMAGE_URL_LENGTH = 2000; // TEXT típus, gyakorlatilag korlátlan de javasoljuk a rövidebb URL-eket
const MAX_DESCRIPTION_LENGTH = 1000; // Ajánlott maximum a leíráshoz

const ManageProducts = () => {
  const { t } = useTranslation();
  const { webshopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [webshop, setWebshop] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);
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

  // Karakter számláló state-ek
  const [imageUrlLength, setImageUrlLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [editImageUrlLength, setEditImageUrlLength] = useState(0);
  const [editDescriptionLength, setEditDescriptionLength] = useState(0);

  // Ownership ellenőrzés az oldal betöltésekor
  useEffect(() => {
    checkOwnership();
  }, [webshopId, user]);

  const checkOwnership = async () => {
    if (!user) {
      setError(t('Be kell jelentkezned a termékek kezeléséhez.'));
      setIsCheckingOwnership(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const response = await apiClient.get(`${API_URL}/webshop/${webshopId}`);
      const fetchedWebshop = response.data;
      setWebshop(fetchedWebshop);

      if (user.role === 'admin') {
        setIsAuthorized(true);
      } else if (user.role === 'teacher') {
        if (fetchedWebshop.teacher_id === user.user_id) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          setError(t('Nincs jogosultságod ennek a webshopnak a kezeléséhez. Csak a saját webshopjaid termékeit kezelheted.'));
          setTimeout(() => navigate('/teacher-dashboard'), 3000);
        }
      } else {
        setIsAuthorized(false);
        setError(t('Nincs jogosultságod ehhez az oldalhoz.'));
        setTimeout(() => navigate('/webshops'), 3000);
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
      setError(t('Hiba történt a webshop ellenőrzése közben.'));
      setTimeout(() => navigate('/teacher-dashboard'), 3000);
    } finally {
      setIsCheckingOwnership(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts();
    }
  }, [isAuthorized, webshopId]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/product/webshop/${webshopId}`);
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
      
      // Karakter számláló frissítése
      if (name === 'image') {
        setImageUrlLength(value.length);
      } else if (name === 'description') {
        setDescriptionLength(value.length);
      }
    } else {
      setEditingProduct(prev => ({ ...prev, [name]: value }));
      
      // Karakter számláló frissítése
      if (name === 'image') {
        setEditImageUrlLength(value.length);
      } else if (name === 'description') {
        setEditDescriptionLength(value.length);
      }
    }
  };

  const validateForm = (productData) => {
    if (!productData.name.trim()) return t('A termék neve kötelező.');
    if (!productData.category.trim()) return t('A kategória kötelező.');
    if (!productData.image.trim()) return t('A kép URL kötelező.');
    if (productData.image.length > MAX_IMAGE_URL_LENGTH) {
      return t(`A kép URL túl hosszú. Maximum ${MAX_IMAGE_URL_LENGTH} karakter engedélyezett.`);
    }
    if (!productData.description.trim()) return t('A leírás kötelező.');
    if (productData.description.length > MAX_DESCRIPTION_LENGTH) {
      return t(`A leírás túl hosszú. Maximum ${MAX_DESCRIPTION_LENGTH} karakter ajánlott.`);
    }
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

      await apiClient.post(`${API_URL}/product`, productData);
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
      setImageUrlLength(0);
      setDescriptionLength(0);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || t('Hiba történt a termék létrehozása közben.'));
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

      await apiClient.put(`${API_URL}/product/${editingProduct.product_id}`, productData);
      setSuccess(t('Termék sikeresen frissítve!'));
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || t('Hiba történt a termék frissítése közben.'));
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
      await apiClient.delete(`${API_URL}/product/${productId}`);
      setSuccess(t('Termék sikeresen törölve!'));
      
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        setEditingProduct(null);
      }
      
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || t('Hiba történt a termék törlése közben.'));
    }
  };

  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setEditImageUrlLength(product.image.length);
    setEditDescriptionLength(product.description.length);
    setIsEditModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditImageUrlLength(0);
    setEditDescriptionLength(0);
    setError('');
    setSuccess('');
  };

  // Karakter számláló megjelenítő komponens
  const CharacterCounter = ({ current, max, warning = 0.8 }) => {
    const isWarning = current > max * warning;
    const isError = current > max;
    const className = isError ? 'char-counter error' : isWarning ? 'char-counter warning' : 'char-counter';
    
    return (
      <div className={className}>
        {current} / {max} {t('karakter')}
        {isWarning && !isError && ` (${t('közel a limithez')})`}
        {isError && ` (${t('túl hosszú!')})`}
      </div>
    );
  };

  if (isCheckingOwnership) {
    return (
      <div className="manage-products">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('Jogosultság ellenőrzése...')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="manage-products">
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="manage-products">
      <h1>{t('Termékek kezelése')} - {webshop?.subject_name}</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Új termék hozzáadása */}
      <div className="add-product-form">
        <h2>{t('Új termék hozzáadása')}</h2>
        <form onSubmit={handleCreateProduct}>
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
          <div className="input-with-counter">
            <input
              type="url"
              name="image"
              placeholder={t('Kép URL (rövidebb URL-t ajánlott használni)')}
              value={newProduct.image}
              onChange={(e) => handleInputChange(e, 'new')}
              required
            />
            <CharacterCounter current={imageUrlLength} max={MAX_IMAGE_URL_LENGTH} />
          </div>
          <div className="input-with-counter">
            <textarea
              name="description"
              placeholder={t('Leírás')}
              value={newProduct.description}
              onChange={(e) => handleInputChange(e, 'new')}
              required
            />
            <CharacterCounter current={descriptionLength} max={MAX_DESCRIPTION_LENGTH} />
          </div>
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
          <button type="submit" disabled={isSubmitting || imageUrlLength > MAX_IMAGE_URL_LENGTH || descriptionLength > MAX_DESCRIPTION_LENGTH}>
            {isSubmitting ? t('Létrehozás...') : t('Termék hozzáadása')}
          </button>
        </form>
      </div>

      {/* Meglévő termékek */}
      <div className="products-section">
        <h2>{t('Meglévő termékek')}</h2>
        {products.length === 0 ? (
          <p className="no-products">{t('Még nincsenek termékek.')}</p>
        ) : (
          <div className="products-list">
            {products.map(product => (
              <div key={product.product_id} className="product-item">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="category">{product.category}</p>
                <p className="description">{product.description}</p>
                <p className="price"><strong>{t('Ár')}:</strong> {product.price} Ft</p>
                <p className="stock">
                  <strong>{t('Készlet')}:</strong> {product.current_stock}/{product.max_stock}
                </p>
                <p className={`status ${product.status}`}>
                  {product.status === 'available' ? t('Elérhető') : t('Nem elérhető')}
                </p>
                <div className="product-actions">
                  <button className="edit-button" onClick={() => openEditModal(product)}>
                    {t('Szerkesztés')}
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(product.product_id)}>
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
        <div className="edit-modal" onClick={closeEditModal}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('Termék szerkesztése')}</h2>
            <form onSubmit={handleUpdateProduct}>
              <input
                type="text"
                name="name"
                placeholder={t('Termék neve')}
                value={editingProduct.name}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
              />
              <input
                type="text"
                name="category"
                placeholder={t('Kategória')}
                value={editingProduct.category}
                onChange={(e) => handleInputChange(e, 'edit')}
                required
              />
              <div className="input-with-counter">
                <input
                  type="url"
                  name="image"
                  placeholder={t('Kép URL')}
                  value={editingProduct.image}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  required
                />
                <CharacterCounter current={editImageUrlLength} max={MAX_IMAGE_URL_LENGTH} />
              </div>
              <div className="input-with-counter">
                <textarea
                  name="description"
                  placeholder={t('Leírás')}
                  value={editingProduct.description}
                  onChange={(e) => handleInputChange(e, 'edit')}
                  required
                />
                <CharacterCounter current={editDescriptionLength} max={MAX_DESCRIPTION_LENGTH} />
              </div>
              <input
                type="number"
                name="price"
                placeholder={t('Ár')}
                value={editingProduct.price}
                onChange={(e) => handleInputChange(e, 'edit')}
                step="0.01"
                min="0"
                required
              />
              <input
                type="number"
                name="max_stock"
                placeholder={t('Maximális készlet')}
                value={editingProduct.max_stock}
                onChange={(e) => handleInputChange(e, 'edit')}
                min="0"
                required
              />
              <input
                type="number"
                name="current_stock"
                placeholder={t('Jelenlegi készlet')}
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
              <div className="modal-button-group">
                <button type="submit" disabled={isSubmitting || editImageUrlLength > MAX_IMAGE_URL_LENGTH || editDescriptionLength > MAX_DESCRIPTION_LENGTH}>
                  {isSubmitting ? t('Frissítés...') : t('Frissítés')}
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