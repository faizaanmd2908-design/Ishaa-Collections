/**
 * adminApi.js
 * Centralized service helper for Ishaa Collections Admin authentication and token management.
 * 
 * Token Storage:
 * Stored in sessionStorage under the key 'ishaa_admin_token'.
 * sessionStorage persists data while the browser tab is open and is automatically cleared
 * when the tab/window is closed.
 */

const TOKEN_KEY = 'ishaa_admin_token';
const API_BASE_URL = '/api';

/**
 * Retrieve the current admin JWT token from sessionStorage.
 * @returns {string|null} JWT token string or null if not logged in.
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Save the admin JWT token into sessionStorage.
 * @param {string} token - The JWT token received from backend login response.
 */
export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Remove the admin JWT token from sessionStorage (Logout).
 */
export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Perform admin login request.
 * 
 * POST /api/admin/login
 * Request Body: { email, password }
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, token?: string, admin?: object, message?: string}>}
 */
export async function loginAdmin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Login failed. Please check your credentials.',
      };
    }

    return {
      success: true,
      token: data.token,
      admin: data.admin,
      message: data.message,
    };
  } catch (error) {
    console.error('API Error [loginAdmin]:', error);
    return {
      success: false,
      message: 'Unable to connect to server. Please check backend connection.',
    };
  }
}

/**
 * Verify admin token and fetch profile details.
 * 
 * GET /api/admin/me
 * Header: Authorization: Bearer <token>
 * 
 * @param {string} token 
 * @returns {Promise<{success: boolean, admin?: object, message?: string}>}
 */
export async function getAdminProfile(token) {
  if (!token) {
    return { success: false, message: 'No token provided' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Session invalid or expired.',
      };
    }

    return {
      success: true,
      admin: data.admin,
    };
  } catch (error) {
    console.error('API Error [getAdminProfile]:', error);
    return {
      success: false,
      message: 'Network error while verifying session.',
    };
  }
}

/**
 * Helper to build auth headers.
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Process API response and handle 401 session expiration.
 */
async function processResponse(response) {
  if (response.status === 401) {
    removeToken();
    return {
      success: false,
      isUnauthorized: true,
      message: 'Session expired or invalid. Please log in again.',
    };
  }

  try {
    const data = await response.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: 'Failed to parse server response.',
    };
  }
}

/**
 * Fetch all admin products.
 * GET /api/admin/products
 */
export async function fetchAdminProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await processResponse(response);
    if (!response.ok || !data.success) {
      return {
        success: false,
        isUnauthorized: data.isUnauthorized || false,
        message: data.message || 'Failed to fetch products',
      };
    }
    return { success: true, products: data.products || [] };
  } catch (error) {
    console.error('API Error [fetchAdminProducts]:', error);
    return { success: false, message: 'Network error while fetching products.' };
  }
}


/**
 * Fetch full product details including variants, sizes, and images.
 * GET /api/products/:id/details
 */
export async function fetchProductDetails(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/details`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to fetch product details' };
    }
    return { success: true, product: data.product };
  } catch (error) {
    console.error('API Error [fetchProductDetails]:', error);
    return { success: false, message: 'Network error while fetching product details.' };
  }
}

/**
 * Create a new product base record.
 * POST /api/admin/products
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to create product' };
    }
    return { success: true, productId: data.productId, message: data.message };
  } catch (error) {
    console.error('API Error [createProduct]:', error);
    return { success: false, message: 'Network error while creating product.' };
  }
}

/**
 * Update an existing product base record.
 * PUT /api/admin/products/:id
 */
export async function updateProduct(id, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to update product' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [updateProduct]:', error);
    return { success: false, message: 'Network error while updating product.' };
  }
}

/**
 * Delete a product by ID.
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to delete product' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [deleteProduct]:', error);
    return { success: false, message: 'Network error while deleting product.' };
  }
}

/**
 * Create a variant for a product.
 * POST /api/admin/products/:id/variants
 */
export async function createVariant(productId, variantData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/variants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(variantData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to create variant' };
    }
    return { success: true, variantId: data.variantId, message: data.message };
  } catch (error) {
    console.error('API Error [createVariant]:', error);
    return { success: false, message: 'Network error while creating variant.' };
  }
}

/**
 * Update an existing variant.
 * PUT /api/admin/variants/:id
 */
export async function updateVariant(variantId, variantData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/variants/${variantId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(variantData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to update variant' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [updateVariant]:', error);
    return { success: false, message: 'Network error while updating variant.' };
  }
}

/**
 * Delete a variant by ID.
 * DELETE /api/admin/variants/:id
 */
export async function deleteVariant(variantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/variants/${variantId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to delete variant' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [deleteVariant]:', error);
    return { success: false, message: 'Network error while deleting variant.' };
  }
}

/**
 * Create a size record for a variant.
 * POST /api/admin/variants/:id/sizes
 */
export async function createSize(variantId, sizeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/variants/${variantId}/sizes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sizeData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to create size' };
    }
    return { success: true, sizeId: data.sizeId, message: data.message };
  } catch (error) {
    console.error('API Error [createSize]:', error);
    return { success: false, message: 'Network error while creating size.' };
  }
}

/**
 * Update an existing size record.
 * PUT /api/admin/sizes/:id
 */
export async function updateSize(sizeId, sizeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/sizes/${sizeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(sizeData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to update size' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [updateSize]:', error);
    return { success: false, message: 'Network error while updating size.' };
  }
}

/**
 * Delete a size record.
 * DELETE /api/admin/sizes/:id
 */
export async function deleteSize(sizeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/sizes/${sizeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to delete size' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [deleteSize]:', error);
    return { success: false, message: 'Network error while deleting size.' };
  }
}

/**
 * Create an image record for a variant.
 * POST /api/admin/variants/:id/images
 */
export async function createImage(variantId, imageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/variants/${variantId}/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(imageData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to add image' };
    }
    return { success: true, imageId: data.imageId, message: data.message };
  } catch (error) {
    console.error('API Error [createImage]:', error);
    return { success: false, message: 'Network error while adding image.' };
  }
}

/**
 * Update an existing image record.
 * PUT /api/admin/images/:id
 */
export async function updateImage(imageId, imageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/images/${imageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(imageData),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to update image' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [updateImage]:', error);
    return { success: false, message: 'Network error while updating image.' };
  }
}

/**
 * Delete an image record.
 * DELETE /api/admin/images/:id
 */
export async function deleteImage(imageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to delete image' };
    }
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error [deleteImage]:', error);
    return { success: false, message: 'Network error while deleting image.' };
  }
}

