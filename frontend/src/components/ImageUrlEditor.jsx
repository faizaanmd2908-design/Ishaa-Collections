import React from 'react';

/**
 * ImageUrlEditor Component
 * Allows adding, previewing, and removing image URLs per variant.
 */
export default function ImageUrlEditor({ images = [], onChange }) {
  const handleUrlChange = (index, newUrl) => {
    const updated = [...images];
    updated[index] = { ...updated[index], image_url: newUrl };
    onChange(updated);
  };

  const handleAddImage = () => {
    onChange([...images, { image_url: '', sort_order: images.length }]);
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    const reordered = updated.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reordered);
  };

  return (
    <div className="image-url-editor">
      <div className="editor-subheading">
        <label className="form-label">Variant Image URLs</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-gold"
          onClick={handleAddImage}
        >
          + Add Image URL
        </button>
      </div>

      {images.length === 0 ? (
        <p className="empty-subtext">No image URLs added yet. Click "+ Add Image URL" to attach photos.</p>
      ) : (
        <div className="image-inputs-list">
          {images.map((imgObj, idx) => (
            <div key={imgObj.id || `img-${idx}`} className="image-input-item">
              <div className="image-preview-thumbnail">
                {imgObj.image_url && imgObj.image_url.trim() ? (
                  <img
                    src={imgObj.image_url}
                    alt={`Preview ${idx + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/100x120/1e1929/d4af37?text=Invalid+URL';
                    }}
                  />
                ) : (
                  <div className="image-placeholder-box">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>No Image</span>
                  </div>
                )}
              </div>

              <div className="image-url-field-group">
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste Image URL (e.g. https://...)"
                  value={imgObj.image_url || ''}
                  onChange={(e) => handleUrlChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-remove-icon"
                  title="Delete Image"
                  onClick={() => handleRemoveImage(idx)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
