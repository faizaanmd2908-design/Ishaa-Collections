import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import MobileBottomNav from '../components/MobileBottomNav';
import ImageGallery from '../components/ImageGallery';
import SizeChartModal from '../components/SizeChartModal';
import { fetchPublicProductDetails } from '../services/catalogApi';
import { useCart } from '../context/CartContext';
import { getSingleItemWhatsAppUrl } from '../utils/whatsappHelper';

/**
 * ProductDetailsPage Component
 * Displays product images, color variants, size availability, size guide modal, cart addition, and instant WhatsApp ordering.
 */
export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toast } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active selections
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Size chart modal state
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      const res = await fetchPublicProductDetails(id);
      if (!res.success || !res.product) {
        setError(res.message || 'Product not found.');
        setLoading(false);
        return;
      }

      const prod = res.product;
      setProduct(prod);

      // Default variant
      const variants = prod.variants || [];
      if (variants.length > 0) {
        setSelectedVariantIndex(0);
        // Default size if category is Dress/Nighty
        const categoryUpper = (prod.category || '').toUpperCase();
        if (categoryUpper === 'DRESS' || categoryUpper === 'NIGHTY') {
          const firstAvailableSize = (variants[0].sizes || []).find(
            (s) => Number(s.availability) === 1 || s.availability === true
          );
          if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize.size);
          } else if (variants[0].sizes && variants[0].sizes.length > 0) {
            setSelectedSize(variants[0].sizes[0].size);
          }
        }
      }

      setLoading(false);
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="customer-page-wrapper">
        <CustomerHeader />
        <div className="details-loading-state">
          <div className="boutique-spinner" />
          <p>Loading item details...</p>
        </div>
        <CustomerFooter />
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="customer-page-wrapper">
        <CustomerHeader />
        <div className="details-error-box">
          <h2>Product Not Found</h2>
          <p>{error || 'The requested product is no longer available.'}</p>
          <Link to="/category/all" className="btn btn-gold-hero">
            Return to Catalogue
          </Link>
        </div>
        <CustomerFooter />
        <MobileBottomNav />
      </div>
    );
  }

  const categoryUpper = (product.category || '').toUpperCase();
  const isSizeCategory = categoryUpper === 'DRESS' || categoryUpper === 'NIGHTY';

  const variants = product.variants || [];
  const activeVariant = variants[selectedVariantIndex] || null;

  // Active Variant attributes
  const activeColor = activeVariant ? activeVariant.color : 'Standard';
  const activePrice = activeVariant ? Number(activeVariant.price) : 0;
  const isVariantAvailable = activeVariant
    ? Number(activeVariant.availability) === 1 || activeVariant.availability === true
    : false;

  const activeImages = activeVariant ? activeVariant.images || [] : [];
  const activeSizes = activeVariant ? activeVariant.sizes || [] : [];

  // Size choices: S, M, L, XL, XXL
  const ALL_SIZE_CHOICES = ['S', 'M', 'L', 'XL', 'XXL'];

  // Check if selected size is available
  let isSizeAvailable = true;
  if (isSizeCategory && selectedSize) {
    const szObj = activeSizes.find((s) => s.size === selectedSize);
    if (szObj) {
      isSizeAvailable = Number(szObj.availability) === 1 || szObj.availability === true;
    }
  }

  // Can item be purchased / added to cart?
  const isPurchasable = isVariantAvailable && (isSizeCategory ? isSizeAvailable : true);

  // Variant change handler
  const handleVariantSelect = (index) => {
    setSelectedVariantIndex(index);
    const newVariant = variants[index];

    // If new variant has sizes, ensure selected size is valid
    if (isSizeCategory && newVariant) {
      const newSizes = newVariant.sizes || [];
      const currentSizeObj = newSizes.find((s) => s.size === selectedSize);
      const isCurrentAvailable =
        currentSizeObj &&
        (Number(currentSizeObj.availability) === 1 || currentSizeObj.availability === true);

      if (!isCurrentAvailable) {
        const firstAvailable = newSizes.find(
          (s) => Number(s.availability) === 1 || s.availability === true
        );
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
        }
      }
    }
  };

  // Extract cover image for cart
  const primaryImageUrl =
    activeImages.length > 0
      ? activeImages[0].image_url
      : 'https://placehold.co/300x400/1e1929/d4af37?text=Ishaa+Collections';

  const cartItemPayload = {
    productId: product.id,
    productCode: product.product_code,
    productName: product.name,
    category: product.category,
    color: activeColor,
    size: isSizeCategory ? selectedSize : null,
    price: activePrice,
    image: primaryImageUrl,
    quantity: quantity,
  };

  const handleAddToCart = () => {
    if (!isPurchasable) return;
    addToCart(cartItemPayload);
  };

  const handleBuyNow = () => {
    if (!isPurchasable) return;
    const whatsappUrl = getSingleItemWhatsAppUrl(cartItemPayload);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="customer-page-wrapper">
      <CustomerHeader />

      {toast && (
        <div className="customer-toast-notification">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toast}</span>
        </div>
      )}

      <main className="product-details-main">
        {/* Breadcrumb Navigation */}
        <nav className="details-breadcrumb">
          <Link to="/">Home</Link> &rsaquo;{' '}
          <Link to={`/category/${product.category.toLowerCase()}`}>{product.category}</Link> &rsaquo;{' '}
          <span>{product.name}</span>
        </nav>

        <div className="details-layout-grid">
          {/* Left Column: Image Gallery */}
          <div className="details-gallery-col">
            <ImageGallery images={activeImages} productName={product.name} />
          </div>

          {/* Right Column: Information & Order Panel */}
          <div className="details-info-col">
            <div className="details-header-block">
              <span className="details-code-badge">{product.product_code}</span>
              <h1 className="details-title">{product.name}</h1>
              <span className="details-category-tag">{product.category}</span>
            </div>

            {/* Price & Availability Banner */}
            <div className="details-price-row">
              <div className="price-tag-large">
                ₹{activePrice > 0 ? activePrice.toLocaleString('en-IN') : 'N/A'}
              </div>

              <span className={`status-badge-pill ${isPurchasable ? 'available' : 'sold-out'}`}>
                <span className="status-dot"></span>
                <span>{isPurchasable ? 'In Stock' : 'Out of Stock'}</span>
              </span>
            </div>

            {/* Description & Fabric */}
            <div className="details-description-box">
              {product.fabric && (
                <p className="fabric-line">
                  <strong>Fabric Material:</strong> {product.fabric}
                </p>
              )}
              {product.additional_details && (
                <p className="additional-line">
                  <strong>Details:</strong> {product.additional_details}
                </p>
              )}
              {product.description && (
                <p className="desc-text">{product.description}</p>
              )}
            </div>

            {/* COLOR VARIANTS SELECTOR */}
            {variants.length > 0 && (
              <div className="selector-group">
                <div className="selector-header">
                  <label className="selector-label">Color Variant:</label>
                  <span className="active-value-text">{activeColor}</span>
                </div>

                <div className="color-swatches-row">
                  {variants.map((varObj, idx) => {
                    const isSelected = idx === selectedVariantIndex;
                    const isVarAvailable =
                      Number(varObj.availability) === 1 || varObj.availability === true;

                    return (
                      <button
                        key={varObj.id || `var-${idx}`}
                        type="button"
                        className={`color-swatch-btn ${isSelected ? 'active' : ''} ${!isVarAvailable ? 'unavailable' : ''}`}
                        onClick={() => handleVariantSelect(idx)}
                      >
                        <span
                          className="swatch-color-dot"
                          style={{
                            backgroundColor: varObj.color
                              ? varObj.color.toLowerCase().trim()
                              : '#d4af37',
                          }}
                        />
                        <span>{varObj.color}</span>
                        {!isVarAvailable && <span className="sold-out-chip">Sold Out</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZES SELECTOR (Only shown for Dress & Nighty) */}
            {isSizeCategory && (
              <div className="selector-group">
                <div className="selector-header">
                  <div className="header-left-group">
                    <label className="selector-label">Select Size:</label>
                    <span className="active-value-text">{selectedSize || 'Choose size'}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-size-guide"
                    onClick={() => setIsSizeChartOpen(true)}
                  >
                    📏 Size Guide
                  </button>
                </div>

                <div className="sizes-chips-row">
                  {ALL_SIZE_CHOICES.map((sz) => {
                    const szRecord = activeSizes.find((s) => s.size === sz);
                    const isAvailable =
                      szRecord &&
                      (Number(szRecord.availability) === 1 || szRecord.availability === true);
                    const isSelected = selectedSize === sz;

                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`size-chip-btn ${isSelected ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                        onClick={() => isAvailable && setSelectedSize(sz)}
                        disabled={!isAvailable}
                        title={isAvailable ? `Size ${sz}` : `Size ${sz} is Sold Out`}
                      >
                        <span className="size-label">{sz}</span>
                        <span className="size-status-icon">{isAvailable ? '✓' : '✕'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="selector-group">
              <label className="selector-label">Quantity:</label>
              <div className="quantity-counter-box">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !isPurchasable}
                >
                  &minus;
                </button>
                <span className="qty-number">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!isPurchasable}
                >
                  &#43;
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="details-action-buttons">
              <button
                type="button"
                className="btn btn-add-bag"
                onClick={handleAddToCart}
                disabled={!isPurchasable}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>{isPurchasable ? 'Add to Bag' : 'Out of Stock'}</span>
              </button>

              <button
                type="button"
                className="btn btn-whatsapp-buy"
                onClick={handleBuyNow}
                disabled={!isPurchasable}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.988L2 22l5.133-1.346a9.97 9.97 0 0 0 4.879 1.27h.004c5.505 0 9.989-4.478 9.99-9.985A9.998 9.998 0 0 0 12.012 2z" />
                </svg>
                <span>Buy Now on WhatsApp</span>
              </button>
            </div>

            <div className="order-reassurance-box">
              <p>💬 <strong>WhatsApp Ordering:</strong> Tapping "Buy Now" prepares a direct message with your chosen item code, shade, size, and price for instant confirmation.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category}
      />

      <CustomerFooter />
      <MobileBottomNav />
    </div>
  );
}
