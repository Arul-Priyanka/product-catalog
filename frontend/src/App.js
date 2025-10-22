import React, { useState, useEffect } from 'react';
import './App.css';
import ProductCard from './components/ProductCard';
import Filter from './components/Filter';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products'); // Update to Render URL after deployment
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      const types = [...new Set(data.map(p => p.type))];
      setProductTypes(types);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFilter = async (type) => {
    if (type === 'All') {
      setFilteredProducts(products);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/products?type=${type}`);
      const data = await response.json();
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error filtering products:', error);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Elegant Product Catalog</h1>
        <Filter types={productTypes} onFilter={handleFilter} />
      </header>
      <div className="catalog">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default App;