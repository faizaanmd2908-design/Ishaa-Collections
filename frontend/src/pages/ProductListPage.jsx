import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import ProductCard from '../components/ProductCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { fetchAdminProducts, fetchProductDetails, deleteProduct } from '../services/adminApi';

/**
 * ProductListPage Component
 * Mobile-first Product Management Page with search, category filtering, starting price calculation, availability badge, and confirmation deletion modal.
 */
export default function ProductListPage({ admin }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Deletion modal state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminProducts();
    if (!res.success) {
      if (res.isUnauthorized) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(res.message);
      setLoading(false);
      return;
    }


    const rawProducts = res.products || [];

    // Enrich products with complete details (variants, sizes, images)
    try {
      const enriched = await Promise.all(
        rawProducts.map(async (prod) => {
          const detailRes = await fetchProductDetails(prod.id);
          if (detailRes.success && detailRes.product) {
            return detailRes.product;
          }
          return { ...prod, variants: [] };
        })
      );
      setProducts(enriched);
    } catch (err) {
      console.error('Error enriching products:', err);
      setProducts(rawProducts.map((p) => ({ ...p, variants: [] })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    const res = await deleteProduct(deletingProduct.id);
    setIsDeleting(false);

    if (res.success) {
      showToast(`Product "${deletingProduct.name}" deleted successfully.`);
      setDeletingProduct(null);
      loadProducts();
    } else {
      alert(`Failed to delete product: ${res.message}`);
    }
  };

  // Filter products by Search and Category
  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      activeCategory === 'All' ||
      (activeCategory === 'Sarees' && (p.category || '').toUpperCase() === 'SAREE') ||
      (activeCategory === 'Dresses' && (p.category || '').toUpperCase() === 'DRESS') ||
      (activeCategory === 'Nighties' && (p.category || '').toUpperCase() === 'NIGHTY') ||
      (p.category || '').toLowerCase() === activeCategory.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.product_code && p.product_code.toLowerCase().includes(query));

    return categoryMatch && searchMatch;
  });

  return (
    <div className="admin-page-container">
      <AdminHeader adminName={admin?.name} />

      <main className="product-list-main">
        {/* Banner Header */}
        <section className="page-heading-bar">
          <div className="heading-title-block">
            <h1>Product Management</h1>
            <p className="subheading-text">Manage catalog, variants, prices, sizes & images</p>
          </div>

          <Link to="/admin/products/new" className="btn btn-primary btn-add-product">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Product</span>
          </Link>
        </section>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="toast-notification">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <section className="controls-card">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by code (e.g. SR-101) or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>

          <div className="category-tabs">
            {['All', 'Sarees', 'Dresses', 'Nighties'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="list-loading-state">
            <div className="boutique-spinner" />
            <p className="loading-text">Loading catalog products...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <button type="button" className="btn btn-sm btn-secondary" onClick={loadProducts}>
              Retry Loading
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-catalog-card">
            <div className="empty-icon-circle">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
            </div>
            <h3>No Products Found</h3>
            <p>
              {searchQuery || activeCategory !== 'All'
                ? 'No items matched your search or category filter.'
                : 'Your boutique catalog is currently empty.'}
            </p>
            <Link to="/admin/products/new" className="btn btn-primary">
              + Add First Product
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Dialog for Product Deletion */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
