import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../services/adminApi';

/**
 * AdminHeader Component
 * Shared responsive navbar across admin routes.
 */
export default function AdminHeader({ adminName = 'Ishaa Admin' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <Link to="/admin/dashboard" className="brand-logo-link">
          <div className="header-logo-emblem">IC</div>
        </Link>
        <div className="header-title-group">
          <span className="header-brand-name">Ishaa Collections</span>
          <span className="header-tagline">Admin Suite</span>
        </div>
      </div>

      <nav className="header-nav-links">
        <Link
          to="/admin/dashboard"
          className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/admin/products"
          className={`nav-link ${location.pathname.startsWith('/admin/products') ? 'active' : ''}`}
        >
          Products
        </Link>
      </nav>

      <div className="header-user-actions">
        <div className="admin-profile-pill">
          <div className="avatar-circle">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="admin-info-text">
            <span className="admin-name">{adminName}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-logout"
          onClick={handleLogout}
          title="Log out of session"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}
