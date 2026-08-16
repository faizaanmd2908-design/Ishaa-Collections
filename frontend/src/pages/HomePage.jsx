import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import MobileBottomNav from '../components/MobileBottomNav';
import CatalogProductCard from '../components/CatalogProductCard';
import { fetchPublicProducts, fetchPublicProductDetails } from '../services/catalogApi';
import { useCart } from '../context/CartContext';

/**
 * HomePage Component
 * Mobile-first boutique homepage for Ishaa Collections.
 */
export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useCart();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const res = await fetchPublicProducts();
      if (!res.success) {
        setError(res.message);
        setLoading(false);
        return;
      }

      const raw = res.products || [];

      try {
        const enriched = await Promise.all(
          raw.slice(0, 8).map(async (prod) => {
            const detailRes = await fetchPublicProductDetails(prod.id);
            if (detailRes.success && detailRes.product) {
              return detailRes.product;
            }
            return { ...prod, variants: [] };
          })
        );
        setProducts(enriched);
      } catch (err) {
        console.error('Error enriching home products:', err);
        setProducts(raw.slice(0, 8).map((p) => ({ ...p, variants: [] })));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

      {/* Hero Banner Section */}
      <section className="hero-banner-section">
        <div className="hero-content">
          <span className="hero-eyebrow">Handcrafted Boutique Fashion</span>
          <h1 className="hero-brand-title">ISHAA COLLECTIONS</h1>
          <p className="hero-tagline">Find What You Love</p>

          <div className="hero-cta-group">
            <Link to="/category/saree" className="btn btn-gold-hero">
              Explore Sarees
            </Link>
            <Link to="/category/dress" className="btn btn-outline-hero">
              View Dresses
            </Link>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="main-categories-section">
        <div className="section-title-wrap">
          <span className="sub-title-accent">Curated Collections</span>
          <h2 className="section-main-title">Shop by Category</h2>
        </div>

        <div className="category-cards-grid">
          {/* Sarees Card */}
          <Link to="/category/saree" className="category-banner-card saree-bg">
            <div className="card-overlay" />
            <div className="banner-text-content">
              <h3>Sarees</h3>
              <p>Banarasi, Silk, Chiffon & Georgette</p>
              <span className="shop-link">Explore Sarees &rarr;</span>
            </div>
          </Link>

          {/* Dresses Card */}
          <Link to="/category/dress" className="category-banner-card dress-bg">
            <div className="card-overlay" />
            <div className="banner-text-content">
              <h3>Dresses</h3>
              <p>Ethnic Gowns, Kurtis & Casual Wear</p>
              <span className="shop-link">Explore Dresses &rarr;</span>
            </div>
          </Link>

          {/* Nighties Card */}
          <Link to="/category/nighty" className="category-banner-card nighty-bg">
            <div className="card-overlay" />
            <div className="banner-text-content">
              <h3>Nighties</h3>
              <p>Soft Cotton & Cozy Nightwear</p>
              <span className="shop-link">Explore Nighties &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="new-arrivals-section">
        <div className="section-title-wrap">
          <span className="sub-title-accent">Fresh in Store</span>
          <h2 className="section-main-title">New Arrivals</h2>
        </div>

        {loading ? (
          <div className="catalog-loading-state">
            <div className="boutique-spinner" />
            <p>Loading catalogue items...</p>
          </div>
        ) : error ? (
          <div className="catalog-error-box">
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-catalog-text">
            <p>No products currently available in catalogue.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {products.map((prod) => (
              <CatalogProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

        <div className="view-all-center">
          <Link to="/category/all" className="btn btn-outline-dark">
            View Full Catalogue
          </Link>
        </div>
      </section>

      {/* Boutique Value Badges */}
      <section className="boutique-values-section">
        <div className="value-card">
          <div className="value-icon">✨</div>
          <h4>Handpicked Quality</h4>
          <p>Every piece is checked for fabric texture, weave, and finish.</p>
        </div>
        <div className="value-card">
          <div className="value-icon">💬</div>
          <h4>WhatsApp Direct Order</h4>
          <p>Instant size confirmation & personal assistance via WhatsApp.</p>
        </div>
      </section>

      <CustomerFooter />
      <MobileBottomNav />
    </div>
  );
}
