# 🚀 MATCHBOX - Vercel Deployment Plan

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Frontend Deployment (Vite React App)](#frontend-deployment)
5. [Backend Deployment (Express API)](#backend-deployment)
6. [Environment Variables Setup](#environment-variables-setup)
7. [Database Setup (MongoDB Atlas)](#database-setup)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Testing & Verification](#testing--verification)
10. [Troubleshooting](#troubleshooting)
11. [Cost Estimation](#cost-estimation)

---

## 📊 Project Overview

**MATCHBOX** is a full-stack student project team matching platform with:
- **Frontend**: React + Vite + TypeScript (Port 5173 locally)
- **Backend**: Express + TypeScript + MongoDB (Port 5000 locally)
- **File Storage**: Cloudinary (images, PDFs)
- **Real-time**: Socket.io for chat functionality

---

## 🏗️ Architecture

### Current Local Setup
```
Frontend (localhost:5173)
    ↓ Proxy: /api → localhost:5000
Backend (localhost:5000)
    ↓
MongoDB (local or Atlas)
Cloudinary (cloud storage)
```

### Production Setup on Vercel
```
Frontend (matchbox.vercel.app)
    ↓ Direct API calls
Backend (matchbox-api.vercel.app)
    ↓
MongoDB Atlas (cloud)
Cloudinary (cloud storage)
```

---

## ✅ Pre-Deployment Checklist

### 1. Verify Local Build
- [ ] Frontend builds successfully
- [ ] Backend compiles TypeScript to JavaScript
- [ ] All tests pass
- [ ] Environment variables documented

### 2. Prepare Git Repository
- [ ] Code is committed to Git
- [ ] Sensitive files in `.gitignore`
- [ ] Clean working directory
- [ ] Push to GitHub/GitLab/Bitbucket

### 3. Third-Party Services
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account active
- [ ] All API keys available

---

## 🎨 Frontend Deployment (Vite React App)

### Step 1: Prepare Frontend for Production

#### A. Update API Configuration
Create `MagicPatternsCode/Front End/.env.production`:
```env
VITE_API_URL=https://matchbox-api.vercel.app
```

#### B. Update API Client
Modify `MagicPatternsCode/Front End/src/utils/apiClient.ts`:

```typescript
// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

#### C. Create `vercel.json` in Frontend Root
Create `MagicPatternsCode/Front End/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy Frontend to Vercel

#### Option A: Vercel CLI (Recommended for First Time)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd "MagicPatternsCode/Front End"

# Login to Vercel
vercel login

# Deploy (will ask questions)
vercel

# Answer prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? matchbox-frontend
# - Directory? ./
# - Override settings? N
```

#### Option B: Vercel Dashboard (GUI)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `MagicPatternsCode/Front End`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL` = `https://matchbox-api.vercel.app` (update after backend deployment)
6. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)
- Go to Project Settings → Domains
- Add custom domain (e.g., `matchbox.yourschool.edu`)
- Update DNS records as instructed

---

## ⚙️ Backend Deployment (Express API)

### Step 1: Prepare Backend for Vercel Serverless

#### A. Create `vercel.json` in Backend Root
Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### B. Create API Entry Point
Create `backend/api/index.ts`:
```typescript
import app from '../src/server';

export default app;
```

#### C. Update `package.json` Build Script
Update `backend/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "vercel-build": "echo 'No build step required'",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  }
}
```

#### D. Modify Server for Serverless
Update `backend/src/server.ts`:
```typescript
// Don't call app.listen() in production serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   MATCHBOX API Server Running         ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
    ║   Port: ${PORT}                          ║
    ╚═══════════════════════════════════════╝
    `);
  });
}

// Export for Vercel
export default app;
```

### Step 2: Deploy Backend to Vercel

#### Option A: Vercel CLI
```bash
# Navigate to backend directory
cd backend

# Deploy
vercel

# Answer prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? matchbox-api
# - Directory? ./
# - Override settings? N

# Production deployment
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository (or create separate repo for backend)
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build` or leave empty
   - **Output Directory**: Leave empty
5. Add Environment Variables (see next section)
6. Click "Deploy"

### Step 3: Note Your Backend URL
After deployment, your backend URL will be:
```
https://matchbox-api.vercel.app
```
Or similar - copy this URL!

---

## 🔐 Environment Variables Setup

### Frontend Environment Variables (Vercel Dashboard)
Navigate to: Project Settings → Environment Variables

Add:
```
VITE_API_URL=https://matchbox-api.vercel.app
```

### Backend Environment Variables (Vercel Dashboard)
Navigate to: Project Settings → Environment Variables

Add all of these:

#### Required Variables
```
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matchbox?retryWrites=true&w=majority

# JWT Secret (generate a strong secret!)
JWT_SECRET=your-production-jwt-secret-min-32-chars-long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://matchbox.vercel.app

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dxzbv2wsb
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### How to Generate Strong JWT Secret
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Visit: https://generate-secret.vercel.app/32
```

---

## 💾 Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new project: "MATCHBOX"

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider: **AWS** or **Google Cloud**
4. Choose region closest to your users
5. Cluster name: `matchbox-cluster`
6. Click "Create"

### Step 3: Configure Database Access
1. Go to "Database Access" tab
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `matchbox-admin`
5. Password: **Auto-generate & Save it!**
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" tab
2. Click "Add IP Address"
3. Choose: **Allow access from anywhere** (0.0.0.0/0)
   - Note: For Vercel serverless functions, this is required
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Choose: "Connect your application"
3. Driver: **Node.js**
4. Version: **4.1 or later**
5. Copy connection string:
```
mongodb+srv://matchbox-admin:<password>@matchbox-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. Replace `<password>` with actual password
7. Add database name: `/matchbox` before the `?`
8. Final string:
```
mongodb+srv://matchbox-admin:YOUR_PASSWORD@matchbox-cluster.xxxxx.mongodb.net/matchbox?retryWrites=true&w=majority
```

### Step 6: Test Connection
```bash
# In your backend directory
cd backend

# Create test file
cat > test-mongodb.js << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

testConnection();
EOF

# Run test
node test-mongodb.js
```

---

## 🔄 Post-Deployment Configuration

### Step 1: Update Frontend with Backend URL
1. Go to Frontend Vercel project
2. Settings → Environment Variables
3. Update `VITE_API_URL` with actual backend URL
4. Redeploy frontend:
```bash
vercel --prod
```

### Step 2: Update Backend CORS
1. Go to Backend Vercel project
2. Settings → Environment Variables
3. Update `CORS_ORIGIN` with actual frontend URL
4. Redeploy backend

### Step 3: Configure Cloudinary
1. Log in to Cloudinary dashboard
2. Go to Settings → Security
3. Add allowed domains:
   - `matchbox.vercel.app`
   - `matchbox-api.vercel.app`

### Step 4: Socket.io Configuration (If Using)
Update socket connection in frontend:
```typescript
// frontend/src/config/socket.ts
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});
```

**Note**: Vercel serverless functions have limitations with WebSockets. Consider:
- Using Vercel Edge Functions
- Or deploying backend to Railway/Render for better WebSocket support

---

## ✅ Testing & Verification

### Pre-Deployment Tests (Local)
```bash
# Test frontend build
cd "MagicPatternsCode/Front End"
npm run build
npm run preview

# Test backend build
cd backend
npm run build
node dist/server.js
```

### Post-Deployment Checklist

#### 1. Health Check
```bash
# Test backend health
curl https://matchbox-api.vercel.app/health

# Expected response:
# {
#   "success": true,
#   "message": "MATCHBOX API is running",
#   "timestamp": "2025-11-12T..."
# }
```

#### 2. Frontend Loading
- [ ] Visit frontend URL
- [ ] Page loads without errors
- [ ] Check browser console (F12) for errors
- [ ] Static assets load correctly

#### 3. API Integration
- [ ] Test signup flow
- [ ] Test login functionality
- [ ] Test file uploads (profile picture, resume)
- [ ] Test user discovery
- [ ] Test chat functionality
- [ ] Test notifications

#### 4. Database Verification
- [ ] Check MongoDB Atlas dashboard
- [ ] Verify collections created
- [ ] Verify data is being saved
- [ ] Check indexes

#### 5. Cloudinary Verification
- [ ] Upload profile picture
- [ ] Check Cloudinary media library
- [ ] Verify files appear in `matchbox/profiles`
- [ ] Verify files appear in `matchbox/resumes`

#### 6. Performance Tests
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s https://matchbox-api.vercel.app/health

# Create curl-format.txt:
cat > curl-format.txt << 'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue 1: Frontend Shows 404 on Refresh
**Symptom**: Direct URL access or page refresh shows 404
**Solution**: Ensure `vercel.json` has rewrite rules (see Frontend Deployment section)

#### Issue 2: CORS Errors
**Symptom**: Browser console shows CORS policy errors
**Solution**:
1. Verify `CORS_ORIGIN` environment variable in backend
2. Ensure backend has `credentials: true` in CORS config
3. Frontend must use `withCredentials: true` in axios

#### Issue 3: MongoDB Connection Fails
**Symptom**: Backend logs show MongoDB connection errors
**Solution**:
1. Verify connection string format
2. Check MongoDB Atlas network access (allow 0.0.0.0/0)
3. Verify database user credentials
4. Check if IP whitelist includes all IPs

#### Issue 4: Environment Variables Not Working
**Symptom**: Variables undefined at runtime
**Solution**:
1. Redeploy after adding environment variables
2. Check variable names match exactly
3. Frontend: must start with `VITE_`
4. Don't use quotes around values in Vercel dashboard

#### Issue 5: File Uploads Fail
**Symptom**: 413 Payload Too Large or upload errors
**Solution**:
1. Vercel has 4.5MB request body limit
2. Ensure files under limits (5MB images, 10MB PDFs)
3. Verify Cloudinary credentials
4. Check Cloudinary quota

#### Issue 6: Build Fails
**Symptom**: Deployment fails during build
**Solution**:
```bash
# Check TypeScript errors locally
npm run build

# View full error logs in Vercel dashboard
# Fix type errors, missing dependencies
```

#### Issue 7: Socket.io Not Working
**Symptom**: Real-time chat doesn't work
**Solution**:
- Vercel serverless has WebSocket limitations
- Consider using:
  - Vercel Edge Functions
  - Railway.app for backend
  - Render.com for backend
  - Or implement polling fallback

#### Issue 8: Slow Cold Starts
**Symptom**: First request after inactivity is slow
**Solution**:
- This is normal for serverless (cold starts)
- Vercel Pro has faster cold starts
- Consider keeping functions warm with cron job
- Use edge functions for faster responses

---

## 💰 Cost Estimation

### Free Tier Limits

#### Vercel (Free Hobby Plan)
- ✅ **Bandwidth**: 100GB/month
- ✅ **Build Minutes**: 6000/month
- ✅ **Serverless Function Execution**: 100 GB-Hours
- ✅ **Serverless Function Duration**: 10 seconds max
- ✅ **Edge Middleware**: 1,000,000 requests
- ❌ **Team collaboration**: Not included
- ❌ **Custom domains**: 1 per project (limited)

**Expected Usage**: Should fit comfortably within free tier for small-to-medium student project

#### MongoDB Atlas (Free Tier)
- ✅ **Storage**: 512MB
- ✅ **RAM**: 512MB
- ✅ **Shared CPU**
- ✅ **Bandwidth**: Reasonable for small apps
- ❌ **Backups**: Not included

**Expected Usage**: Suitable for ~100-500 users with moderate activity

#### Cloudinary (Free Tier)
- ✅ **Storage**: 25GB
- ✅ **Bandwidth**: 25GB/month
- ✅ **Transformations**: 25,000/month
- ✅ **Requests**: 500/hour (rate limited)

**Expected Usage**: Should handle hundreds of users

### When to Upgrade

#### Vercel Pro ($20/month)
- More bandwidth (1TB)
- Faster builds
- Team collaboration
- Analytics
- 100+ custom domains

#### MongoDB Atlas (M10 - $57/month)
- 10GB storage
- Dedicated CPU
- Backups
- Better performance

#### Cloudinary Plus ($89/month)
- 104GB storage
- 104GB bandwidth
- 150,000 transformations

### Free Alternatives to Consider

If you exceed free tiers:

**Backend Hosting**:
- [Railway.app](https://railway.app) - $5/month with better WebSocket support
- [Render.com](https://render.com) - Free tier with auto-sleep
- [Fly.io](https://fly.io) - Free tier, good for Node.js

**Database**:
- MongoDB Atlas Free Tier (stick with it)
- PostgreSQL on Railway (free tier)

**File Storage**:
- Cloudinary (free tier)
- AWS S3 with CloudFront (pay as you go, very cheap)

---

## 📚 Additional Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

### Helpful Commands
```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Pull environment variables locally
vercel env pull

# Promote deployment to production
vercel promote [deployment-url]

# Remove deployment
vercel remove [project-name]
```

---

## 🎯 Quick Start Deployment Steps

### Fastest Path to Production

1. **Setup MongoDB Atlas** (15 minutes)
   - Create account & cluster
   - Get connection string
   - Test connection

2. **Deploy Backend** (10 minutes)
   ```bash
   cd backend
   vercel
   # Add environment variables in dashboard
   vercel --prod
   ```

3. **Deploy Frontend** (10 minutes)
   ```bash
   cd "MagicPatternsCode/Front End"
   # Update .env.production with backend URL
   vercel
   # Add environment variables in dashboard
   vercel --prod
   ```

4. **Test Everything** (15 minutes)
   - Health check
   - Signup flow
   - File uploads
   - Chat functionality

**Total Time**: ~50 minutes

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Code builds locally
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Git repository up to date
- [ ] Cloudinary configured
- [ ] MongoDB Atlas ready

### During Deployment
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Database connection verified
- [ ] CORS configured correctly

### Post-Deployment
- [ ] Health check passes
- [ ] User signup works
- [ ] File uploads work
- [ ] Chat functionality works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

### Documentation
- [ ] Update README with production URLs
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Document known issues

---

## 🚀 You're Ready to Deploy!

Follow this plan step-by-step, and you'll have your MATCHBOX platform live on Vercel in under an hour.

**Questions or issues?**
- Check the Troubleshooting section
- Review Vercel deployment logs
- Check MongoDB Atlas metrics
- Verify Cloudinary dashboard

**Good luck with your deployment!** 🎉
