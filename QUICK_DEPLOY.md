# ⚡ MATCHBOX - Quick Deploy Commands

## 🚀 Deploy in 5 Minutes

### Prerequisites
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

---

## 📦 Backend Deployment

```bash
# Navigate to backend
cd backend

# Deploy
vercel --prod

# Copy the URL shown (e.g., https://matchbox-api-xxxx.vercel.app)
```

### Add Environment Variables (Vercel Dashboard)
Go to: [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/matchbox?retryWrites=true&w=majority
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">
JWT_EXPIRE=7d
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=dxzbv2wsb
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Redeploy: `vercel --prod`

---

## 🎨 Frontend Deployment

```bash
# Navigate to frontend
cd "../MagicPatternsCode/Front End"

# Update .env.production with backend URL
echo 'VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_APP_NAME=MATCHBOX
VITE_APP_ENV=production' > .env.production

# Deploy
vercel --prod

# Copy the URL shown (e.g., https://matchbox-frontend-xxxx.vercel.app)
```

### Add Environment Variables (Vercel Dashboard)
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_APP_NAME=MATCHBOX
VITE_APP_ENV=production
```

---

## 🔄 Update Backend CORS

In Backend Vercel Dashboard:
- Update `CORS_ORIGIN` to frontend URL
- Redeploy: `vercel --prod`

---

## ✅ Test

Visit: `https://your-frontend-url.vercel.app`

Test:
1. Signup with file uploads
2. Login
3. Send chat message
4. Check MongoDB Atlas for data
5. Check Cloudinary for uploaded files

---

## 🛠️ Quick Commands Reference

```bash
# View logs
vercel logs [project-name]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Check which project you're in
vercel projects ls
```

---

## 📊 MongoDB Atlas Quick Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Database Access → Add User (save password!)
4. Network Access → Add IP: `0.0.0.0/0`
5. Connect → Get connection string
6. Replace `<password>` in connection string
7. Add `/matchbox` before `?` in connection string

---

## 🎯 Environment Variables Generator

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### MongoDB Connection String Format
```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/matchbox?retryWrites=true&w=majority
```

### Cloudinary Setup
1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Dashboard shows:
   - Cloud Name
   - API Key
   - API Secret

---

## 🔍 Health Checks

```bash
# Test backend
curl https://your-backend-url.vercel.app/health

# Test frontend (should return HTML)
curl https://your-frontend-url.vercel.app
```

---

## 📝 Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Update `CORS_ORIGIN` in backend to match frontend URL exactly |
| MongoDB Error | Check connection string, verify IP whitelist includes `0.0.0.0/0` |
| File Upload Fails | Verify Cloudinary credentials, check file size limits |
| 404 on Refresh | Ensure `vercel.json` exists in frontend with rewrite rules |
| Env Vars Not Working | Redeploy after adding/changing environment variables |

---

## 🎉 Done!

Your URLs:
- **Frontend**: https://your-frontend-url.vercel.app
- **Backend**: https://your-backend-url.vercel.app/health
