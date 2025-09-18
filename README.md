# E-commerce-backend-MERN

This is a complete backend server for an E-commerce web application, built using **Node.js**, **Express**, and **MongoDB**. It handles user authentication, product and category management, file uploads, and includes filtering, sorting, and pagination features.

> Author: **Ajay Kumar**

---

## Project Structure

(1) controllers/ Logic for user, product, category, upload<br>
(2) middleware/ Auth middlewares<br>
(3) models/ MongoDB schemas<br>
(4) routes/ API routes<br>
(5) uploads/ Uploaded images<br>
(6) server.js Main server file<br>
(7) .env Environment variables<br>
(8) README.md Project documentation

---

## Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **express-fileupload** for file handling
- **cookie-parser**
- **dotenv**

---

## Features

- User Registration & Login with JWT
- Role-based Authorization (Admin)
- Product CRUD with filtering, sorting & pagination
- Category Management
- Image Upload & Delete functionality
- Refresh Token Auth with HttpOnly cookies

# Install dependencies

npm install

# Set environment variables

Create a .env file

# API Routes - User Auth Routes (/user)

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| POST   | `/register`      | Register a new user            |
| POST   | `/login`         | Login user                     |
| POST   | `/logout`        | Logout user                    |
| POST   | `/refresh_token` | Get new access token           |
| GET    | `/infor`         | Get user info (Requires token) |

# Product Routes (/api/products)

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | `/products`     | Get all products     |
| POST   | `/products`     | Create new product   |
| PUT    | `/products/:id` | Update product by ID |
| DELETE | `/products/:id` | Delete product by ID |

# Supports: Filtering , Sorting , Pagination

# Example: GET /api/products?price[gte]=100&sort=price&page=2&limit=10

# Category Routes (/api/category)

| Method | Endpoint        | Description                 |
| ------ | --------------- | --------------------------- |
| GET    | `/category`     | Get all categories          |
| POST   | `/category`     | Create new category (Admin) |
| PUT    | `/category/:id` | Update category (Admin)     |
| DELETE | `/category/:id` | Delete category (Admin)     |

# Upload Routes (/api)

| Method | Endpoint   | Description           |
| ------ | ---------- | --------------------- |
| POST   | `/upload`  | Upload image file     |
| POST   | `/destroy` | Delete uploaded image |

# Key points :(1) Uploaded files go to /uploads ,(2) Max file size: 2MB , (3) Only image files are accepted

# Authentication & Authorization

Uses JWT Access Token in headers (Authorization)
Uses Refresh Token in cookies (HttpOnly)

Middleware:
auth → Validates user token
authAdmin → Allows access only to admin users

# Image Upload Sample

POST /api/upload
Form-data:

- Key: image
- Value: (choose image file)

Response:
{
"msg": "File uploaded successfully",
"url": "/uploads/filename.png"
}

To delete:

POST /api/destroy
Body: { "filename": "your_image.png" }

# Token Refresh Flow

When access token expires:

POST /user/refresh_token
(Cookie must contain valid refresh token)

# And Also- Protecting Routes

# Testing

You can test API using tools like: # Postman

# Acknowledgements:

Inspired by real-world eCommerce platforms.
Built for learning, portfolio, and scalable development.

# Thank You!!
