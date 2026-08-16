import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API = 'https://ishaa-collections-backend.onrender.com/api';

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

function getToken() {
    return sessionStorage.getItem('ishaa_admin_token');
}

function authHeaders(includeJson = false) {
    return {
        Authorization: `Bearer ${getToken()}`,
        ...(includeJson ? { 'Content-Type': 'application/json' } : {})
    };
}

function createEmptyVariant() {
    return {
        id: null,
        color: '',
        price: '',
        availability: true,
        sizes: [],
        images: []
    };
}

export default function ProductFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const editing = Boolean(id);

    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [product, setProduct] = useState({
        product_code: '',
        name: '',
        category: 'dress',
        description: '',
        fabric: '',
        additional_details: '',
        variants: []
    });

    // =========================================================
    // LOAD EXISTING PRODUCT
    // =========================================================

    useEffect(() => {
        if (editing) {
            loadProduct();
        }
    }, [editing, id]);

    async function parseResponse(response) {
        let data = {};

        try {
            data = await response.json();
        } catch {
            throw new Error('Server returned an invalid response.');
        }

        if (response.status === 401) {
            sessionStorage.removeItem('ishaa_admin_token');

            navigate('/admin/login', {
                replace: true
            });

            throw new Error('Your admin session has expired.');
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Request failed.'
            );
        }

        return data;
    }

    async function loadProduct() {
        try {
            setLoading(true);
            setError('');

            if (!id) {
                throw new Error('Invalid product ID.');
            }

            const response = await fetch(
                `${API}/products/${id}/details`
            );

            const data = await parseResponse(response);

            const p = data.product;

            setProduct({
                product_code: p.product_code || '',
                name: p.name || '',
                category: p.category || 'dress',
                description: p.description || '',
                fabric: p.fabric || '',
                additional_details: p.additional_details || '',

                variants: (p.variants || []).map((variant) => ({
                    id: variant.id || null,
                    color: variant.color || '',
                    price:
                        variant.price !== null &&
                            variant.price !== undefined
                            ? String(variant.price)
                            : '',
                    availability: Boolean(variant.availability),

                    sizes: (variant.sizes || []).map((size) => ({
                        id: size.id || null,
                        size: size.size || '',
                        availability: Boolean(size.availability)
                    })),

                    images: (variant.images || []).map((image) => ({
                        id: image.id || null,
                        image_url:
                            image.image_url ||
                            image.url ||
                            image.secure_url ||
                            '',
                        sort_order:
                            image.sort_order || 0
                    }))
                }))
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // =========================================================
    // BASIC PRODUCT FIELD UPDATE
    // IMPORTANT: This is deliberately NOT called updateProduct
    // =========================================================

    function updateProductField(field, value) {
        setProduct((current) => ({
            ...current,
            [field]: value
        }));
    }

    // =========================================================
    // VARIANT MANAGEMENT
    // =========================================================

    function addVariant() {
        setProduct((current) => ({
            ...current,
            variants: [
                ...current.variants,
                createEmptyVariant()
            ]
        }));
    }

    function removeVariant(index) {
        setProduct((current) => ({
            ...current,
            variants: current.variants.filter(
                (_, i) => i !== index
            )
        }));
    }

    function updateVariantField(
        variantIndex,
        field,
        value
    ) {
        setProduct((current) => {
            const variants = [...current.variants];

            variants[variantIndex] = {
                ...variants[variantIndex],
                [field]: value
            };

            return {
                ...current,
                variants
            };
        });
    }

    // =========================================================
    // SIZE MANAGEMENT
    // =========================================================

    function addSize(variantIndex, size) {
        setProduct((current) => {
            const variants = [...current.variants];

            const variant = variants[variantIndex];

            const alreadyExists = variant.sizes.some(
                (item) => item.size === size
            );

            if (alreadyExists) {
                return current;
            }

            variants[variantIndex] = {
                ...variant,
                sizes: [
                    ...variant.sizes,
                    {
                        id: null,
                        size,
                        availability: true
                    }
                ]
            };

            return {
                ...current,
                variants
            };
        });
    }

    function toggleSizeAvailability(
        variantIndex,
        sizeIndex
    ) {
        setProduct((current) => {
            const variants = [...current.variants];

            const sizes = [...variants[variantIndex].sizes];

            sizes[sizeIndex] = {
                ...sizes[sizeIndex],
                availability:
                    !sizes[sizeIndex].availability
            };

            variants[variantIndex] = {
                ...variants[variantIndex],
                sizes
            };

            return {
                ...current,
                variants
            };
        });
    }

    function removeSize(
        variantIndex,
        sizeIndex
    ) {
        setProduct((current) => {
            const variants = [...current.variants];

            variants[variantIndex] = {
                ...variants[variantIndex],
                sizes: variants[
                    variantIndex
                ].sizes.filter(
                    (_, index) => index !== sizeIndex
                )
            };

            return {
                ...current,
                variants
            };
        });
    }

    // =========================================================
    // IMAGE UPLOAD
    // =========================================================

    async function uploadImage(
        variantIndex,
        file
    ) {
        if (!file) {
            return;
        }

        try {
            setError('');

            const formData = new FormData();

            formData.append('image', file);

            const response = await fetch(
                `${API}/admin/upload-image`,
                {
                    method: 'POST',
                    headers: authHeaders(),
                    body: formData
                }
            );

            const data = await parseResponse(response);

            const imageUrl =
                data.secure_url ||
                data.url ||
                data.image_url;

            if (!imageUrl) {
                throw new Error(
                    'Image uploaded but no image URL was returned.'
                );
            }

            setProduct((current) => {
                const variants = [...current.variants];

                variants[variantIndex] = {
                    ...variants[variantIndex],

                    images: [
                        ...variants[variantIndex].images,
                        {
                            id: null,
                            image_url: imageUrl,
                            sort_order:
                                variants[variantIndex]
                                    .images.length + 1
                        }
                    ]
                };

                return {
                    ...current,
                    variants
                };
            });
        } catch (err) {
            setError(err.message);
        }
    }

    function removeImage(
        variantIndex,
        imageIndex
    ) {
        setProduct((current) => {
            const variants = [...current.variants];

            variants[variantIndex] = {
                ...variants[variantIndex],

                images:
                    variants[variantIndex].images.filter(
                        (_, index) => index !== imageIndex
                    )
            };

            return {
                ...current,
                variants
            };
        });
    }

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    async function createNewProduct() {
        const productResponse = await fetch(
            `${API}/admin/products`,
            {
                method: 'POST',
                headers: authHeaders(true),

                body: JSON.stringify({
                    product_code:
                        product.product_code.trim(),

                    name:
                        product.name.trim(),

                    description:
                        product.description.trim(),

                    category:
                        product.category,

                    fabric:
                        product.fabric.trim(),

                    additional_details:
                        product.additional_details.trim()
                })
            }
        );

        const createdProduct =
            await parseResponse(productResponse);

        const productId =
            createdProduct.productId;

        if (!productId) {
            throw new Error(
                'Product was created but no product ID was returned.'
            );
        }

        // -------------------------------------------------------
        // CREATE VARIANTS
        // -------------------------------------------------------

        for (const variant of product.variants) {
            const variantResponse =
                await fetch(
                    `${API}/admin/products/${productId}/variants`,
                    {
                        method: 'POST',
                        headers: authHeaders(true),

                        body: JSON.stringify({
                            color:
                                variant.color.trim(),

                            price:
                                Number(variant.price),

                            availability:
                                variant.availability ? 1 : 0
                        })
                    }
                );

            const createdVariant =
                await parseResponse(
                    variantResponse
                );

            const variantId =
                createdVariant.variantId;

            if (!variantId) {
                throw new Error(
                    `Variant "${variant.color}" was created without an ID.`
                );
            }

            // -----------------------------------------------------
            // CREATE SIZES
            // -----------------------------------------------------

            for (const size of variant.sizes) {
                await parseResponse(
                    await fetch(
                        `${API}/admin/variants/${variantId}/sizes`,
                        {
                            method: 'POST',
                            headers: authHeaders(true),

                            body: JSON.stringify({
                                size: size.size,

                                availability:
                                    size.availability
                                        ? 1
                                        : 0
                            })
                        }
                    )
                );
            }

            // -----------------------------------------------------
            // CREATE IMAGES
            // -----------------------------------------------------

            for (
                let imageIndex = 0;
                imageIndex < variant.images.length;
                imageIndex++
            ) {
                const image =
                    variant.images[imageIndex];

                await parseResponse(
                    await fetch(
                        `${API}/admin/variants/${variantId}/images`,
                        {
                            method: 'POST',
                            headers: authHeaders(true),

                            body: JSON.stringify({
                                image_url:
                                    image.image_url,

                                sort_order:
                                    imageIndex + 1
                            })
                        }
                    )
                );
            }
        }
    }

    // =========================================================
    // UPDATE EXISTING PRODUCT
    // IMPORTANT: Different name from updateProductField
    // =========================================================

    async function updateExistingProduct() {
        if (!id) {
            throw new Error(
                'Invalid product ID.'
            );
        }

        await parseResponse(
            await fetch(
                `${API}/admin/products/${id}`,
                {
                    method: 'PUT',
                    headers: authHeaders(true),

                    body: JSON.stringify({
                        product_code:
                            product.product_code.trim(),

                        name:
                            product.name.trim(),

                        description:
                            product.description.trim(),

                        category:
                            product.category,

                        fabric:
                            product.fabric.trim(),

                        additional_details:
                            product.additional_details.trim()
                    })
                }
            )
        );

        // -------------------------------------------------------
        // UPDATE / CREATE VARIANTS
        // -------------------------------------------------------

        for (const variant of product.variants) {
            let variantId =
                variant.id;

            if (variantId) {
                await parseResponse(
                    await fetch(
                        `${API}/admin/variants/${variantId}`,
                        {
                            method: 'PUT',
                            headers: authHeaders(true),

                            body: JSON.stringify({
                                color:
                                    variant.color.trim(),

                                price:
                                    Number(variant.price),

                                availability:
                                    variant.availability
                                        ? 1
                                        : 0
                            })
                        }
                    )
                );
            } else {
                const createdVariant =
                    await parseResponse(
                        await fetch(
                            `${API}/admin/products/${id}/variants`,
                            {
                                method: 'POST',
                                headers: authHeaders(true),

                                body: JSON.stringify({
                                    color:
                                        variant.color.trim(),

                                    price:
                                        Number(variant.price),

                                    availability:
                                        variant.availability
                                            ? 1
                                            : 0
                                })
                            }
                        )
                    );

                variantId =
                    createdVariant.variantId;
            }

            if (!variantId) {
                throw new Error(
                    `Variant "${variant.color}" has no ID.`
                );
            }

            // -----------------------------------------------------
            // UPDATE / CREATE SIZES
            // -----------------------------------------------------

            for (const size of variant.sizes) {
                if (size.id) {
                    await parseResponse(
                        await fetch(
                            `${API}/admin/sizes/${size.id}`,
                            {
                                method: 'PUT',
                                headers: authHeaders(true),

                                body: JSON.stringify({
                                    size:
                                        size.size,

                                    availability:
                                        size.availability
                                            ? 1
                                            : 0
                                })
                            }
                        )
                    );
                } else {
                    await parseResponse(
                        await fetch(
                            `${API}/admin/variants/${variantId}/sizes`,
                            {
                                method: 'POST',
                                headers: authHeaders(true),

                                body: JSON.stringify({
                                    size:
                                        size.size,

                                    availability:
                                        size.availability
                                            ? 1
                                            : 0
                                })
                            }
                        )
                    );
                }
            }

            // -----------------------------------------------------
            // CREATE NEW IMAGES
            // -----------------------------------------------------

            for (
                let imageIndex = 0;
                imageIndex < variant.images.length;
                imageIndex++
            ) {
                const image =
                    variant.images[imageIndex];

                // Existing image
                if (image.id) {
                    continue;
                }

                await parseResponse(
                    await fetch(
                        `${API}/admin/variants/${variantId}/images`,
                        {
                            method: 'POST',
                            headers: authHeaders(true),

                            body: JSON.stringify({
                                image_url:
                                    image.image_url,

                                sort_order:
                                    imageIndex + 1
                            })
                        }
                    )
                );
            }
        }
    }

    // =========================================================
    // FORM SUBMIT
    // =========================================================

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');

        // -------------------------------------------------------
        // VALIDATION
        // -------------------------------------------------------

        if (
            !product.product_code.trim()
        ) {
            setError(
                'Product code is required.'
            );
            return;
        }

        if (
            !product.name.trim()
        ) {
            setError(
                'Product name is required.'
            );
            return;
        }

        if (
            product.variants.length === 0
        ) {
            setError(
                'Add at least one color variant.'
            );
            return;
        }

        for (
            const variant
            of product.variants
        ) {
            if (
                !variant.color.trim()
            ) {
                setError(
                    'Every variant needs a color.'
                );
                return;
            }

            if (
                variant.price === '' ||
                Number.isNaN(
                    Number(variant.price)
                ) ||
                Number(variant.price) < 0
            ) {
                setError(
                    `Enter a valid price for ${variant.color}.`
                );
                return;
            }
        }

        // -------------------------------------------------------
        // SAVE
        // -------------------------------------------------------

        try {
            setSaving(true);

            if (editing) {
                await updateExistingProduct();

                setSuccess(
                    'Product updated successfully.'
                );
            } else {
                await createNewProduct();

                setSuccess(
                    'Product published successfully.'
                );
            }

            setTimeout(() => {
                navigate(
                    '/admin/products',
                    {
                        replace: true
                    }
                );
            }, 900);

        } catch (err) {
            console.error(
                'Product save error:',
                err
            );

            setError(
                err.message ||
                'Failed to save product.'
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="auth-loading-container">
                <div className="boutique-spinner" />

                <p className="loading-text">
                    Loading product...
                </p>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="admin-page-container">

            <main className="product-form-main">

                {/* =================================================
            HEADER
        ================================================= */}

                <div className="form-header-card">

                    <div className="page-heading-bar">

                        <div className="heading-title-block">

                            <h1 className="form-main-title">
                                {editing
                                    ? 'Edit Product'
                                    : 'Add Product'}
                            </h1>

                            <p className="form-subtitle">
                                {editing
                                    ? 'Update your catalogue item.'
                                    : 'Add a new Ishaa Collections catalogue item.'}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate('/admin/products')
                            }
                        >
                            ← Products
                        </button>

                    </div>

                </div>

                {/* =================================================
            ERROR
        ================================================= */}

                {error && (
                    <div className="form-alert-box">

                        <div className="alert alert-error">
                            {error}
                        </div>

                    </div>
                )}

                {/* =================================================
            SUCCESS
        ================================================= */}

                {success && (
                    <div className="toast-notification">
                        ✓ {success}
                    </div>
                )}

                <form
                    className="product-form-container"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
              BASIC INFORMATION
          ================================================= */}

                    <section className="form-section-card">

                        <div className="section-header">

                            <div className="section-icon">
                                ✦
                            </div>

                            <div>
                                <h3>
                                    Basic Information
                                </h3>

                                <p className="section-subtext">
                                    Main details displayed in your catalogue.
                                </p>
                            </div>

                        </div>

                        <div className="section-body">

                            {/* PRODUCT CODE + NAME */}

                            <div className="form-row two-col">

                                <div className="form-group">

                                    <label className="form-label">
                                        Product Code *
                                    </label>

                                    <input
                                        className="form-input"
                                        type="text"
                                        value={product.product_code}
                                        onChange={(event) =>
                                            updateProductField(
                                                'product_code',
                                                event.target.value
                                            )
                                        }
                                        placeholder="D009"
                                    />

                                </div>

                                <div className="form-group">

                                    <label className="form-label">
                                        Product Name *
                                    </label>

                                    <input
                                        className="form-input"
                                        type="text"
                                        value={product.name}
                                        onChange={(event) =>
                                            updateProductField(
                                                'name',
                                                event.target.value
                                            )
                                        }
                                        placeholder="Summer Floral Dress"
                                    />

                                </div>

                            </div>

                            {/* CATEGORY + FABRIC */}

                            <div className="form-row two-col">

                                <div className="form-group">

                                    <label className="form-label">
                                        Category *
                                    </label>

                                    <select
                                        className="form-input form-select"
                                        value={product.category}
                                        onChange={(event) =>
                                            updateProductField(
                                                'category',
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="saree">
                                            Saree
                                        </option>

                                        <option value="dress">
                                            Dress
                                        </option>

                                        <option value="nighty">
                                            Nighty
                                        </option>
                                    </select>

                                </div>

                                <div className="form-group">

                                    <label className="form-label">
                                        Fabric
                                    </label>

                                    <input
                                        className="form-input"
                                        type="text"
                                        value={product.fabric}
                                        onChange={(event) =>
                                            updateProductField(
                                                'fabric',
                                                event.target.value
                                            )
                                        }
                                        placeholder="Cotton"
                                    />

                                </div>

                            </div>

                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label className="form-label">
                                    Description
                                </label>

                                <textarea
                                    className="form-input form-textarea"
                                    value={product.description}
                                    onChange={(event) =>
                                        updateProductField(
                                            'description',
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe this product..."
                                />

                            </div>

                            {/* ADDITIONAL DETAILS */}

                            <div className="form-group">

                                <label className="form-label">
                                    Additional Details
                                </label>

                                <textarea
                                    className="form-input form-textarea"
                                    value={product.additional_details}
                                    onChange={(event) =>
                                        updateProductField(
                                            'additional_details',
                                            event.target.value
                                        )
                                    }
                                    placeholder="Additional product information..."
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
              VARIANTS
          ================================================= */}

                    <section className="form-section-card">

                        <div className="section-header between">

                            <div className="header-left">

                                <div className="section-icon">
                                    ◈
                                </div>

                                <div>

                                    <h3>
                                        Variants
                                    </h3>

                                    <p className="section-subtext">
                                        Colors, prices, stock, sizes and photos.
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-gold btn-sm"
                                onClick={addVariant}
                            >
                                + Add Color
                            </button>

                        </div>


                        <div className="variants-list">

                            {/* EMPTY */}

                            {product.variants.length === 0 && (
                                <div className="empty-variants-box">

                                    <div>
                                        No variants yet.
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-gold"
                                        onClick={addVariant}
                                    >
                                        + Add First Color
                                    </button>

                                </div>
                            )}


                            {/* VARIANTS */}

                            {product.variants.map(
                                (variant, variantIndex) => (
                                    <div
                                        className="variant-card"
                                        key={
                                            variant.id ||
                                            `new-variant-${variantIndex}`
                                        }
                                    >

                                        {/* VARIANT HEADER */}

                                        <div className="variant-card-header">

                                            <div className="variant-title-group">

                                                <span className="variant-number-badge">
                                                    Color {variantIndex + 1}
                                                </span>

                                                <span
                                                    className="variant-color-preview-dot"
                                                    style={{
                                                        background:
                                                            variant.color ||
                                                            'transparent'
                                                    }}
                                                />

                                                <span className="variant-color-title">
                                                    {variant.color ||
                                                        'New Color'}
                                                </span>

                                            </div>

                                            <button
                                                type="button"
                                                className="btn-delete-variant"
                                                onClick={() =>
                                                    removeVariant(
                                                        variantIndex
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>

                                        </div>


                                        {/* VARIANT BODY */}

                                        <div className="variant-card-body">

                                            <div className="variant-form-row">

                                                {/* COLOR */}

                                                <div className="flex-2">

                                                    <label className="form-label">
                                                        Color
                                                    </label>

                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(event) =>
                                                            updateVariantField(
                                                                variantIndex,
                                                                'color',
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Red"
                                                    />

                                                </div>


                                                {/* PRICE */}

                                                <div className="flex-1">

                                                    <label className="form-label">
                                                        Price
                                                    </label>

                                                    <div className="currency-input-wrapper">

                                                        <span className="currency-prefix">
                                                            ₹
                                                        </span>

                                                        <input
                                                            className="form-input price-input"
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={variant.price}
                                                            onChange={(event) =>
                                                                updateVariantField(
                                                                    variantIndex,
                                                                    'price',
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="999"
                                                        />

                                                    </div>

                                                </div>


                                                {/* AVAILABILITY */}

                                                <div className="flex-1">

                                                    <label className="form-label">
                                                        Availability
                                                    </label>

                                                    <button
                                                        type="button"
                                                        className={
                                                            variant.availability
                                                                ? 'btn-stock-toggle available'
                                                                : 'btn-stock-toggle sold-out'
                                                        }
                                                        onClick={() =>
                                                            updateVariantField(
                                                                variantIndex,
                                                                'availability',
                                                                !variant.availability
                                                            )
                                                        }
                                                    >
                                                        {variant.availability
                                                            ? '● Available'
                                                            : '○ Sold Out'}
                                                    </button>

                                                </div>

                                            </div>


                                            {/* =================================================
                          SIZES
                      ================================================= */}

                                            {product.category !== 'saree' && (
                                                <div className="variant-section-divider">

                                                    <div className="size-editor">

                                                        <div className="editor-subheading">

                                                            <div>
                                                                <h4>
                                                                    Sizes
                                                                </h4>

                                                                <span className="size-hint">
                                                                    Tap a size to add it.
                                                                </span>
                                                            </div>

                                                        </div>


                                                        <div className="size-quick-add">

                                                            <span className="quick-add-label">
                                                                Quick Add:
                                                            </span>

                                                            <div className="chips-row">

                                                                {SIZE_OPTIONS.map(
                                                                    (size) => (
                                                                        <button
                                                                            key={size}
                                                                            type="button"
                                                                            className="chip-add-btn"
                                                                            onClick={() =>
                                                                                addSize(
                                                                                    variantIndex,
                                                                                    size
                                                                                )
                                                                            }
                                                                        >
                                                                            + {size}
                                                                        </button>
                                                                    )
                                                                )}

                                                            </div>

                                                        </div>


                                                        {variant.sizes.length > 0 && (
                                                            <div className="sizes-grid">

                                                                {variant.sizes.map(
                                                                    (
                                                                        size,
                                                                        sizeIndex
                                                                    ) => (
                                                                        <div
                                                                            className="size-item-card"
                                                                            key={
                                                                                size.id ||
                                                                                `${variantIndex}-${size.size}-${sizeIndex}`
                                                                            }
                                                                        >

                                                                            <span className="size-badge-name">
                                                                                {size.size}
                                                                            </span>

                                                                            <button
                                                                                type="button"
                                                                                className={
                                                                                    size.availability
                                                                                        ? 'btn-stock-toggle available'
                                                                                        : 'btn-stock-toggle sold-out'
                                                                                }
                                                                                onClick={() =>
                                                                                    toggleSizeAvailability(
                                                                                        variantIndex,
                                                                                        sizeIndex
                                                                                    )
                                                                                }
                                                                            >
                                                                                {size.availability
                                                                                    ? 'Available'
                                                                                    : 'Sold Out'}
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                className="btn-remove-size"
                                                                                onClick={() =>
                                                                                    removeSize(
                                                                                        variantIndex,
                                                                                        sizeIndex
                                                                                    )
                                                                                }
                                                                            >
                                                                                ×
                                                                            </button>

                                                                        </div>
                                                                    )
                                                                )}

                                                            </div>
                                                        )}

                                                    </div>

                                                </div>
                                            )}


                                            {/* =================================================
                          IMAGES
                      ================================================= */}

                                            <div className="variant-section-divider">

                                                <div className="image-url-editor">

                                                    <div className="editor-subheading">

                                                        <div>
                                                            <h4>
                                                                Photos
                                                            </h4>

                                                            <span className="size-hint">
                                                                Upload product photos for this color.
                                                            </span>
                                                        </div>

                                                    </div>


                                                    {variant.images.length === 0 && (
                                                        <p className="empty-subtext">
                                                            No photos uploaded yet.
                                                        </p>
                                                    )}


                                                    <div className="image-inputs-list">

                                                        {variant.images.map(
                                                            (
                                                                image,
                                                                imageIndex
                                                            ) => (
                                                                <div
                                                                    className="image-input-item"
                                                                    key={
                                                                        image.id ||
                                                                        `${variantIndex}-image-${imageIndex}`
                                                                    }
                                                                >

                                                                    <div className="image-preview-thumbnail">

                                                                        <img
                                                                            src={
                                                                                image.image_url
                                                                            }
                                                                            alt={
                                                                                `${variant.color || 'Product'} ${imageIndex + 1}`
                                                                            }
                                                                        />

                                                                    </div>

                                                                    <div className="image-url-field-group">

                                                                        <input
                                                                            className="form-input"
                                                                            type="text"
                                                                            value={
                                                                                image.image_url
                                                                            }
                                                                            readOnly
                                                                        />

                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        className="btn-remove-icon"
                                                                        onClick={() =>
                                                                            removeImage(
                                                                                variantIndex,
                                                                                imageIndex
                                                                            )
                                                                        }
                                                                    >
                                                                        ×
                                                                    </button>

                                                                </div>
                                                            )
                                                        )}

                                                    </div>


                                                    <label className="btn btn-outline-gold">

                                                        + Add Photo

                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            style={{
                                                                display: 'none'
                                                            }}
                                                            onChange={(
                                                                event
                                                            ) => {
                                                                const file =
                                                                    event
                                                                        .target
                                                                        .files?.[0];

                                                                uploadImage(
                                                                    variantIndex,
                                                                    file
                                                                );

                                                                event.target.value =
                                                                    '';
                                                            }}
                                                        />

                                                    </label>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </section>


                    {/* =================================================
              STICKY FOOTER
          ================================================= */}

                    <div className="form-sticky-footer">

                        <div className="sticky-footer-content">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    navigate('/admin/products')
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary btn-publish"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : editing
                                        ? 'Save Changes'
                                        : 'Publish Product'}
                            </button>

                        </div>

                    </div>

                </form>

            </main>

        </div>
    );
}