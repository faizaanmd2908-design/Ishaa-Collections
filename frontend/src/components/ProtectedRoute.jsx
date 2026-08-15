import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, removeToken, getAdminProfile } from '../services/adminApi';

/**
 * ProtectedRoute Component
 * 
 * How Protected Routing Works:
 * 1. Checks if a token ('ishaa_admin_token') exists in sessionStorage.
 * 2. If no token is found, immediately redirects to /admin/login.
 * 3. If a token is found, sends an API request to backend (GET /api/admin/me) to verify validity.
 * 4. Shows a boutique loading state while verification is in progress.
 * 5. If backend confirms token is valid, renders the protected route (e.g. Dashboard).
 * 6. If backend returns invalid/expired, removes the token and redirects to /admin/login.
 */
export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      const token = getToken();

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      // Validate token with backend GET /api/admin/me
      const result = await getAdminProfile(token);

      if (isMounted) {
        if (result.success && result.admin) {
          setIsAuthenticated(true);
          setAdmin(result.admin);
        } else {
          // Token is invalid or expired -> clear session & redirect
          removeToken();
          setIsAuthenticated(false);
          setAdmin(null);
        }
        setLoading(false);
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="boutique-spinner"></div>
        <p className="loading-text">Verifying Ishaa Admin Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Clone child component and inject verified admin data as prop
  return React.cloneElement(children, { admin });
}
