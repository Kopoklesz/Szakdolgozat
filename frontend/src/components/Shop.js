import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/Shop.css';

const API_URL = 'http://localhost:3001'; // Adjust this to your NestJS server URL

const Shop = () => {
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
          axios.get(`${API_URL}/webshop${webshopId === 0 ? '' : `/${webshopId}`}`),                   // Webshop adatok lekérése
          axios.get(`${API_URL}/webshop/${webshopId}/products`),              // Termékek lekérése a webshopId alapján
          axios.get(`${API_URL}/webshop/${webshopId}/categories`),            // Kategóriák lekérése a webshopId alapján
        ]);
        
        setWebshop(webshopResponse.data);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setError(`Failed to load shop data. ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [webshopId]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || product.category === selectedCategory)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="shop">
      <header style={{ backgroundColor: webshop?.header_color_code || '#000000' }}>
        <h1>{webshop?.subject_name}</h1>
        <img src={webshop?.paying_device_image} alt="Paying Device" className="paying-device" />
      </header>
      
      <div className="search-filter">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
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
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, payingInstrument }) => {
  const [quantity, setQuantity] = useState(0);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>Price: {product.price} {payingInstrument}</p>
      <p>Available: {product.current_stock}</p>
      <input 
        type="number" 
        min="0" 
        max={product.current_stock}
        value={quantity}
        onChange={(e) => setQuantity(Math.min(product.current_stock, Math.max(0, parseInt(e.target.value) || 0)))}
      />
      <button onClick={() => {/* Add to cart logic - to be implemented later */}}>Add to Cart</button>
    </div>
  );
};

export default Shop;