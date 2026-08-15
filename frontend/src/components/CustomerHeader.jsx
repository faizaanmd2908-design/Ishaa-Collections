import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * CustomerHeader Component
 * Premium boutique navbar with store logo, category navigation, live search bar, and cart bag indicator.
 */
export default function CustomerHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="customer-header">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <span>✨ Boutique Designer Sarees, Dresses & Nighties — Pan India WhatsApp Orders ✨</span>
      </div>

      <div className="header-main-bar">
        {/* Brand Logo & Name */}
        <Link to="/" className="customer-brand-link">
          <div className="brand-emblem-gold">IC</div>
          <div className="brand-text-block">
            <span className="brand-title-serif">ISHAA COLLECTIONS</span>
            <span className="brand-tagline-sub">Find What You Love</span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form className="customer-search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search sarees, dresses, nighties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop Category Navigation */}
        <nav className="desktop-nav-menu">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/category/saree" className={`nav-item ${location.pathname === '/category/saree' ? 'active' : ''}`}>
            Sarees
          </Link>
          <Link to="/category/dress" className={`nav-item ${location.pathname === '/category/dress' ? 'active' : ''}`}>
            Dresses
          </Link>
          <Link to="/category/nighty" className={`nav-item ${location.pathname === '/category/nighty' ? 'active' : ''}`}>
            Nighties
          </Link>
        </nav>

        {/* Cart Action Button */}
        <Link to="/cart" className="customer-cart-btn" title="View Shopping Bag">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="cart-btn-label">Bag</span>
          {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
}
