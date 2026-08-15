import React from 'react';

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/**
 * SizeEditor Component
 * Dynamic size management with stock availability toggle per size.
 * Only shown for Dress and Nighty categories.
 */
export default function SizeEditor({ sizes = [], onChange }) {
  const currentSizeNames = sizes.map((s) => s.size);
  const unusedSizes = ALL_SIZES.filter((sz) => !currentSizeNames.includes(sz));

  const handleAddSize = (sizeName) => {
    onChange([...sizes, { size: sizeName, availability: 1 }]);
  };

  const handleToggleAvailability = (index) => {
    const updated = [...sizes];
    const currentVal = updated[index].availability === undefined ? 1 : Number(updated[index].availability);
    updated[index] = {
      ...updated[index],
      availability: currentVal === 1 ? 0 : 1,
    };
    onChange(updated);
  };

  const handleRemoveSize = (index) => {
    const updated = sizes.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="size-editor">
      <div className="editor-subheading">
        <label className="form-label">Size Availability</label>
        <span className="size-hint">Select sizes & stock status</span>
      </div>

      {/* Quick Add Chips */}
      {unusedSizes.length > 0 && (
        <div className="size-quick-add">
          <span className="quick-add-label">Tap to Add Size:</span>
          <div className="chips-row">
            {unusedSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                className="chip-add-btn"
                onClick={() => handleAddSize(sz)}
              >
                + {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Sizes List */}
      {sizes.length === 0 ? (
        <p className="empty-subtext">No sizes added for this variant. Tap a size chip above to add.</p>
      ) : (
        <div className="sizes-grid">
          {sizes.map((szObj, idx) => {
            const isAvailable = Number(szObj.availability) === 1 || szObj.availability === true;
            return (
              <div key={szObj.id || `size-${szObj.size}-${idx}`} className="size-item-card">
                <div className="size-badge-name">{szObj.size}</div>
                
                <button
                  type="button"
                  className={`btn-stock-toggle ${isAvailable ? 'available' : 'sold-out'}`}
                  onClick={() => handleToggleAvailability(idx)}
                  title="Click to toggle availability"
                >
                  <span className="status-dot"></span>
                  <span>{isAvailable ? 'Available' : 'Sold Out'}</span>
                </button>

                <button
                  type="button"
                  className="btn-remove-size"
                  title="Remove size"
                  onClick={() => handleRemoveSize(idx)}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
