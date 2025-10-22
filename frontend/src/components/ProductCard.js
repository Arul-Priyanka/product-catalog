// ...existing code...
import React, { useState, useCallback } from 'react';

function ProductCard({ product }) {
  const initial = product?.image || `http://localhost:5000/images/placeholder.png`;
  const [src, setSrc] = useState(initial);
  const [triedAlt, setTriedAlt] = useState(false);

  const handleError = useCallback(() => {
    try {
      const url = new URL(src, window.location.origin);
      const path = url.pathname;
      const ext = path.includes('.') ? path.slice(path.lastIndexOf('.')) : '';
      if (!triedAlt) {
        let altPath = null;
        if (ext === '.png') altPath = path.replace(/\.png$/i, '.jpg');
        else if (ext === '.jpg' || ext === '.jpeg') altPath = path.replace(/\.(jpg|jpeg)$/i, '.png');
        else altPath = path + '.png';
        setTriedAlt(true);
        setSrc(`${url.origin}${altPath}`);
        return;
      }
    } catch (e) {
      // ignore
    }
    // final fallback
    setSrc('http://localhost:5000/images/placeholder.png');
  }, [src, triedAlt]);

  return (
    <div className="product-card">
      <div className="image-wrapper">
        <img src={src} alt={product?.name || 'product'} onError={handleError} />
      </div>
      <h2>{product?.name}</h2>
      {product?.price && <p className="price">${product.price}</p>}
      {product?.description && <p>{product.description}</p>}
    </div>
  );
}

export default ProductCard;
// ...existing code...