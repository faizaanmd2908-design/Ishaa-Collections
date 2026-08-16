require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || 'ishaa-dev-secret-change-this';
if (JWT_SECRET === 'ishaa-dev-secret-change-this' && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] Running in production with default JWT_SECRET. Set JWT_SECRET in .env file.');
}

/**
 * Helper to validate positive integer IDs.
 */
function parsePositiveInt(val) {
  const num = parseInt(val, 10);
  return !isNaN(num) && num > 0 ? num : null;
}

/**
 * Helper to normalize and validate category.
 */
function validateCategory(cat) {
  if (!cat || typeof cat !== 'string') return null;
  const lower = cat.trim().toLowerCase();
  if (lower === 'saree') return 'Saree';
  if (lower === 'dress') return 'Dress';
  if (lower === 'nighty') return 'Nighty';
  return null;
}


// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
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
// CUSTOMER — GET ALL PRODUCTS
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
// CUSTOMER — GET SINGLE PRODUCT
// =====================================================

app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;

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
    WHERE id = ?
  `;

  db.query(query, [productId], (err, products) => {
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
// CUSTOMER — GET PRODUCT VARIANTS
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
// CUSTOMER — GET VARIANT IMAGES
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
      console.error('Error fetching images:', err);

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
// CUSTOMER — GET VARIANT SIZES
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
      console.error('Error fetching sizes:', err);

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
// CUSTOMER — COMPLETE PRODUCT DETAILS
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
                console.error('Error fetching images:', imageError);

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
                    console.error('Error fetching sizes:', sizeError);

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
// ADMIN AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateAdmin(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format'
    });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);

    req.admin = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}


// =====================================================
// ADMIN LOGIN
// =====================================================

app.post('/api/admin/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const query = `
    SELECT
      id,
      name,
      email,
      password_hash
    FROM admins
    WHERE email = ?
  `;

  db.query(query, [email], async (err, admins) => {

    if (err) {
      console.error('Admin login database error:', err);

      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: err.message
      });
    }

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const admin = admins[0];

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  });
});


// =====================================================
// ADMIN — VERIFY TOKEN
// =====================================================

app.get('/api/admin/me', authenticateAdmin, (req, res) => {

  res.json({
    success: true,
    admin: req.admin
  });
});


// =====================================================
// ADMIN — GET ALL PRODUCTS
// =====================================================

app.get('/api/admin/products', authenticateAdmin, (req, res) => {

  const query = `
    SELECT
      id,
      product_code,
      name,
      description,
      category,
      fabric,
      additional_details,
      created_at,
      updated_at
    FROM products
    ORDER BY id DESC
  `;

  db.query(query, (err, products) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch admin products',
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
// ADMIN — CREATE PRODUCT
// =====================================================

app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const {
    product_code,
    name,
    description,
    category,
    fabric,
    additional_details
  } = req.body;

  if (!product_code || !name || !category) {
    return res.status(400).json({
      success: false,
      message: 'product_code, name and category are required'
    });
  }

  const validCategory = validateCategory(category);
  if (!validCategory) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category. Category must be Saree, Dress, or Nighty'
    });
  }

  const cleanCode = product_code.trim().toUpperCase();
  const cleanName = name.trim();

  const query = `
    INSERT INTO products
    (
      product_code,
      name,
      description,
      category,
      fabric,
      additional_details
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      cleanCode,
      cleanName,
      description ? description.trim() : null,
      validCategory,
      fabric ? fabric.trim() : null,
      additional_details ? additional_details.trim() : null
    ],
    (err, result) => {
      if (err) {
        console.error('Error creating product:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            success: false,
            message: `Product code '${cleanCode}' already exists. Please use a unique product code.`
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to create product due to a server error.'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        productId: result.insertId
      });
    }
  );
});


// =====================================================
// ADMIN — UPDATE PRODUCT
// =====================================================

app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const productId = parsePositiveInt(req.params.id);
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const {
    product_code,
    name,
    description,
    category,
    fabric,
    additional_details
  } = req.body;

  if (!product_code || !name || !category) {
    return res.status(400).json({
      success: false,
      message: 'product_code, name and category are required'
    });
  }

  const validCategory = validateCategory(category);
  if (!validCategory) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category. Category must be Saree, Dress, or Nighty'
    });
  }

  const cleanCode = product_code.trim().toUpperCase();
  const cleanName = name.trim();

  const query = `
    UPDATE products
    SET
      product_code = ?,
      name = ?,
      description = ?,
      category = ?,
      fabric = ?,
      additional_details = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      cleanCode,
      cleanName,
      description ? description.trim() : null,
      validCategory,
      fabric ? fabric.trim() : null,
      additional_details ? additional_details.trim() : null,
      productId
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            success: false,
            message: `Product code '${cleanCode}' already exists. Please use a unique product code.`
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to update product due to a server error.'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    }
  );
});


// =====================================================
// ADMIN — DELETE PRODUCT (NATIVE ON DELETE CASCADE)
// =====================================================

app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const productId = parsePositiveInt(req.params.id);
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  db.query(
    'DELETE FROM products WHERE id = ?',
    [productId],
    (err, result) => {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete product.'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    }
  );
});




// =====================================================
// ADMIN — CREATE VARIANT
// =====================================================

app.post(
  '/api/admin/products/:id/variants',
  authenticateAdmin,
  (req, res) => {

    const productId = req.params.id;

    const {
      color,
      price,
      availability
    } = req.body;

    if (!color || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'color and price are required'
      });
    }

    const query = `
      INSERT INTO product_variants
      (
        product_id,
        color,
        price,
        availability
      )
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        productId,
        color,
        price,
        availability === undefined ? 1 : availability
      ],
      (err, result) => {

        if (err) {
          console.error('Error creating variant:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to create variant',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Variant created successfully',
          variantId: result.insertId
        });
      }
    );
  }
);


// =====================================================
// ADMIN — UPDATE VARIANT
// =====================================================

app.put(
  '/api/admin/variants/:id',
  authenticateAdmin,
  (req, res) => {

    const variantId = req.params.id;

    const {
      color,
      price,
      availability
    } = req.body;

    if (!color || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'color and price are required'
      });
    }

    const query = `
      UPDATE product_variants
      SET
        color = ?,
        price = ?,
        availability = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [
        color,
        price,
        availability === undefined ? 1 : availability,
        variantId
      ],
      (err, result) => {

        if (err) {
          console.error('Error updating variant:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to update variant',
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Variant not found'
          });
        }

        res.json({
          success: true,
          message: 'Variant updated successfully'
        });
      }
    );
  }
);


// =====================================================
// ADMIN — DELETE VARIANT (NATIVE ON DELETE CASCADE)
// =====================================================

app.delete(
  '/api/admin/variants/:id',
  authenticateAdmin,
  (req, res) => {
    const variantId = parsePositiveInt(req.params.id);
    if (!variantId) {
      return res.status(400).json({ success: false, message: 'Invalid variant ID' });
    }

    db.query(
      'DELETE FROM product_variants WHERE id = ?',
      [variantId],
      (err, result) => {
        if (err) {
          console.error('Error deleting variant:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete variant.'
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Variant not found'
          });
        }

        res.json({
          success: true,
          message: 'Variant deleted successfully'
        });
      }
    );
  }
);




// =====================================================
// ADMIN — CREATE SIZE
// =====================================================

app.post(
  '/api/admin/variants/:id/sizes',
  authenticateAdmin,
  (req, res) => {

    const variantId = req.params.id;
    const { size, availability } = req.body;

    if (!size) {
      return res.status(400).json({
        success: false,
        message: 'size is required'
      });
    }

    const query = `
      INSERT INTO variant_sizes
      (variant_id, size, availability)
      VALUES (?, ?, ?)
    `;

    db.query(
      query,
      [
        variantId,
        size,
        availability === undefined ? 1 : availability
      ],
      (err, result) => {

        if (err) {
          console.error('Error creating size:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to create size',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Size created successfully',
          sizeId: result.insertId
        });
      }
    );
  }
);


// =====================================================
// ADMIN — UPDATE SIZE
// =====================================================

app.put(
  '/api/admin/sizes/:id',
  authenticateAdmin,
  (req, res) => {

    const sizeId = req.params.id;
    const { size, availability } = req.body;

    if (!size) {
      return res.status(400).json({
        success: false,
        message: 'size is required'
      });
    }

    const query = `
      UPDATE variant_sizes
      SET
        size = ?,
        availability = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [
        size,
        availability === undefined ? 1 : availability,
        sizeId
      ],
      (err, result) => {

        if (err) {
          console.error('Error updating size:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to update size',
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Size not found'
          });
        }

        res.json({
          success: true,
          message: 'Size updated successfully'
        });
      }
    );
  }
);


// =====================================================
// ADMIN — DELETE SIZE
// =====================================================

app.delete(
  '/api/admin/sizes/:id',
  authenticateAdmin,
  (req, res) => {

    const sizeId = req.params.id;

    db.query(
      'DELETE FROM variant_sizes WHERE id = ?',
      [sizeId],
      (err, result) => {

        if (err) {
          console.error('Error deleting size:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to delete size',
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Size not found'
          });
        }

        res.json({
          success: true,
          message: 'Size deleted successfully'
        });
      }
    );
  }
);


// =====================================================
// ADMIN — CREATE IMAGE RECORD
// =====================================================

app.post(
  '/api/admin/variants/:id/images',
  authenticateAdmin,
  (req, res) => {

    const variantId = req.params.id;
    const { image_url, sort_order } = req.body;

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: 'image_url is required'
      });
    }

    const query = `
      INSERT INTO variant_images
      (variant_id, image_url, sort_order)
      VALUES (?, ?, ?)
    `;

    db.query(
      query,
      [
        variantId,
        image_url,
        sort_order === undefined ? 0 : sort_order
      ],
      (err, result) => {

        if (err) {
          console.error('Error creating image:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to create image',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Image added successfully',
          imageId: result.insertId
        });
      }
    );
  }
);


// =====================================================
// ADMIN — UPDATE IMAGE RECORD
// =====================================================

app.put(
  '/api/admin/images/:id',
  authenticateAdmin,
  (req, res) => {

    const imageId = req.params.id;
    const { image_url, sort_order } = req.body;

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: 'image_url is required'
      });
    }

    const query = `
      UPDATE variant_images
      SET
        image_url = ?,
        sort_order = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [
        image_url,
        sort_order === undefined ? 0 : sort_order,
        imageId
      ],
      (err, result) => {

        if (err) {
          console.error('Error updating image:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to update image',
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Image not found'
          });
        }

        res.json({
          success: true,
          message: 'Image updated successfully'
        });
      }
    );
  }
);


// =====================================================
// ADMIN — DELETE IMAGE RECORD
// =====================================================

app.delete(
  '/api/admin/images/:id',
  authenticateAdmin,
  (req, res) => {

    const imageId = req.params.id;

    db.query(
      'DELETE FROM variant_images WHERE id = ?',
      [imageId],
      (err, result) => {

        if (err) {
          console.error('Error deleting image:', err);

          return res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Image not found'
          });
        }

        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      }
    );
  }
);


// =====================================================
// ADMIN — UPLOAD IMAGE TO CLOUDINARY
// =====================================================

app.post(
  '/api/admin/upload-image',
  authenticateAdmin,
  upload.single('image'),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      const result = await new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'ishaa-collections/products',
            resource_type: 'image'
          },

          (error, uploadedImage) => {

            if (error) {
              reject(error);
            } else {
              resolve(uploadedImage);
            }

          }
        );

        stream.end(req.file.buffer);
      });

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      });

    } catch (error) {

      console.error('Cloudinary upload error:', error);

      res.status(500).json({
        success: false,
        message: 'Image upload failed',
        error: error.message
      });
    }
  }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

  if (err instanceof multer.MulterError) {

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image must be smaller than 10 MB'
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err && err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(
    `Ishaa Collections backend server is running on port ${PORT}`
  );
});