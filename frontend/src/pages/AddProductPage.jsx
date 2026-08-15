import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import ProductForm from '../components/ProductForm';
import {
  createProduct,
  createVariant,
  createSize,
  createImage,
} from '../services/adminApi';

/**
 * AddProductPage Component
 * Handles the complete multi-step creation publish workflow for new catalog items.
 */
export default function AddProductPage({ admin }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    category: 'Saree',
    description: '',
    fabric: '',
    additional_details: '',
    variants: [
      {
        color: 'Red',
        price: '',
        availability: 1,
        images: [],
        sizes: [],
      },
    ],
  });

  const handlePublish = async (submittedData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (!submittedData.product_code || !submittedData.name || !submittedData.category) {
        setErrorMsg('Product code, name, and category are required.');
        setIsSubmitting(false);
        return;
      }

      if (!submittedData.variants || submittedData.variants.length === 0) {
        setErrorMsg('Please add at least one color variant for this product.');
        setIsSubmitting(false);
        return;
      }

      // Step A: Create the main product
      const mainRes = await createProduct({
        product_code: submittedData.product_code.trim().toUpperCase(),
        name: submittedData.name.trim(),
        category: submittedData.category,
        description: submittedData.description ? submittedData.description.trim() : null,
        fabric: submittedData.fabric ? submittedData.fabric.trim() : null,
        additional_details: submittedData.additional_details ? submittedData.additional_details.trim() : null,
      });

      if (!mainRes.success || !mainRes.productId) {
        throw new Error(mainRes.message || 'Failed to create main product.');
      }

      const productId = mainRes.productId;
      const categoryUpper = submittedData.category.toUpperCase();
      const isSizeCategory = categoryUpper === 'DRESS' || categoryUpper === 'NIGHTY';

      // Step B: For every variant
      for (const variant of submittedData.variants) {
        const variantRes = await createVariant(productId, {
          color: variant.color ? variant.color.trim() : 'Standard',
          price: Number(variant.price) || 0,
          availability: Number(variant.availability) === 1 || variant.availability === true ? 1 : 0,
        });

        if (!variantRes.success || !variantRes.variantId) {
          throw new Error(variantRes.message || `Failed to create variant ${variant.color}`);
        }

        const variantId = variantRes.variantId;

        // Step C: For every size (Dress & Nighty)
        if (isSizeCategory && variant.sizes && variant.sizes.length > 0) {
          for (const szObj of variant.sizes) {
            if (szObj.size) {
              await createSize(variantId, {
                size: szObj.size,
                availability: Number(szObj.availability) === 1 || szObj.availability === true ? 1 : 0,
              });
            }
          }
        }

        // Step D: For every image URL
        if (variant.images && variant.images.length > 0) {
          for (let i = 0; i < variant.images.length; i++) {
            const imgObj = variant.images[i];
            if (imgObj.image_url && imgObj.image_url.trim()) {
              await createImage(variantId, {
                image_url: imgObj.image_url.trim(),
                sort_order: i,
              });
            }
          }
        }
      }

      // Success! Redirect to product list
      navigate('/admin/products');
    } catch (err) {
      console.error('Publish Error:', err);
      setErrorMsg(err.message || 'An error occurred while publishing the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <AdminHeader adminName={admin?.name} />

      <main className="product-form-main">
        {errorMsg && (
          <div className="alert alert-error form-alert-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <ProductForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handlePublish}
          isSubmitting={isSubmitting}
          submitText="Publish Product"
          title="Add New Product"
          subtitle="Enter basic details, color variants, stock availability, sizes, and image URLs"
          onCancel={() => navigate('/admin/products')}
        />
      </main>
    </div>
  );
}
