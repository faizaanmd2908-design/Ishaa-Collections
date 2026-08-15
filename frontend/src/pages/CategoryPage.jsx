import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import MobileBottomNav from '../components/MobileBottomNav';
import CatalogProductCard from '../components/CatalogProductCard';
import { fetchPublicProducts, fetchPublicProductDetails } from '../services/catalogApi';
import { useCart } from '../context/CartContext';

/**
 * CategoryPage Component
 * Displays catalog products filtered by category with live search and price sorting options.
 */
export default function CategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortOption, setSortOption] = useState('default');

  const currentCategory = (categoryName || 'all').toLowerCase();

  useEffect(() => {
    async function loadCategoryData() {
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
          raw.map(async (prod) => {
            const detailRes = await fetchPublicProductDetails(prod.id);
            if (detailRes.success && detailRes.product) {
              return detailRes.product;
            }
            return { ...prod, variants: [] };
          })
        );
        setProducts(enriched);
      } catch (err) {
        console.error('Error loading category products:', err);
        setProducts(raw.map((p) => ({ ...p, variants: [] })));
      } finally {
        setLoading(false);
      }
    }

    loadCategoryData();
  }, []);

  const handleCategorySwitch = (catKey) => {
    navigate(`/category/${catKey}`);
  };

  // Filter products by Category and Search
  const filteredProducts = products.filter((p) => {
    // Category match
    const pCategory = (p.category || '').toLowerCase();
    let categoryMatch = true;
    if (currentCategory === 'saree') {
      categoryMatch = pCategory === 'saree';
    } else if (currentCategory === 'dress') {
      categoryMatch = pCategory === 'dress';
    } else if (currentCategory === 'nighty') {
      categoryMatch = pCategory === 'nighty';
    }

    // Search query match
    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.product_code && p.product_code.toLowerCase().includes(q));

    return categoryMatch && searchMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const getMinPrice = (item) => {
      const prices = (item.variants || [])
        .map((v) => Number(v.price))
        .filter((p) => !isNaN(p) && p > 0);
      return prices.length > 0 ? Math.min(...prices) : 0;
    };

    if (sortOption === 'price-asc') {
      return getMinPrice(a) - getMinPrice(b);
    }
    if (sortOption === 'price-desc') {
      return getMinPrice(b) - getMinPrice(a);
    }
    return 0; // default (id desc)
  });

  const categoryTitles = {
    saree: 'Boutique Sarees',
    dress: 'Designer Dresses & Kurtis',
    nighty: 'Comfort Nightwear',
    all: 'All Catalogue Collections',
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

      <main className="category-page-main">
        {/* Banner Header */}
        <section className="category-header-banner">
          <h1>{categoryTitles[currentCategory] || 'Catalogue'}</h1>
          <p>Browse designs, select color variants & order directly on WhatsApp</p>
        </section>

        {/* Filters & Navigation Controls Bar */}
        <section className="category-controls-bar">
          {/* Category Tabs */}
          <div className="category-nav-tabs">
            {[
              { key: 'all', label: 'All Items' },
              { key: 'saree', label: 'Sarees' },
              { key: 'dress', label: 'Dresses' },
              { key: 'nighty', label: 'Nighties' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`tab-chip ${currentCategory === tab.key ? 'active' : ''}`}
                onClick={() => handleCategorySwitch(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="filter-inputs-row">
            <div className="search-filter-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Filter by code or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-btn" onClick={() => setSearchQuery('')}>
                  &times;
                </button>
              )}
            </div>

            <div className="sort-filter-box">
              <label htmlFor="sort-select">Sort:</label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="catalog-loading-state">
            <div className="boutique-spinner" />
            <p>Loading catalogue products...</p>
          </div>
        ) : error ? (
          <div className="catalog-error-box">
            <p>{error}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="empty-catalog-card">
            <div className="empty-icon">🛍️</div>
            <h3>No Products Found</h3>
            <p>No items matched your filter or search selection.</p>
            <button type="button" className="btn btn-gold-hero" onClick={() => { setSearchQuery(''); handleCategorySwitch('all'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {sortedProducts.map((prod) => (
              <CatalogProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>

      <CustomerFooter />
      <MobileBottomNav />
    </div>
  );
}
