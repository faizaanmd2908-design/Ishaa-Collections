import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, setToken, getToken, getAdminProfile } from '../services/adminApi';

/**
 * LoginPage Component
 * 
 * Elegant, mobile-first login interface for Ishaa Collections Admin.
 * Handles credential input, submission state, error presentation,
 * token persistence in sessionStorage ('ishaa_admin_token'), and navigation.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingInitialAuth, setCheckingInitialAuth] = useState(true);

  const navigate = useNavigate();

  // If already logged in with valid token, auto-redirect to dashboard
  useEffect(() => {
    async function checkExistingAuth() {
      const existingToken = getToken();
      if (existingToken) {
        const res = await getAdminProfile(existingToken);
        if (res.success) {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      }
      setCheckingInitialAuth(false);
    }
    checkExistingAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    const result = await loginAdmin(email, password);

    if (result.success && result.token) {
      // Store token in sessionStorage under 'ishaa_admin_token'
      setToken(result.token);
      // Redirect to Admin Dashboard
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  if (checkingInitialAuth) {
    return (
      <div className="auth-loading-container">
        <div className="boutique-spinner"></div>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Boutique Branding Header */}
        <div className="brand-header">
          <div className="brand-logo-emblem">IC</div>
          <h1 className="brand-title">Ishaa Collections</h1>
          <p className="brand-subtitle">Boutique Catalogue & Admin Suite</p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="alert alert-error" role="alert">
            <svg className="alert-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">
              Admin Email
            </label>
            <div className="input-wrapper">
              <input
                id="admin-email"
                type="email"
                className="form-input"
                placeholder="admin@ishaacollections.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="admin-password"
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-spinner"></span>
                Logging in...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">Protected Admin Access • Ishaa Collections</p>
        </div>
      </div>
    </div>
  );
}
