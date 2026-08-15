import React, { useState, useEffect } from 'react';

/**
 * ImageGallery Component
 * Large main product photo display with thumbnail strip underneath.
 * Updates smoothly when customer switches color variants.
 */
export default function ImageGallery({ images = [], productName = 'Product' }) {
  const validImages = (images || []).filter((img) => img.image_url && img.image_url.trim());
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  const activeImage = validImages[selectedIndex]?.image_url;

  return (
    <div className="product-image-gallery">
      <div className="main-image-frame">
        {activeImage ? (
          <img
            src={activeImage}
            alt={productName}
            className="main-gallery-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x800/1e1929/d4af37?text=Ishaa+Collections';
            }}
          />
        ) : (
          <div className="gallery-placeholder">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>No image preview available for this shade</span>
          </div>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="gallery-thumbnails-strip">
          {validImages.map((imgObj, idx) => (
            <button
              key={imgObj.id || `thumb-${idx}`}
              type="button"
              className={`thumbnail-btn ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
            >
              <img src={imgObj.image_url} alt={`${productName} thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
