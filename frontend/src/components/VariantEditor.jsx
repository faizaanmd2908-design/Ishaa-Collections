import React from 'react';
import SizeEditor from './SizeEditor';
import ImageUrlEditor from './ImageUrlEditor';

/**
 * VariantEditor Component
 * Card component for configuring an individual product variant (Color, Price, Stock Availability, Sizes, Images).
 */
export default function VariantEditor({
  variant,
  index,
  showSizes = false,
  onChange,
  onRemove,
  canRemove = true,
}) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...variant,
      [field]: value,
    });
  };

  const isAvailable = Number(variant.availability) === 1 || variant.availability === true;

  return (
    <div className="variant-card">
      <div className="variant-card-header">
        <div className="variant-title-group">
          <span className="variant-number-badge">Variant #{index + 1}</span>
          <span
            className="variant-color-preview-dot"
            style={{
              backgroundColor: variant.color ? variant.color.toLowerCase().trim() : '#d4af37'
            }}
          />
          <h4 className="variant-color-title">{variant.color || 'New Color Variant'}</h4>
        </div>

        {canRemove && (
          <button
            type="button"
            className="btn-delete-variant"
            onClick={onRemove}
            title="Delete this color variant"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete Variant</span>
          </button>
        )}
      </div>

      <div className="variant-card-body">
        {/* Color & Price & Stock Availability */}
        <div className="variant-form-row">
          <div className="form-group flex-2">
            <label className="form-label">Color / Shade</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Royal Blue, Emerald, Pink"
              value={variant.color || ''}
              onChange={(e) => handleFieldChange('color', e.target.value)}
              required
            />
          </div>

          <div className="form-group flex-1">
            <label className="form-label">Price (₹)</label>
            <div className="currency-input-wrapper">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input price-input"
                placeholder="1299"
                value={variant.price !== undefined && variant.price !== null ? variant.price : ''}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group flex-1">
            <label className="form-label">Stock Status</label>
            <button
              type="button"
              className={`btn-stock-toggle large ${isAvailable ? 'available' : 'sold-out'}`}
              onClick={() => handleFieldChange('availability', isAvailable ? 0 : 1)}
            >
              <span className="status-dot"></span>
              <span>{isAvailable ? 'Available' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>

        {/* Sizes Section - Only shown for Dress & Nighty categories */}
        {showSizes && (
          <div className="variant-section-divider">
            <SizeEditor
              sizes={variant.sizes || []}
              onChange={(updatedSizes) => handleFieldChange('sizes', updatedSizes)}
            />
          </div>
        )}

        {/* Image URLs Section */}
        <div className="variant-section-divider">
          <ImageUrlEditor
            images={variant.images || []}
            onChange={(updatedImages) => handleFieldChange('images', updatedImages)}
          />
        </div>
      </div>
    </div>
  );
}
