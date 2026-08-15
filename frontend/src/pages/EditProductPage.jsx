import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import ProductForm from '../components/ProductForm';
import {
  fetchProductDetails,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  createSize,
  updateSize,
  deleteSize,
  createImage,
  updateImage,
  deleteImage,
} from '../services/adminApi';

/**
 * EditProductPage Component
 * Pre-populates product details, variants, sizes, and images.
 * Diff-synchronizes updates, additions, and deletions using backend PUT/POST/DELETE endpoints.
 */
export default function EditProductPage({ admin }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    category: 'Saree',
    description: '',
    fabric: '',
    additional_details: '',
    variants: [],
  });

  // Reference to original state to diff deletions
  const originalProductRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetchProductDetails(id);

      if (!res.success || !res.product) {
        setErrorMsg(res.message || 'Product not found.');
        setLoading(false);
        return;
      }

      const prod = res.product;
      originalProductRef.current = JSON.parse(JSON.stringify(prod));

      setFormData({
        id: prod.id,
        product_code: prod.product_code || '',
        name: prod.name || '',
        category: prod.category || 'Saree',
        description: prod.description || '',
        fabric: prod.fabric || '',
        additional_details: prod.additional_details || '',
        variants: (prod.variants || []).map((v) => ({
          ...v,
          price: v.price !== undefined && v.price !== null ? v.price : '',
          images: v.images || [],
          sizes: v.sizes || [],
        })),
      });

      setLoading(false);
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const handleUpdate = async (submittedData) => {
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

      const productId = id;
      const origProduct = originalProductRef.current;
      const categoryUpper = submittedData.category.toUpperCase();
      const isSizeCategory = categoryUpper === 'DRESS' || categoryUpper === 'NIGHTY';

      // 1. Update basic product record
      const mainRes = await updateProduct(productId, {
        product_code: submittedData.product_code.trim().toUpperCase(),
        name: submittedData.name.trim(),
        category: submittedData.category,
        description: submittedData.description ? submittedData.description.trim() : null,
        fabric: submittedData.fabric ? submittedData.fabric.trim() : null,
        additional_details: submittedData.additional_details ? submittedData.additional_details.trim() : null,
      });

      if (!mainRes.success) {
        throw new Error(mainRes.message || 'Failed to update main product details.');
      }

      // 2. Identify deleted variants
      const origVariants = origProduct ? origProduct.variants || [] : [];
      const currentVariantIds = submittedData.variants.map((v) => v.id).filter(Boolean);

      for (const origVar of origVariants) {
        if (!currentVariantIds.includes(origVar.id)) {
          await deleteVariant(origVar.id);
        }
      }

      // 3. Process current variants (Update existing or Create new)
      for (const variant of submittedData.variants) {
        const variantPayload = {
          color: variant.color ? variant.color.trim() : 'Standard',
          price: Number(variant.price) || 0,
          availability: Number(variant.availability) === 1 || variant.availability === true ? 1 : 0,
        };

        if (variant.id) {
          // UPDATE existing variant
          await updateVariant(variant.id, variantPayload);
          const variantId = variant.id;

          // Find original version of this variant
          const origVar = origVariants.find((ov) => ov.id === variantId);
          const origSizes = origVar ? origVar.sizes || [] : [];
          const origImages = origVar ? origVar.images || [] : [];

          // Sizes diff for existing variant
          if (isSizeCategory) {
            const currentSizeIds = (variant.sizes || []).map((s) => s.id).filter(Boolean);
            // Delete removed sizes
            for (const os of origSizes) {
              if (!currentSizeIds.includes(os.id)) {
                await deleteSize(os.id);
              }
            }
            // Add or Update sizes
            for (const szObj of variant.sizes || []) {
              if (szObj.size) {
                const szPayload = {
                  size: szObj.size,
                  availability: Number(szObj.availability) === 1 || szObj.availability === true ? 1 : 0,
                };
                if (szObj.id) {
                  await updateSize(szObj.id, szPayload);
                } else {
                  await createSize(variantId, szPayload);
                }
              }
            }
          }

          // Images diff for existing variant
          const currentImageIds = (variant.images || []).map((img) => img.id).filter(Boolean);
          // Delete removed images
          for (const oi of origImages) {
            if (!currentImageIds.includes(oi.id)) {
              await deleteImage(oi.id);
            }
          }
          // Add or Update images
          for (let i = 0; i < (variant.images || []).length; i++) {
            const imgObj = variant.images[i];
            if (imgObj.image_url && imgObj.image_url.trim()) {
              const imgPayload = {
                image_url: imgObj.image_url.trim(),
                sort_order: i,
              };
              if (imgObj.id) {
                await updateImage(imgObj.id, imgPayload);
              } else {
                await createImage(variantId, imgPayload);
              }
            }
          }
        } else {
          // CREATE new variant added during edit
          const createVarRes = await createVariant(productId, variantPayload);
          if (createVarRes.success && createVarRes.variantId) {
            const newVariantId = createVarRes.variantId;

            // Sizes for new variant
            if (isSizeCategory && variant.sizes) {
              for (const szObj of variant.sizes) {
                if (szObj.size) {
                  await createSize(newVariantId, {
                    size: szObj.size,
                    availability: Number(szObj.availability) === 1 || szObj.availability === true ? 1 : 0,
                  });
                }
              }
            }

            // Images for new variant
            if (variant.images) {
              for (let i = 0; i < variant.images.length; i++) {
                const imgObj = variant.images[i];
                if (imgObj.image_url && imgObj.image_url.trim()) {
                  await createImage(newVariantId, {
                    image_url: imgObj.image_url.trim(),
                    sort_order: i,
                  });
                }
              }
            }
          }
        }
      }

      // Success! Redirect to product list
      navigate('/admin/products');
    } catch (err) {
      console.error('Update Error:', err);
      setErrorMsg(err.message || 'An error occurred while updating the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <AdminHeader adminName={admin?.name} />

      <main className="product-form-main">
        {loading ? (
          <div className="list-loading-state">
            <div className="boutique-spinner" />
            <p className="loading-text">Loading product details...</p>
          </div>
        ) : errorMsg ? (
          <div className="alert alert-error form-alert-box">
            <span>{errorMsg}</span>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/admin/products')}
            >
              Back to Products
            </button>
          </div>
        ) : (
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            isSubmitting={isSubmitting}
            submitText="Save Changes"
            title={`Edit Product: ${formData.product_code}`}
            subtitle="Modify basic info, color variants, stock availability, sizes, and image URLs"
            onCancel={() => navigate('/admin/products')}
          />
        )}
      </main>
    </div>
  );
}
