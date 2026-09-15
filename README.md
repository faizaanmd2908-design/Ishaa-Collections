# Ishaa Collections

A full-stack product catalogue and admin management system built for a real-world clothing business.

Ishaa Collections was developed to help manage and showcase products such as sarees, dresses, nighties, and other clothing items through a web-based catalogue.

The project includes a customer-facing catalogue, product and variant management, image uploads, admin authentication, and a MySQL-backed data layer.

---

## 🚀 Project Overview

Ishaa Collections is a full-stack web application designed for a clothing business.

The application allows customers to:

- Browse available products
- Search and filter products
- View detailed product information
- Select product colors and sizes
- Check variant availability
- Add products to a cart
- Proceed through a WhatsApp-based order flow

The admin side allows authorized users to:

- Log in securely
- Create products
- Manage product information
- Manage color variants
- Manage sizes and availability
- Upload product images
- Manage product data stored in MySQL

The project was built as a real-world application rather than only as a demonstration project.

---

## ✨ Features

### Customer Features

- Product catalogue
- Product categories
- Product search and filtering
- Product detail pages
- Color variants
- Variant-specific pricing
- Size selection
- Availability tracking
- Product images
- Shopping cart
- Buy Now flow
- WhatsApp-based order process
- Responsive interface

### Admin Features

- Secure admin login
- JWT-based authentication
- Protected admin routes
- Product creation
- Product management
- Variant management
- Size management
- Availability management
- Product image uploads
- Cloudinary image storage

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
                    │   JavaScript / JSX    │
                    │        + CSS          │
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
