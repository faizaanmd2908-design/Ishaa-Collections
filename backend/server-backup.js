const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());


// =====================================================
// BASIC TEST ROUTES
// =====================================================

app.get('/', (req, res) => {
  res.json({
    message: 'Ishaa Collections backend is running'
  });
});

app.get('/hello', (req, res) => {
  res.send('HELLO FROM ISHAA BACKEND');
});


// =====================================================
// DATABASE CONNECTION TEST
// =====================================================

app.get('/api/test-db', (req, res) => {

  db.query('SELECT 1 AS result', (err, results) => {

    if (err) {
      console.error('Database connection error:', err);

      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Database connection successful',
      result: results[0].result
    });
  });
});


// =====================================================
// GET ALL PRODUCTS
// =====================================================

app.get('/api/products', (req, res) => {

  const query = `
    SELECT
      id,
      product_code,
      name,
      description,
      category,
      fabric,
      additional_details
    FROM products
    ORDER BY id DESC
  `;

  db.query(query, (err, products) => {

    if (err) {
      console.error('Error fetching products:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: err.message
      });
    }

    res.json({
      success: true,
      products
    });
  });
});


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

app.get('/api/products/:id', (req, res) => {

  const productId = req.params.id;

  const productQuery = `
    SELECT
      id,
      product_code,
      name,
      description,
      category,
      fabric,
      additional_details
    FROM products
    WHERE id = ?
  `;

  db.query(productQuery, [productId], (err, products) => {

    if (err) {
      console.error('Error fetching product:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: err.message
      });
    }

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });
  });
});


// =====================================================
// GET VARIANTS FOR A PRODUCT
// =====================================================

app.get('/api/products/:id/variants', (req, res) => {

  const productId = req.params.id;

  const query = `
    SELECT
      id,
      product_id,
      color,
      price,
      availability
    FROM product_variants
    WHERE product_id = ?
    ORDER BY id ASC
  `;

  db.query(query, [productId], (err, variants) => {

    if (err) {
      console.error('Error fetching variants:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product variants',
        error: err.message
      });
    }

    res.json({
      success: true,
      variants
    });
  });
});


// =====================================================
// GET IMAGES FOR A VARIANT
// =====================================================

app.get('/api/variants/:id/images', (req, res) => {

  const variantId = req.params.id;

  const query = `
    SELECT
      id,
      variant_id,
      image_url,
      sort_order
    FROM variant_images
    WHERE variant_id = ?
    ORDER BY sort_order ASC, id ASC
  `;

  db.query(query, [variantId], (err, images) => {

    if (err) {
      console.error('Error fetching variant images:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch variant images',
        error: err.message
      });
    }

    res.json({
      success: true,
      images
    });
  });
});


// =====================================================
// GET SIZES FOR A VARIANT
// =====================================================

app.get('/api/variants/:id/sizes', (req, res) => {

  const variantId = req.params.id;

  const query = `
    SELECT
      id,
      variant_id,
      size,
      availability
    FROM variant_sizes
    WHERE variant_id = ?
    ORDER BY id ASC
  `;

  db.query(query, [variantId], (err, sizes) => {

    if (err) {
      console.error('Error fetching variant sizes:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch variant sizes',
        error: err.message
      });
    }

    res.json({
      success: true,
      sizes
    });
  });
});


// =====================================================
// GET COMPLETE PRODUCT DETAILS
// =====================================================

app.get('/api/products/:id/details', (req, res) => {

  const productId = req.params.id;

  const productQuery = `
    SELECT
      id,
      product_code,
      name,
      description,
      category,
      fabric,
      additional_details
    FROM products
    WHERE id = ?
  `;

  db.query(productQuery, [productId], (productError, products) => {

    if (productError) {
      console.error('Error fetching product:', productError);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: productError.message
      });
    }

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    const variantsQuery = `
      SELECT
        id,
        product_id,
        color,
        price,
        availability
      FROM product_variants
      WHERE product_id = ?
      ORDER BY id ASC
    `;

    db.query(
      variantsQuery,
      [productId],
      (variantError, variants) => {

        if (variantError) {
          console.error('Error fetching variants:', variantError);

          return res.status(500).json({
            success: false,
            message: 'Failed to fetch variants',
            error: variantError.message
          });
        }

        if (variants.length === 0) {
          return res.json({
            success: true,
            product: {
              ...product,
              variants: []
            }
          });
        }

        let completed = 0;

        variants.forEach((variant) => {

          variant.images = [];
          variant.sizes = [];

          const imagesQuery = `
            SELECT
              id,
              variant_id,
              image_url,
              sort_order
            FROM variant_images
            WHERE variant_id = ?
            ORDER BY sort_order ASC, id ASC
          `;

          db.query(
            imagesQuery,
            [variant.id],
            (imageError, images) => {

              if (imageError) {
                console.error(
                  'Error fetching images:',
                  imageError
                );

                return res.status(500).json({
                  success: false,
                  message: 'Failed to fetch images',
                  error: imageError.message
                });
              }

              variant.images = images;

              const sizesQuery = `
                SELECT
                  id,
                  variant_id,
                  size,
                  availability
                FROM variant_sizes
                WHERE variant_id = ?
                ORDER BY id ASC
              `;

              db.query(
                sizesQuery,
                [variant.id],
                (sizeError, sizes) => {

                  if (sizeError) {
                    console.error(
                      'Error fetching sizes:',
                      sizeError
                    );

                    return res.status(500).json({
                      success: false,
                      message: 'Failed to fetch sizes',
                      error: sizeError.message
                    });
                  }

                  variant.sizes = sizes;

                  completed++;

                  if (completed === variants.length) {

                    res.json({
                      success: true,
                      product: {
                        ...product,
                        variants
                      }
                    });
                  }
                }
              );
            }
          );
        });
      }
    );
  });
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `Ishaa Collections backend server is running on port ${PORT}`
  );
});