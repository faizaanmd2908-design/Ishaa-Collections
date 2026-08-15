import React from 'react';
import { Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import MobileBottomNav from '../components/MobileBottomNav';
import { useCart } from '../context/CartContext';
import { getCartWhatsAppUrl } from '../utils/whatsappHelper';

/**
 * CartPage Component
 * Client-side shopping bag listing products, quantities, subtotals, and instant WhatsApp checkout button.
 */
export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartSubtotal, toast } = useCart();

  const handleOrderWhatsApp = () => {
    if (cartItems.length === 0) return;
    const whatsappUrl = getCartWhatsAppUrl(cartItems);
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

      <main className="cart-page-main">
        <div className="cart-header-banner">
          <h1>Your Shopping Bag</h1>
          <p>Review items and tap "Order via WhatsApp" to confirm availability with boutique staff</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-bag-icon">🛍️</div>
            <h2>Your Shopping Bag is Empty</h2>
            <p>Explore our boutique sarees, dresses, and nighties to add items to your bag.</p>
            <Link to="/category/all" className="btn btn-gold-hero">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Left Column: Cart Items List */}
            <div className="cart-items-col">
              <div className="cart-list-header">
                <span>Items in Bag ({cartItems.length})</span>
                <button type="button" className="btn-clear-cart" onClick={clearCart}>
                  Clear Bag
                </button>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item, index) => {
                  const itemTotal = Number(item.price) * item.quantity;

                  return (
                    <div key={`${item.productId}-${item.color}-${item.size}-${index}`} className="cart-item-card">
                      <div className="cart-item-thumb">
                        <img
                          src={item.image}
                          alt={item.productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x120/1e1929/d4af37?text=Ishaa';
                          }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <div className="item-top-row">
                          <span className="item-code-tag">{item.productCode}</span>
                          <button
                            type="button"
                            className="btn-remove-item"
                            title="Remove item"
                            onClick={() => removeFromCart(index)}
                          >
                            &times;
                          </button>
                        </div>

                        <h3 className="item-title">{item.productName}</h3>

                        <div className="item-specs-pills">
                          <span className="spec-pill">Color: {item.color}</span>
                          {item.size && <span className="spec-pill">Size: {item.size}</span>}
                          <span className="spec-pill">Unit Price: ₹{Number(item.price).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="item-bottom-row">
                          <div className="cart-quantity-box">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                            >
                              &minus;
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                            >
                              &#43;
                            </button>
                          </div>

                          <div className="item-total-price">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="cart-summary-col">
              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-line-row">
                  <span>Bag Items Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-line-row">
                  <span>Estimated Total</span>
                  <span className="summary-grand-total">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-whatsapp-notice">
                  <p>
                    <strong>📱 No Online Payment Required:</strong> Clicking below opens WhatsApp with your pre-formatted order summary. Our boutique team will confirm current availability and final shipping costs.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-whatsapp-checkout"
                  onClick={handleOrderWhatsApp}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.988L2 22l5.133-1.346a9.97 9.97 0 0 0 4.879 1.27h.004c5.505 0 9.989-4.478 9.99-9.985A9.998 9.998 0 0 0 12.012 2z" />
                  </svg>
                  <span>ORDER VIA WHATSAPP</span>
                </button>

                <div className="continue-shopping-center">
                  <Link to="/category/all" className="continue-link">
                    &larr; Continue Browsing Catalogue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <CustomerFooter />
      <MobileBottomNav />
    </div>
  );
}
