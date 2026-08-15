import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ProductCard Component
 * Displays individual product in mobile-first list view: code, name, category, starting price, availability badge, preview image, and action buttons.
 */
export default function ProductCard({ product, onDelete }) {
  const navigate = useNavigate();

  const variants = product.variants || [];
  
  let startingPrice = 'N/A';
  let isAvailable = false;
  let imageUrl = null;

  if (variants.length > 0) {
    const prices = variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0);
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      startingPrice = `₹${minPrice.toLocaleString('en-IN')}`;
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

  const handleEdit = () => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="product-card-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x400/1e1929/d4af37?text=Ishaa+Collections';
            }}
          />
        ) : (
          <div className="product-card-placeholder">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>No Image</span>
          </div>
        )}
        
        <div className="card-badges-top">
          <span className="product-category-badge">{product.category}</span>
          <span className={`product-status-badge ${isAvailable ? 'available' : 'sold-out'}`}>
            <span className="status-dot"></span>
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="product-card-content">
        <div className="product-code-tag">{product.product_code}</div>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-details-footer">
          <div className="product-price-block">
            <span className="price-label">Starting Price</span>
            <span className="product-price">{startingPrice}</span>
          </div>

          <div className="product-actions-group">
            <button
              type="button"
              className="btn-icon-action btn-edit"
              onClick={handleEdit}
              title="Edit product"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="btn-icon-action btn-delete"
              onClick={() => onDelete(product)}
              title="Delete product"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
