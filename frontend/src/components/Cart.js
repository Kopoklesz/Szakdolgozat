import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../css/Cart.css';

const API_URL = 'http://api.pannon-shop.hu';

const Cart = ({ userId, webshopId }) => {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/cart/${userId}/${webshopId}`);
        setCartItems(response.data.items || []);
      } catch (error) {
        console.error('Error fetching cart items:', error.response?.data || error.message);
        setError(`${t('Nem sikerült betölteni a kosár tartalmát')}. ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId, webshopId, t]);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.post(`${API_URL}/cart/${userId}/${webshopId}`, { 
        productId: productId, 
        quantity: newQuantity 
      });
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.product.product_id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(t('Hiba történt a mennyiség frissítése közben.'));
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.post(`${API_URL}/cart/${userId}/${webshopId}`, { 
        productId: productId, 
        quantity: 0 
      });
      setCartItems(prevItems => prevItems.filter(item => item.product.product_id !== productId));
    } catch (error) {
      console.error('Error removing item:', error);
      setError(t('Hiba történt a termék eltávolítása közben.'));
    }
  };

  const checkout = async () => {
    try {
      await axios.post(`${API_URL}/purchase/${userId}/${webshopId}`);
      setCartItems([]);
      // Itt lehetne valamilyen visszajelzést adni a sikeres vásárlásról
    } catch (error) {
      console.error('Error during checkout:', error);
      setError(t('Hiba történt a fizetés során.'));
    }
  };

  if (loading) return <div>{t('Betöltés')}...</div>;
  if (error) return <div>{t('Hiba')}: {error}</div>;

  return (
    <div className="cart-container">
      <h2>{t('Kosár')}</h2>
      {cartItems.length === 0 ? (
        <p>{t('A kosár üres')}</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.product.product_id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} />
              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p>{t('Ár')}: {item.product.price} {item.product.webshop.paying_instrument}</p>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)} disabled={item.quantity === 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.product.product_id)}>{t('Eltávolítás')}</button>
            </div>
          ))}
          <div className="cart-summary">
            <p>{t('Összesen')}: {cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)} {cartItems[0]?.product.webshop.paying_instrument}</p>
            <button onClick={checkout}>{t('Fizetés')}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
