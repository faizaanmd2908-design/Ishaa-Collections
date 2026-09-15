# Ishaa Collections

A full-stack product catalogue and admin management system built for a real-world clothing business.

Ishaa Collections was developed to help manage and showcase products such as sarees, dresses, nighties, and other clothing items through a web-based catalogue.

The application includes a customer-facing product catalogue, product and variant management, admin authentication, image uploads, shopping cart functionality, and a MySQL-backed data layer.

---

## 🚀 Project Overview

Ishaa Collections is a full-stack web application designed for a clothing business.

### Customer Features

- Browse products
- Search and filter products
- View detailed product information
- Select colors and sizes
- Check product availability
- Add products to cart
- Buy Now functionality
- WhatsApp-based order flow
- Responsive user interface

### Admin Features

- Secure admin login
- JWT-based authentication
- Protected admin routes
- Create and manage products
- Manage product variants
- Manage colors and prices
- Manage sizes and availability
- Upload product images
- Manage product data stored in MySQL

The project was built as a real-world application rather than only as a demonstration or college project.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    │      Browser         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │ JavaScript / JSX/CSS  │
                    └──────────┬───────────┘
                               │
                         HTTP / REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └───────┬───────┬──────┘
                            │       │
              ┌─────────────┘       └──────────────┐
              ▼                                    ▼
     ┌─────────────────┐                  ┌─────────────────┐
     │      MySQL      │                  │   Cloudinary    │
     │    Database     │                  │     Images      │
     └─────────────────┘                  └─────────────────┘
🛠️ Tech Stack
Frontend
React
JavaScript
JSX
CSS
Vite
Backend
Node.js
Express.js
REST-style APIs
Multer
bcrypt
JSON Web Tokens (JWT)
dotenv
CORS
Database
MySQL
MySQL2
Image Storage
Cloudinary
Development & Deployment
Git
GitHub
Vercel
Render
Aiven
📁 Project Structure
Ishaa-Collections/
│
├── backend/
│   ├── .gitignore
│   ├── ca.pem
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── .eslintrc.json
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   └── vite.config.js
│
└── README.md
🗄️ Database Design

The application uses a relational MySQL database.

The main tables are:

admins
   │
   └── Authentication

products
   │
   └── product_variants
           │
           ├── variant_images
           │
           └── variant_sizes
admins

Stores administrator account information.

The table contains information required for admin authentication.

Passwords are stored as hashes rather than plain text using bcrypt.

products

Stores the main product information.

Product-level information includes:

Product code
Product name
Description
Category
Fabric
Additional details
Creation timestamp
Update timestamp
product_variants

Stores variations belonging to a product.

A product can have multiple variants, such as different colors.

Variant-level information includes:

Product relationship
Color
Price
Availability
variant_images

Stores image information associated with a specific product variant.

The actual image files are stored in Cloudinary.

The database stores information such as:

Variant ID
Image URL
Sort order
variant_sizes

Stores sizes and their availability for a specific product variant.

This allows different variants to have different available sizes.

🔗 Database Relationships
products
   │
   │ 1 : N
   ▼
product_variants
   │
   ├────────────── 1 : N ──────────────► variant_images
   │
   └────────────── 1 : N ──────────────► variant_sizes

Foreign keys are used to maintain relationships between the tables.

Separating products, variants, images, and sizes keeps the database structured and avoids storing all product information in one large table.

🔐 Authentication & Security

The admin system uses JWT-based authentication.

Login Flow
Admin
  │
  ▼
Login Request
  │
  ▼
Express Backend
  │
  ├── Find admin in MySQL
  │
  ├── bcrypt → verify password
  │
  └── JWT → generate authentication token
                    │
                    ▼
               sessionStorage
                    │
                    ▼
          Authorization: Bearer <token>
                    │
                    ▼
          Protected API Routes
Authentication Process
The admin submits an email and password.
The backend finds the corresponding admin account.
bcrypt compares the submitted password with the stored password hash.
If authentication succeeds, the backend generates a JWT.
The frontend stores the token in sessionStorage.
The token is sent with protected API requests.
Backend middleware verifies the JWT before allowing access to protected routes.
🔑 Environment Variables

Sensitive configuration is kept outside the source code using environment variables.

Examples include:

DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT

JWT_SECRET

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

The backend accesses these values through:

process.env

Sensitive environment files such as .env are excluded from Git using .gitignore.

No production database passwords, JWT secrets, or Cloudinary API secrets should be committed to the repository.

🖼️ Image Upload Architecture

Product images are uploaded through the backend and stored in Cloudinary.

Admin
  │
  ▼
React Frontend
  │
  │ FormData
  ▼
Express API
  │
  │ Multer
  ▼
Cloudinary
  │
  │ secure_url
  ▼
MySQL
  │
  └── Stores image URL

The image file itself is stored in Cloudinary while the corresponding image URL is stored in MySQL.

This keeps binary image files outside the relational database while allowing the application to retrieve and display them through their stored URLs.

🔌 API Architecture

The frontend communicates with the backend through HTTP API endpoints.

Examples include:

GET    /api/products
GET    /api/products/:id/details

POST   /api/admin/login

GET    /api/admin/products
POST   /api/admin/products

POST   /api/admin/upload-image

Admin endpoints are protected using JWT authentication middleware.

🛒 Product & Order Flow

The customer flow is designed around browsing products and selecting the required variant.

Browse Products
       │
       ▼
Product Details
       │
       ├── Select Color
       │
       ├── Select Size
       │
       └── Check Availability
       │
       ▼
Add to Cart / Buy Now
       │
       ▼
Cart
       │
       ▼
WhatsApp Order Flow

The application does not require an integrated online payment gateway for the ordering flow.

🌐 Deployment Architecture

The application was designed using separate services for the frontend, backend, database, and image storage.

                         GitHub
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
            Vercel                    Render
           Frontend                   Backend
               │                         │
               │       HTTP API          │
               └─────────────────────────┘
                                         │
                              ┌──────────┴──────────┐
                              ▼                     ▼
                           Aiven               Cloudinary
                          MySQL DB                Images
Vercel

Used for hosting the React frontend.

Render

Used for hosting the Node.js and Express backend.

Aiven

Used as the managed MySQL database service.

Cloudinary

Used for storing and serving product images.

GitHub

Used for source code management and version control.

🧩 Technologies and Their Roles
Technology	Purpose
React	Frontend UI
JavaScript	Application logic
JSX	React component structure
CSS	Styling and responsive design
Vite	Frontend development and build tool
Node.js	Backend runtime
Express.js	Backend API framework
MySQL	Relational database
MySQL2	Node.js MySQL client
JWT	Admin authentication
bcrypt	Password hashing
Multer	Handling image uploads
Cloudinary	Image storage
dotenv	Environment configuration
CORS	Cross-origin API communication
Git	Version control
GitHub	Source code hosting
Vercel	Frontend deployment
Render	Backend deployment
Aiven	Managed MySQL hosting
🧠 Key Engineering Challenges

One of the most valuable parts of this project was moving the application from a local development environment to a production-style architecture.

Some of the challenges encountered included:

Frontend-to-backend API configuration
CORS configuration
Vercel SPA routing
Render environment variables
Cloudinary authentication
Aiven MySQL connectivity
MySQL SSL configuration
Production database connection debugging
Separating frontend configuration from backend secrets
Handling image uploads across multiple services
Debugging differences between local and deployed environments

These challenges helped demonstrate that building an application is only one part of software engineering.

Making the frontend, backend, database, authentication, storage, and deployment infrastructure work together reliably is another major part.

🧪 Local Development
Frontend

Navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Run the development server:

npm run dev
Backend

Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Start the backend:

node server.js

The backend requires the appropriate environment variables to be configured before starting.

🔒 Security Notes

Sensitive configuration should never be committed to GitHub.

This includes:

Database passwords
JWT secrets
Cloudinary API secrets
API keys
Private environment configuration

These values should be provided through environment variables.

The repository is intended to contain the application's source code and configuration structure, not production credentials.

📚 What I Learned

Building Ishaa Collections gave me practical experience with full-stack application development.

Frontend
Building React components
Managing application state
Handling forms
Working with APIs
Managing product and cart flows
Responsive UI development
Backend
Building APIs with Node.js and Express
Creating authentication middleware
Implementing JWT authentication
Password hashing with bcrypt
Handling multipart form uploads
Integrating Cloudinary
Managing environment variables
Configuring CORS
Database
Relational database design
Primary and foreign keys
One-to-many relationships
MySQL queries
Parameterized queries
Separating product and variant data
Deployment
Git and GitHub
Frontend deployment
Backend deployment
Managed cloud databases
Cloud storage
Environment configuration
Production debugging

Most importantly, I learned how the different layers of a full-stack application communicate with each other.

🚀 Future Improvements

Possible future improvements include:

Customer accounts
Order management
Admin analytics dashboard
Inventory management
Order status tracking
WhatsApp automation
Product reviews
Advanced search and filtering
Role-based admin permissions
Automated notifications
Online payment integration
👨‍💻 Project

Ishaa Collections

A real-world full-stack project built to support a clothing business while gaining practical experience in full-stack software engineering.

Built With

React · JavaScript · Node.js · Express · MySQL · Cloudinary · JWT · Vercel · Render · Aiven
