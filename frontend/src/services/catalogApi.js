/**
 * catalogApi.js
 * Service helper for customer-facing product catalogue endpoints.
 */

const API_BASE_URL = '/api';

/**
 * Fetch all public catalog products.
 * GET /api/products
 */
export async function fetchPublicProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to load products' };
    }
    return { success: true, products: data.products || [] };
  } catch (error) {
    console.error('Catalog API Error [fetchPublicProducts]:', error);
    return { success: false, message: 'Unable to connect to server.' };
  }
}

/**
 * Fetch complete details for a single product (including variants, sizes, and images).
 * GET /api/products/:id/details
 */
export async function fetchPublicProductDetails(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/details`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Failed to load product details' };
    }
    return { success: true, product: data.product };
  } catch (error) {
    console.error('Catalog API Error [fetchPublicProductDetails]:', error);
    return { success: false, message: 'Unable to connect to server.' };
  }
}
