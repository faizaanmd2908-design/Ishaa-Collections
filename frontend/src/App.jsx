import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

// Customer
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';

// Admin
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import ProtectedRoute from './components/ProtectedRoute';

// Cart
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <BrowserRouter>

      <CartProvider>

        <Routes>

          {/* ============================
              CUSTOMER
          ============================ */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/category/:category"
            element={<CategoryPage />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetailsPage />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />


          {/* ============================
              ADMIN
          ============================ */}

          <Route
            path="/admin/login"
            element={<LoginPage />}
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />


          {/* ============================
              FALLBACK
          ============================ */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </CartProvider>

    </BrowserRouter>
  );
}