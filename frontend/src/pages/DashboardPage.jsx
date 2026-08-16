import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../services/adminApi';

/**
 * DashboardPage
 *
 * Main admin landing page for Ishaa Collections.
 * Authentication is handled by ProtectedRoute.
 */
export default function DashboardPage({ admin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/admin/login', { replace: true });
  };

  // Display name for the administrator
  const adminName = 'Fareeda';

  const adminEmail =
    admin?.email || 'admin@ishaacollections.com';

  const adminId =
    admin?.id || 1;

  return (
    <div className="dashboard-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div className="header-brand">

          <div className="header-logo-emblem">
            IC
          </div>

          <div className="header-title-group">

            <span className="header-brand-name">
              Ishaa Collections
            </span>

            <span className="header-tagline">
              Admin Suite
            </span>

          </div>

        </div>


        <div className="header-user-actions">

          <div className="admin-profile-pill">

            <div className="avatar-circle">
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div className="admin-info-text">

              <span className="admin-name">
                {adminName}
              </span>

              <span className="admin-role">
                Administrator
              </span>

            </div>

          </div>


          <button
            type="button"
            className="btn btn-logout"
            onClick={handleLogout}
          >

            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              />
            </svg>

            <span>
              Logout
            </span>

          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        {/* =====================================================
            WELCOME
        ===================================================== */}

        <section className="welcome-section">

          <div className="welcome-badge">
            Active Session Verified
          </div>

          <h1 className="dashboard-title">
            Admin Dashboard
          </h1>

          <p className="welcome-message">
            Welcome back,{' '}

            <strong className="highlight-name">
              {adminName}
            </strong>.

            {' '}
            You are securely authenticated as an administrator.
          </p>

        </section>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="quick-actions-section">

          <div className="section-title-row">

            <div>

              <span className="section-eyebrow">
                CATALOGUE
              </span>

              <h2 className="section-title">
                Manage Ishaa Collections
              </h2>

              <p className="section-description">
                Add products, manage variants, update stock and
                maintain your catalogue.
              </p>

            </div>

          </div>


          <div className="quick-actions-grid">

            {/* PRODUCTS */}

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate('/admin/products')
              }
            >

              <div className="quick-action-icon">
                🛍️
              </div>

              <div className="quick-action-content">

                <h3>
                  Products
                </h3>

                <p>
                  View and manage your complete catalogue.
                </p>

              </div>

              <span className="quick-action-arrow">
                →
              </span>

            </button>


            {/* ADD PRODUCT */}

            <button
              type="button"
              className="quick-action-card featured"
              onClick={() =>
                navigate('/admin/products/new')
              }
            >

              <div className="quick-action-icon">
                ＋
              </div>

              <div className="quick-action-content">

                <h3>
                  Add Product
                </h3>

                <p>
                  Create a new product with colors, sizes and photos.
                </p>

              </div>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

          </div>

        </section>


        {/* =====================================================
            ADMIN DETAILS + AUTH STATUS
        ===================================================== */}

        <section className="cards-grid">

          {/* ADMIN DETAILS */}

          <div className="dashboard-card user-card">

            <div className="card-header">

              <div className="card-icon-wrapper">

                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>

              </div>

              <h3>
                Administrator Details
              </h3>

            </div>


            <div className="card-body">

              <div className="detail-row">

                <span className="detail-label">
                  Name:
                </span>

                <span className="detail-value">
                  {adminName}
                </span>

              </div>


              <div className="detail-row">

                <span className="detail-label">
                  Email:
                </span>

                <span className="detail-value">
                  {adminEmail}
                </span>

              </div>


              <div className="detail-row">

                <span className="detail-label">
                  Admin ID:
                </span>

                <span className="detail-value">
                  #{adminId}
                </span>

              </div>


              <div className="detail-row">

                <span className="detail-label">
                  Storage Key:
                </span>

                <span className="detail-value key-tag">
                  ishaa_admin_token
                </span>

              </div>

            </div>

          </div>


          {/* AUTH STATUS */}

          <div className="dashboard-card status-card">

            <div className="card-header">

              <div className="card-icon-wrapper">

                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>

              </div>

              <h3>
                Authentication Status
              </h3>

            </div>


            <div className="card-body">

              <div className="status-indicator-box">

                <span className="status-dot green"></span>

                <div>

                  <span className="status-title">
                    Session Active & Secured
                  </span>

                  <p className="status-desc">

                    JWT token validated via{' '}

                    <code>
                      GET /api/admin/me
                    </code>

                  </p>

                </div>

              </div>


              <div className="milestone-note">

                <p>

                  ✨{' '}

                  <strong>
                    Authentication Ready
                  </strong>

                  {' '}

                  Your administrator session is active.
                  Use the catalogue actions above to manage products.

                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}