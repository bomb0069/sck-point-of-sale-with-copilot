# SCK POS (Point of Sale) System

A modern, full-stack Point of Sale web application built with React, Go, and MySQL. This system provides comprehensive functionality for retail businesses including product management, sales processing, customer management, and reporting.

## 🚀 Features

### Core POS Functionality
- **🛒 Interactive Sales Interface**: Modern touch-friendly POS with cart management
- **💳 Payment Processing**: Support for cash, card, and digital wallet payments  
- **🧾 Receipt Generation**: Automatic receipt generation and printing
- **📊 Real-time Calculations**: Live tax, discount, and total calculations

### Product & Inventory Management
- **� Product Catalog**: Complete CRUD operations for products
- **🏷️ Category Management**: Organize products by categories
- **📈 Inventory Tracking**: Real-time stock levels and movement history
- **� Search & Filtering**: Quick product lookup by name, SKU, or barcode

### Customer & Sales Management
- **👥 Customer Database**: Customer profiles with loyalty points
- **💰 Sales History**: Comprehensive transaction tracking
- **📈 Sales Reports**: Daily, monthly, and custom period reports
- **🔄 Returns & Refunds**: Process returns and manage refunds

### User & Security
- **🔐 Role-Based Access**: Admin, Manager, and Cashier roles
- **🔑 JWT Authentication**: Secure token-based authentication
- **🏪 Multi-Store Support**: Manage multiple store locations
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **Recharts** for analytics
- **date-fns** for date handling

### Backend
- **Go (Golang)** with Gin framework
- **MySQL** database with connection pooling
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** middleware for frontend integration

### DevOps
- **Docker & Docker Compose** for containerization
- **Nginx** for production frontend serving
- **Git** with conventional commits
- **Environment-based configuration**

## 📁 Project Structure

```
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # State management
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   ├── public/           # Static assets
│   └── Dockerfile        # Frontend container
├── backend/           # Go API server
│   ├── internal/
│   │   ├── api/          # Route handlers
│   │   ├── config/       # Configuration
│   │   ├── database/     # Database connection
│   │   ├── handlers/     # HTTP handlers
│   │   └── middleware/   # HTTP middleware
│   ├── main.go           # Application entry point
│   └── Dockerfile        # Backend container
├── database/          # MySQL schema and migrations
│   ├── schema.sql        # Database schema
│   └── README.md         # Database documentation
└── docker-compose.yml   # Development environment
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **OR** manually install:
  - Node.js 18+
  - Go 1.19+
  - MySQL 8.0+

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd point-of-sale
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:3306

### Option 2: Manual Setup

1. **Set up the database**
```bash
cd database
mysql -u root -p < schema.sql
```

2. **Start the backend**
```bash
cd backend
cp .env.example .env
# Update .env with your database credentials
go mod download
go run main.go
```

3. **Start the frontend**
```bash
cd frontend
cp .env.example .env
# Update .env with your API URL
npm install
npm start
```

## 🔑 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator

## 📊 API Endpoints

### Authentication
```
POST /api/v1/auth/login       # User login
POST /api/v1/auth/register    # User registration
```

### Products
```
GET    /api/v1/products       # List products
POST   /api/v1/products       # Create product
GET    /api/v1/products/:id   # Get product
PUT    /api/v1/products/:id   # Update product
DELETE /api/v1/products/:id   # Delete product
GET    /api/v1/products/search # Search products
```

### Sales
```
GET    /api/v1/sales          # List sales
POST   /api/v1/sales          # Create sale
GET    /api/v1/sales/:id      # Get sale
POST   /api/v1/sales/:id/refund # Refund sale
```

### Reports
```
GET    /api/v1/sales/reports/daily   # Daily report
GET    /api/v1/sales/reports/monthly # Monthly report
```

*See individual service READMEs for complete API documentation.*

## 🧪 Development

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && go test ./...
```

### Code Quality
- **ESLint** for frontend code quality
- **Go fmt** for backend formatting
- **TypeScript** for type safety
- **Conventional commits** for git history

### Environment Variables

#### Backend (.env)
```env
ENVIRONMENT=development
DATABASE_URL=user:pass@tcp(localhost:3306)/sck_pos
JWT_SECRET=your-secret-key
PORT=8080
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_NAME="SCK POS System"
```

## 🏗️ Deployment

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && go build -o main

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup
1. Set production environment variables
2. Configure database with proper credentials
3. Set up SSL certificates for HTTPS
4. Configure reverse proxy (nginx/apache)
5. Set up monitoring and logging

## 📈 Roadmap

### Phase 1 - Core Features ✅
- [x] Basic authentication system
- [x] Product catalog management
- [x] Interactive POS interface
- [x] Sales processing
- [x] Customer management
- [x] Basic reporting

### Phase 2 - Advanced Features 🚧
- [ ] Advanced inventory management
- [ ] Barcode scanning support
- [ ] Receipt printing integration
- [ ] Advanced analytics dashboard
- [ ] Multi-payment method support
- [ ] Loyalty program integration

### Phase 3 - Enterprise Features 📋
- [ ] Multi-location management
- [ ] Advanced user permissions
- [ ] Integration with accounting systems
- [ ] Mobile app for iOS/Android
- [ ] Offline mode support
- [ ] Advanced reporting and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
We use [Conventional Commits](https://conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build/config changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world POS system requirements
- Designed for scalability and maintainability
- Open source and community-driven

## 📞 Support

For support, please:
1. Check the documentation in each service's README
2. Look through existing GitHub issues
3. Create a new issue with detailed information
4. Join our community discussions

---

**Happy selling with SCK POS! 🚀**
