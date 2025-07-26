# SCK POS Backend API

A RESTful API server built with Go and Gin framework for the SCK Point of Sale system.

## Tech Stack

- **Language**: Go 1.19+
- **Web Framework**: Gin
- **Database**: MySQL with database/sql
- **Authentication**: JWT tokens
- **Password Hashing**: bcrypt

## Features

- 🔐 JWT-based authentication and authorization
- 👥 User management with role-based access control
- 🛒 Product catalog management
- 📊 Inventory tracking
- 💰 Sales processing and reporting
- 🏪 Multi-store support
- 📈 Sales analytics and reports

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Users (Protected)
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Products (Protected)
- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create new product
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/search` - Search products

### Categories (Protected)
- `GET /api/v1/categories` - List all categories
- `POST /api/v1/categories` - Create new category
- `GET /api/v1/categories/:id` - Get category by ID
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Customers (Protected)
- `GET /api/v1/customers` - List all customers
- `POST /api/v1/customers` - Create new customer
- `GET /api/v1/customers/:id` - Get customer by ID
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Sales (Protected)
- `GET /api/v1/sales` - List all sales
- `POST /api/v1/sales` - Create new sale
- `GET /api/v1/sales/:id` - Get sale by ID
- `POST /api/v1/sales/:id/refund` - Process refund
- `GET /api/v1/sales/reports/daily` - Daily sales report
- `GET /api/v1/sales/reports/monthly` - Monthly sales report

### Stores (Protected)
- `GET /api/v1/stores` - List all stores
- `POST /api/v1/stores` - Create new store
- `GET /api/v1/stores/:id` - Get store by ID
- `PUT /api/v1/stores/:id` - Update store
- `DELETE /api/v1/stores/:id` - Delete store

## Getting Started

### Prerequisites

- Go 1.19 or later
- MySQL 8.0 or later

### Installation

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials and settings.

3. Install dependencies:
```bash
go mod download
```

4. Set up the database (see `../database/README.md`).

5. Run the server:
```bash
go run main.go
```

The server will start on `http://localhost:8080` by default.

### Development

- Health check: `GET /health`
- API base URL: `http://localhost:8080/api/v1`

### Authentication

Protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Get a token by logging in with the default admin user:
- **Username**: admin
- **Password**: admin123

## Project Structure

```
backend/
├── main.go                 # Application entry point
├── internal/
│   ├── api/               # API routing
│   ├── config/            # Configuration management
│   ├── database/          # Database connection
│   ├── handlers/          # HTTP request handlers
│   └── middleware/        # HTTP middleware
├── go.mod                 # Go module file
├── go.sum                 # Go dependencies checksum
└── .env.example           # Environment variables template
```
