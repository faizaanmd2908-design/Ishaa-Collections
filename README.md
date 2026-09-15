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
