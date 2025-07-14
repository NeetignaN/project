# 🚀 Render Deployment Guide

## 📋 **Render Deployment Setup**

## 📁 **Clean Project Structure for Render:**

```
project/
├── frontend/                    # React Static Site
│   ├── src/                    # React application
│   ├── package.json            # Build & dependencies
│   ├── vite.config.js          # Build configuration
│   ├── .env                    # Development environment
│   └── .env.production         # Production environment
├── backend/                     # Node.js Web Service
│   ├── config/                 # Database configuration
│   ├── controllers/            # MVC Controllers
│   ├── models/                 # MVC Models
│   ├── routes/                 # API Routes
│   ├── services/               # Business Services
│   ├── middleware/             # Custom Middleware
│   ├── server.js               # Main server file
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Backend environment
│   └── .env.example            # Environment template
├── backup/                      # Legacy files backup
├── package.json                # Development scripts
└── RENDER-DEPLOYMENT.md         # This deployment guide
```

## 🎯 **Render Services to Create:**

### **1. Backend (Web Service)**

- **Repository:** Connect your GitHub repo
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** `5005` (or use Render's default)

### **2. Frontend (Static Site)**

- **Repository:** Connect your GitHub repo
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

## 🔧 **Environment Variables (Backend)**

Set these in your Render backend service:

```env
MONGO_URI=mongodb+srv://your-connection-string
PORT=5005
NODE_ENV=production
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🔗 **Frontend API Configuration**

Update your frontend to use the Render backend URL:

```env
# frontend/.env.production
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## 📝 **Step-by-Step Deployment:**

### **Backend Deployment:**

1. **Ensure all changes are committed to GitHub first!**
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** `interiora-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install` - **Start Command:** `npm start`
6. Add environment variables
7. Click **"Create Web Service"**
8. **Wait for deployment to complete and note the URL**

### **Frontend Deployment:**

1. **Update your frontend API URL first** (see step below)
2. **Commit the API URL change to GitHub**
3. Click **"New"** → **"Static Site"**
4. Connect same GitHub repository
5. Configure:
   - **Name:** `interiora`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` - **Publish Directory:** `dist`
6. Add environment variables if needed
7. Click **"Create Static Site"**

## 🔄 **Important: Update API URLs After Backend Deployment:**

After your backend is deployed and you have the URL, you MUST:

1. **Update the API URL in your code:**

```javascript
// frontend/src/services/api.js
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-actual-backend-url.onrender.com/api"
    : "http://localhost:5005/api";
```

2. **Commit and push this change:**

```bash
git add frontend/src/services/api.js
git commit -m "update: set production API URL for Render deployment"
git push origin main
```

3. **Frontend will auto-redeploy** with the correct API URL

## 🌐 **URLs After Deployment:**

- **Backend API:** `https://interiora-backend.onrender.com`
- **Frontend:** `https://interiora.onrender.com`

## ⚙️ **Auto-Deploy Setup:**

Render automatically deploys when you push to your GitHub repository:

- **Backend:** Redeploys on any changes to `/backend` folder
- **Frontend:** Redeploys on any changes to `/frontend` folder

## 💡 **Render Benefits:**

- ✅ **Free tier available**
- ✅ **Automatic SSL certificates**
- ✅ **GitHub integration**
- ✅ **Custom domains**
- ✅ **Environment variables**
- ✅ **Build logs and monitoring**

## 🚀 **Your Project is Ready!**

No Docker configuration needed - Render handles everything natively!

## 🛠️ **Development Commands:**

```bash
# Install dependencies
npm run install:all

# Run both services locally
npm run dev

# Build frontend for production
npm run build:frontend
```

## 📋 **Pre-Deployment Checklist:**

### **Before Deploying to Render:**

✅ **1. Commit All Changes to GitHub:**

```bash
# Check what files have changed
git status

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "feat: restructure for frontend-backend separation and Render deployment"

# Push to GitHub
git push origin main
```

✅ **2. Verify Repository Structure:**
Your GitHub repo should show:

```
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js
│   ├── package.json
│   └── config/
└── README.md
```

✅ **3. Check Package.json Files:**

- `frontend/package.json` - Has build script
- `backend/package.json` - Has start script

✅ **4. Environment Variables Ready:**

- Backend: `MONGO_URI`, `EMAIL`, `EMAIL_PASSWORD`
- Frontend: Will be updated after backend deployment

## 🚀 **Then Deploy to Render:**
