# Interiora - MVC Architecture

## 🏗️ Architecture Overview

This project has been refactored to follow the **Model-View-Controller (MVC)** architectural pattern for better code organization, maintainability, and scalability.

# Interiora - MVC Architecture & Render Deployment

## 🏗️ Architecture Overview

This project follows the **Model-View-Controller (MVC)** architectural pattern with a **frontend-backend separation** for better code organization, maintainability, scalability, and deployment flexibility.

## 📁 Project Structure

```
project/
├── frontend/                    # React Frontend Application
│   ├── src/                    # React application source
│   │   ├── components/         # React components (Views)
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # Frontend services (API calls)
│   │   └── assets/             # Static assets
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite build configuration
│   ├── .env                    # Development environment
│   └── .env.production         # Production environment
├── backend/                     # Backend MVC API Server
│   ├── config/                 # Configuration files
│   │   └── database.js         # MongoDB connection config
│   ├── controllers/            # Controllers (Business Logic)
│   │   ├── authController.js   # Authentication logic
│   │   ├── otpController.js    # OTP verification logic
│   │   └── genericController.js # Generic CRUD operations
│   ├── models/                 # Models (Data Layer)
│   │   ├── BaseModel.js        # Base model with common operations
│   │   ├── User.js             # User model
│   │   ├── Project.js          # Project model
│   │   └── Client.js           # Client model
│   ├── routes/                 # Routes (URL Mapping)
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── otpRoutes.js        # OTP routes
│   │   └── apiRoutes.js        # Generic API routes
│   ├── services/               # Business Services
│   │   ├── emailService.js     # Email sending service
│   │   └── otpService.js       # OTP management service
│   ├── middleware/             # Custom middleware
│   │   ├── errorHandler.js     # Global error handling
│   │   └── requestLogger.js    # Request logging
│   ├── server.js               # Main server file (MVC)
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Backend environment variables
│   └── .env.example            # Environment template
├── backup/                      # Legacy files backup
├── package.json                # Root development scripts
└── RENDER-DEPLOYMENT.md         # Render deployment guide
```

## 🎯 MVC Components

### **Models** (`/backend/models/`)

- Handle data operations and database interactions
- `BaseModel.js` - Generic CRUD operations for all collections
- `User.js` - User-specific operations (authentication, role-based queries)
- `Project.js` - Project-specific operations
- `Client.js` - Client-specific operations

### **Views** (`/frontend/src/components/`)

- React components that handle the presentation layer
- Separated into dedicated frontend folder for independent deployment
- Uses Vite for fast development and optimized production builds

### **Controllers** (`/backend/controllers/`)

- Handle business logic and coordinate between Models and Views
- `authController.js` - Login, registration logic
- `otpController.js` - OTP sending and verification
- `genericController.js` - Generic CRUD operations for all collections

## 🚀 Running the Application

### Development Mode

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Run both frontend and backend simultaneously
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5005
```

### Individual Services

```bash
# Frontend only
npm run dev:frontend
# or
cd frontend && npm run dev

# Backend only
npm run dev:backend
# or
cd backend && npm run dev
```

### Production Build

```bash
# Build frontend for production
npm run build:frontend

# Start backend production server
npm run start:backend
```

## 📡 API Endpoints

### New MVC Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/otp/send-otp` - Send OTP verification
- `POST /api/otp/verify-otp` - Verify OTP code

### Generic CRUD (All Collections)

- `GET /api/{collection}` - Get all items
- `GET /api/{collection}/:id` - Get item by ID
- `POST /api/{collection}` - Create new item
- `PUT /api/{collection}/:id` - Update item
- `DELETE /api/{collection}/:id` - Delete item

### Backward Compatibility

All old endpoints are preserved in the new MVC structure.

## 🔧 Environment Variables

### Backend (.env)

```env
MONGO_URI=mongodb+srv://...
PORT=5005
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5005/api
VITE_APP_NAME=Interiora
VITE_APP_VERSION=1.0.0
```

### Production Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
VITE_APP_NAME=Interiora
VITE_APP_VERSION=1.0.0
```

## 🏆 Benefits of MVC + Frontend-Backend Separation

1. **Separation of Concerns** - Each layer has a specific responsibility
2. **Independent Deployment** - Frontend and backend can be deployed separately
3. **Scalability** - Services can scale independently based on load
4. **Technology Flexibility** - Different hosting platforms for each service
5. **Development Efficiency** - Teams can work independently on frontend/backend
6. **Maintainability** - Easier to maintain and update each service
7. **Testability** - Each component can be tested independently
8. **Code Reusability** - Models and services can be reused across projects
9. **Team Collaboration** - Frontend and backend teams can work in parallel

## 🛠️ Key Features

- **MVC Architecture** - Clean separation of Models, Views, and Controllers
- **Frontend-Backend Separation** - Independent deployment and scaling
- **Generic CRUD Operations** - Auto-generated routes for all collections
- **Error Handling** - Centralized error handling middleware
- **Request Logging** - Detailed request logging for debugging
- **Email Service** - Modular email service with templates
- **OTP Management** - Secure OTP generation and verification
- **Database Abstraction** - Clean database interaction layer
- **Environment Configuration** - Separate configs for development/production
- **Graceful Shutdown** - Proper cleanup on server shutdown

## 📝 Development Notes

- **Frontend-Backend Separation** - Independent folders for each service
- **MVC Structure** - Backend follows strict MVC pattern
- **Legacy Backup** - Original files safely stored in `/backup` folder
- **Environment Configs** - Separate configurations for each service
- **API Compatibility** - All existing endpoints preserved
- **Render Deployment** - Optimized for Render platform deployment

## 🚀 Deployment (Render)

This project is optimized for **Render deployment**:

### Backend (Web Service)

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Node.js

### Frontend (Static Site)

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

See `RENDER-DEPLOYMENT.md` for detailed deployment instructions.

## 🚧 Future Improvements

- Add JWT authentication middleware
- Implement Redis for OTP storage
- Add API documentation with Swagger
- Add unit tests for all components
- Implement rate limiting
- Add data validation schemas
- Add CI/CD pipeline integration
- Implement caching strategies
- Add monitoring and logging services
