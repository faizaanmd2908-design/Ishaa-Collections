import React from 'react';
import VariantEditor from './VariantEditor';
import LoadingButton from './LoadingButton';

/**
 * ProductForm Component
 * Mobile-first form for adding and editing products.
 * Handles Basic Information, Dynamic Variants, Category-aware Size Controls, and Image URLs.
 */
export default function ProductForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting = false,
  submitText = 'Publish Product',
  title = 'Add New Product',
  subtitle = 'Fill in product details, variants, sizes, and images for your boutique',
  onCancel,
}) {
  // Category options mapping
  const categoryOptions = [
    { label: 'Saree', value: 'Saree' },
    { label: 'Dress', value: 'Dress' },
    { label: 'Nighty', value: 'Nighty' },
  ];

  const handleBasicChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if sizes should be enabled (Dress & Nighty)
  const categoryUpper = (formData.category || '').toUpperCase();
  const showSizes = categoryUpper === 'DRESS' || categoryUpper === 'NIGHTY';

  // Variant operations
  const handleAddVariant = () => {
    const defaultColorName = `Variant ${formData.variants.length + 1}`;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: defaultColorName,
          price: '',
          availability: 1,
          images: [],
          sizes: showSizes
            ? [
                { size: 'S', availability: 1 },
                { size: 'M', availability: 1 },
                { size: 'L', availability: 1 },
                { size: 'XL', availability: 1 },
                { size: 'XXL', availability: 1 },
              ]
            : [],
        },
      ],
    }));
  };

  const handleVariantChange = (index, updatedVariant) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = updatedVariant;
      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const [validationError, setValidationError] = React.useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.product_code || !formData.product_code.trim()) {
      setValidationError('Product code is required.');
      return;
    }

    if (!formData.name || !formData.name.trim()) {
      setValidationError('Product name is required.');
      return;
    }

    if (!formData.variants || formData.variants.length === 0) {
      setValidationError('Please add at least one color variant.');
      return;
    }

    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.color || !v.color.trim()) {
        setValidationError(`Color shade is required for Variant #${i + 1}.`);
        return;
      }
      const numPrice = Number(v.price);
      if (v.price === '' || isNaN(numPrice) || numPrice < 0) {
        setValidationError(`Please enter a valid non-negative price for Variant #${i + 1} (${v.color}).`);
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <form className="product-form-container" onSubmit={handleSubmit}>
      {/* Form Page Banner Header */}
      <div className="form-header-card">
        <div className="form-title-group">
          <h2 className="form-main-title">{title}</h2>
          <p className="form-subtitle">{subtitle}</p>
        </div>
      </div>

      {validationError && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}


      {/* SECTION 1: BASIC INFORMATION */}
      <section className="form-section-card">
        <div className="section-header">
          <div className="section-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3>Basic Information</h3>
        </div>

        <div className="section-body">
          <div className="form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="product_code">
                Product Code <span className="required-star">*</span>
              </label>
              <input
                id="product_code"
                type="text"
                className="form-input uppercase-text"
                placeholder="e.g. SR-101, DR-202"
                value={formData.product_code || ''}
                onChange={(e) => handleBasicChange('product_code', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="category"
                className="form-input form-select"
                value={formData.category || 'Saree'}
                onChange={(e) => handleBasicChange('category', e.target.value)}
                required
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Product Name <span className="required-star">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="e.g. Kanjeevaram Soft Silk Saree"
              value={formData.name || ''}
              onChange={(e) => handleBasicChange('name', e.target.value)}
              required
            />
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="fabric">
                Fabric Material
              </label>
              <input
                id="fabric"
                type="text"
                className="form-input"
                placeholder="e.g. Pure Silk, Georgette, Cotton"
                value={formData.fabric || ''}
                onChange={(e) => handleBasicChange('fabric', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="additional_details">
                Additional Details
              </label>
              <input
                id="additional_details"
                type="text"
                className="form-input"
                placeholder="e.g. Includes Unstitched Blouse Piece"
                value={formData.additional_details || ''}
                onChange={(e) => handleBasicChange('additional_details', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows="3"
              className="form-input form-textarea"
              placeholder="Describe the weave, finish, patterns, or occasion suitability..."
              value={formData.description || ''}
              onChange={(e) => handleBasicChange('description', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: VARIANTS, SIZES & IMAGES */}
      <section className="form-section-card">
        <div className="section-header between">
          <div className="header-left">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <h3>Color Variants & Stock</h3>
              <p className="section-subtext">Manage colors, prices, stock availability, sizes, and images</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-gold"
            onClick={handleAddVariant}
          >
            + Add Color Variant
          </button>
        </div>

        <div className="section-body variants-list">
          {formData.variants.length === 0 ? (
            <div className="empty-variants-box">
              <p>No variants added yet. At least 1 color variant is required.</p>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleAddVariant}
              >
                + Add First Variant
              </button>
            </div>
          ) : (
            formData.variants.map((variant, idx) => (
              <VariantEditor
                key={variant.id || `variant-${idx}`}
                variant={variant}
                index={idx}
                showSizes={showSizes}
                onChange={(updated) => handleVariantChange(idx, updated)}
                onRemove={() => handleRemoveVariant(idx)}
                canRemove={formData.variants.length > 1}
              />
            ))
          )}
        </div>
      </section>

      {/* STICKY ACTION FOOTER BAR */}
      <div className="form-sticky-footer">
        <div className="sticky-footer-content">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Publishing..."
            className="btn btn-primary btn-publish"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{submitText}</span>
          </LoadingButton>
        </div>
      </div>
    </form>
  );
}
