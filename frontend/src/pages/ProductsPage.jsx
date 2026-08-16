import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'https://ishaa-collections-backend.onrender.com/api';

function getToken() {
    return sessionStorage.getItem('ishaa_admin_token');
}

export default function ProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // =====================================================
    // LOAD PRODUCTS + THEIR FIRST IMAGE
    // =====================================================

    async function loadProducts() {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${API}/admin/products`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                sessionStorage.removeItem(
                    'ishaa_admin_token'
                );

                navigate('/admin/login', {
                    replace: true
                });

                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    'Failed to load products'
                );
            }

            const baseProducts =
                data.products || [];

            // The admin products endpoint doesn't return
            // product images, so load complete product details
            // for each product.
            const productsWithDetails =
                await Promise.all(
                    baseProducts.map(
                        async (product) => {
                            try {
                                const detailsResponse =
                                    await fetch(
                                        `${API}/products/${product.id}/details`
                                    );

                                const detailsData =
                                    await detailsResponse.json();

                                if (
                                    detailsResponse.ok &&
                                    detailsData.success
                                ) {
                                    const variants =
                                        detailsData
                                            .product
                                            ?.variants || [];

                                    const firstVariant =
                                        variants[0];

                                    const images =
                                        firstVariant
                                            ?.images || [];

                                    const firstImage =
                                        images[0];

                                    const firstPrice =
                                        firstVariant?.price ??
                                        null;

                                    return {
                                        ...product,

                                        image_url:
                                            firstImage
                                                ?.image_url ||
                                            null,

                                        price:
                                            firstPrice
                                    };
                                }
                            } catch (detailError) {
                                console.warn(
                                    `Could not load details for ${product.product_code}:`,
                                    detailError
                                );
                            }

                            return {
                                ...product,
                                image_url: null,
                                price: null
                            };
                        }
                    )
                );

            setProducts(
                productsWithDetails
            );

        } catch (err) {
            console.error(
                'Failed to load products:',
                err
            );

            setError(err.message);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    // =====================================================
    // FILTER PRODUCTS
    // =====================================================

    const filteredProducts = useMemo(() => {
        return products.filter(
            (product) => {
                const text =
                    `${product.name || ''} ${product.product_code || ''}`
                        .toLowerCase();

                const matchesSearch =
                    text.includes(
                        search.toLowerCase()
                    );

                const matchesCategory =
                    category === 'all' ||
                    product.category ===
                    category;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );
    }, [
        products,
        search,
        category
    ]);

    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async function deleteProduct(
        product
    ) {
        const confirmed =
            window.confirm(
                `Delete "${product.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${API}/admin/products/${product.id}`,
                    {
                        method: 'DELETE',

                        headers: {
                            Authorization:
                                `Bearer ${getToken()}`
                        }
                    }
                );

            const data =
                await response.json();

            if (
                response.status === 401
            ) {
                sessionStorage.removeItem(
                    'ishaa_admin_token'
                );

                navigate(
                    '/admin/login',
                    {
                        replace: true
                    }
                );

                return;
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    'Delete failed'
                );
            }

            await loadProducts();

        } catch (err) {
            console.error(
                'Delete error:',
                err
            );

            window.alert(
                err.message
            );
        }
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="admin-page-container">

            <main className="product-list-main">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="page-heading-bar">

                    <div className="heading-title-block">

                        <h1>
                            Products
                        </h1>

                        <p className="subheading-text">
                            Manage your Ishaa Collections catalogue.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-add-product"
                        onClick={() =>
                            navigate(
                                '/admin/products/new'
                            )
                        }
                    >
                        + Add Product
                    </button>

                </div>


                {/* =================================================
                    SEARCH + FILTER
                ================================================= */}

                <div className="controls-card">

                    <div className="search-input-wrapper">

                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by product name or code..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() =>
                                    setSearch('')
                                }
                            >
                                ×
                            </button>
                        )}

                    </div>


                    <div className="category-tabs">

                        {[
                            ['all', 'All'],
                            ['saree', 'Sarees'],
                            ['dress', 'Dresses'],
                            ['nighty', 'Nighties']
                        ].map(
                            ([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={
                                        category ===
                                            value
                                            ? 'category-tab-btn active'
                                            : 'category-tab-btn'
                                    }
                                    onClick={() =>
                                        setCategory(
                                            value
                                        )
                                    }
                                >
                                    {label}
                                </button>
                            )
                        )}

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="list-loading-state">

                        <div className="boutique-spinner" />

                        <div className="loading-text">
                            Loading products...
                        </div>

                    </div>
                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading &&
                    error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredProducts.length === 0 && (
                        <div className="empty-catalog-card">

                            <div className="empty-icon-circle">
                                🛍️
                            </div>

                            <h3>
                                No products found
                            </h3>

                            <p>
                                Add your first
                                Ishaa Collections
                                product to start
                                building the catalogue.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate(
                                        '/admin/products/new'
                                    )
                                }
                            >
                                + Add Product
                            </button>

                        </div>
                    )}


                {/* =================================================
                    PRODUCT GRID
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredProducts.length > 0 && (
                        <div className="products-grid">

                            {filteredProducts.map(
                                (product) => (
                                    <article
                                        className="product-card"
                                        key={product.id}
                                    >

                                        {/* =================================
                                            PRODUCT IMAGE
                                        ================================= */}

                                        <div className="product-card-image-wrap">

                                            {product.image_url ? (
                                                <img
                                                    className="product-card-img"
                                                    src={
                                                        product.image_url
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    loading="lazy"
                                                    onError={(
                                                        event
                                                    ) => {
                                                        event.currentTarget.style.display =
                                                            'none';

                                                        const placeholder =
                                                            event
                                                                .currentTarget
                                                                .parentElement
                                                                ?.querySelector(
                                                                    '.product-card-placeholder'
                                                                );

                                                        if (
                                                            placeholder
                                                        ) {
                                                            placeholder.style.display =
                                                                'flex';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="product-card-placeholder">
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                '2rem'
                                                        }}
                                                    >
                                                        🛍️
                                                    </span>

                                                    <span>
                                                        No product image
                                                    </span>
                                                </div>
                                            )}

                                            {/* Hidden fallback for broken images */}
                                            {product.image_url && (
                                                <div
                                                    className="product-card-placeholder"
                                                    style={{
                                                        display:
                                                            'none'
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize:
                                                                '2rem'
                                                        }}
                                                    >
                                                        🛍️
                                                    </span>

                                                    <span>
                                                        No product image
                                                    </span>
                                                </div>
                                            )}


                                            <div className="card-badges-top">

                                                <span className="product-category-badge">
                                                    {
                                                        product.category
                                                    }
                                                </span>

                                                <span className="product-status-badge available">
                                                    ● Active
                                                </span>

                                            </div>

                                        </div>


                                        {/* =================================
                                            PRODUCT CONTENT
                                        ================================= */}

                                        <div className="product-card-content">

                                            <div>

                                                <div className="product-code-tag">
                                                    {
                                                        product.product_code
                                                    }
                                                </div>

                                                <h2 className="product-name">
                                                    {
                                                        product.name
                                                    }
                                                </h2>

                                                <p className="subheading-text">
                                                    {
                                                        product.description ||
                                                        'No description'
                                                    }
                                                </p>

                                            </div>


                                            {/* =================================
                                                FOOTER
                                            ================================= */}

                                            <div className="product-details-footer">

                                                <div className="product-price-block">

                                                    <span className="price-label">
                                                        Price
                                                    </span>

                                                    <span className="product-price">

                                                        {product.price !==
                                                            null
                                                            ? `₹${Number(
                                                                product.price
                                                            ).toLocaleString(
                                                                'en-IN'
                                                            )}`
                                                            : '—'}

                                                    </span>

                                                </div>


                                                <div className="product-actions-group">

                                                    <button
                                                        type="button"
                                                        className="btn-icon-action btn-edit"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/products/${product.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="btn-icon-action btn-delete"
                                                        onClick={() =>
                                                            deleteProduct(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

            </main>

        </div>
    );
}