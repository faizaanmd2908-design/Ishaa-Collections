import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CatalogProductCard Component
 * Displays product item for customer catalogue: photo, code, name, short desc, price/range, availability.
 */
export default function CatalogProductCard({ product }) {
  const navigate = useNavigate();
  const variants = product.variants || [];

  let priceDisplay = 'N/A';
  let isAvailable = false;
  let imageUrl = null;

  if (variants.length > 0) {
    const prices = variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        priceDisplay = `₹${minPrice.toLocaleString('en-IN')}`;
      } else {
        priceDisplay = `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
      }
    }

    isAvailable = variants.some((v) => Number(v.availability) === 1 || v.availability === true);

    for (const v of variants) {
      if (v.images && v.images.length > 0) {
        const firstImg = v.images.find((img) => img.image_url && img.image_url.trim());
        if (firstImg) {
          imageUrl = firstImg.image_url;
          break;
        }
      }
    }
  }

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="catalog-product-card" onClick={handleClick}>
      <div className="card-image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="card-product-img"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x400/1e1929/d4af37?text=Ishaa+Collections';
            }}
          />
        ) : (
          <div className="card-image-fallback">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Ishaa Collections</span>
          </div>
        )}

        <div className="card-floating-badges">
          <span className="badge-category">{product.category}</span>
          <span className={`badge-status ${isAvailable ? 'available' : 'sold-out'}`}>
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="card-info-content">
        <span className="card-product-code">{product.product_code}</span>
        <h3 className="card-product-title">{product.name}</h3>

        {(product.fabric || product.description) && (
          <p className="card-short-desc">
            {product.fabric ? `Fabric: ${product.fabric}` : product.description}
          </p>
        )}

        <div className="card-price-row">
          <div className="price-block">
            <span className="price-tag">{priceDisplay}</span>
          </div>
          <span className="btn-view-details">
            View Item &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
