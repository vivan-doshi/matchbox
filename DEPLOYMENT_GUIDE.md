# 🚀 MATCHBOX Vercel Deployment Guide

## ✅ Pre-Deployment Checklist Completed

All code changes for serverless deployment have been made:
- ✅ Database connection caching implemented
- ✅ Server.ts modified for serverless
- ✅ Body size limits reduced to 10MB
- ✅ Vercel configuration files created
- ✅ Socket.io removed (not used)
- ✅ Frontend environment variables fixed

---

## 📝 Step-by-Step Deployment Instructions

### Phase 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Phase 2: Deploy Backend First

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

#### 2.3 Deploy Backend
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** `Y`
- **Which scope?** Select your account
- **Link to existing project?** `N`
- **Project name?** `matchbox-api` (or your preferred name)
- **In which directory is your code located?** `./` (current directory)
- **Want to override settings?** `N`

#### 2.4 Note Your Backend URL
After deployment, Vercel will provide a URL like:
```
https://matchbox-api-xxxxx.vercel.app
```
**COPY THIS URL - YOU'LL NEED IT!**

#### 2.5 Add Environment Variables to Backend
Go to: [vercel.com/dashboard](https://vercel.com/dashboard)

1. Select your `matchbox-api` project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=dxzbv2wsb
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important Notes:**
- For `MONGODB_URI`: Use your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/matchbox?retryWrites=true&w=majority`
- For `JWT_SECRET`: Generate a strong secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- For `CORS_ORIGIN`: We'll update this after frontend deployment (use `*` temporarily)
- Get Cloudinary credentials from your Cloudinary dashboard

#### 2.6 Redeploy Backend with Environment Variables
```bash
vercel --prod
```

#### 2.7 Test Backend Health
```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "MATCHBOX API is running",
  "timestamp": "2025-11-12T..."
}
```

---

### Phase 3: Deploy Frontend

#### 3.1 Update Frontend Environment File
Navigate to frontend directory and edit `.env.production`:

```bash
cd "../MagicPatternsCode/Front End"
```

Edit `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_APP_NAME=MATCHBOX
VITE_APP_ENV=production
```

**Replace `your-backend-url.vercel.app` with your actual backend URL from Step 2.4!**

#### 3.2 Deploy Frontend
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** `Y`
- **Which scope?** Select your account
- **Link to existing project?** `N`
- **Project name?** `matchbox-frontend` (or your preferred name)
- **In which directory is your code located?** `./` (current directory)
- **Want to override settings?** `N`

#### 3.3 Add Environment Variables to Frontend
Go to: [vercel.com/dashboard](https://vercel.com/dashboard)

1. Select your `matchbox-frontend` project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_APP_NAME=MATCHBOX
VITE_APP_ENV=production
```

#### 3.4 Production Deploy Frontend
```bash
vercel --prod
```

#### 3.5 Note Your Frontend URL
Vercel will provide a URL like:
```
https://matchbox-frontend-xxxxx.vercel.app
```

---

### Phase 4: Update Backend CORS

#### 4.1 Update Backend Environment Variable
Go to backend project in Vercel dashboard:
1. **Settings** → **Environment Variables**
2. Find `CORS_ORIGIN`
3. Update value to: `https://your-frontend-url.vercel.app`
4. Save changes

#### 4.2 Redeploy Backend
```bash
cd ../../backend
vercel --prod
```

---

### Phase 5: Verification & Testing

#### 5.1 Open Your Application
Visit: `https://your-frontend-url.vercel.app`

#### 5.2 Test Core Functionality

**A. Test Signup Flow**
1. Navigate to signup page
2. Fill in all information
3. Upload profile picture (< 5MB)
4. Upload resume (< 10MB)
5. Complete signup
6. Verify no errors in browser console (F12)

**B. Test Login**
1. Use credentials from signup
2. Verify successful authentication
3. Check if profile picture displays

**C. Test User Discovery**
1. Navigate to discover page
2. Verify users load
3. Check profile pictures display from Cloudinary

**D. Test Chat**
1. Start a conversation
2. Send messages
3. Verify messages appear (may need refresh for REST-based chat)

**E. Verify Database**
1. Log into MongoDB Atlas
2. Check `matchbox` database
3. Verify collections have data:
   - `users`
   - `chats`
   - `messages`

**F. Verify Cloudinary**
1. Log into Cloudinary dashboard
2. Navigate to Media Library
3. Check folders:
   - `matchbox/profiles` - profile pictures
   - `matchbox/resumes` - resume files

---

## 🔍 Troubleshooting

### Issue: "Network Error" or CORS Errors
**Solution:**
1. Check browser console for exact error
2. Verify `CORS_ORIGIN` in backend matches frontend URL exactly
3. Ensure both URLs use `https://` (not `http://`)
4. Redeploy backend after changing CORS_ORIGIN

### Issue: "Cannot connect to database"
**Solution:**
1. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
2. Verify connection string format in `MONGODB_URI`
3. Check MongoDB Atlas user has correct permissions
4. View Vercel function logs for detailed error

### Issue: File Uploads Fail
**Solution:**
1. Verify Cloudinary credentials are correct
2. Check file sizes (5MB images, 10MB PDFs)
3. View browser Network tab for error details
4. Check Vercel function logs

### Issue: "Function Timeout"
**Solution:**
1. Vercel free tier has 10-second timeout
2. Optimize database queries
3. Consider upgrading to Vercel Pro if needed

### Issue: Environment Variables Not Working
**Solution:**
1. Redeploy after adding/changing environment variables
2. Check variable names match exactly (case-sensitive)
3. Frontend variables must start with `VITE_`
4. Don't use quotes around values in Vercel dashboard

---

## 📊 Monitoring Your Deployment

### View Logs
```bash
# Backend logs
vercel logs matchbox-api

# Frontend logs
vercel logs matchbox-frontend
```

### Check Deployment Status
Visit: [vercel.com/dashboard](https://vercel.com/dashboard)
- View build logs
- Check function execution logs
- Monitor bandwidth usage

---

## 🔄 Making Updates

### Update Backend Code
```bash
cd backend
# Make changes to code
vercel --prod
```

### Update Frontend Code
```bash
cd "MagicPatternsCode/Front End"
# Make changes to code
vercel --prod
```

### Update Environment Variables
1. Go to Vercel dashboard
2. Select project
3. Settings → Environment Variables
4. Update values
5. Redeploy project

---

## 📝 Important URLs to Save

**Frontend URL:**
```
https://your-frontend-url.vercel.app
```

**Backend URL:**
```
https://your-backend-url.vercel.app
```

**Backend Health Check:**
```
https://your-backend-url.vercel.app/health
```

**MongoDB Atlas:**
```
https://cloud.mongodb.com/
```

**Cloudinary Dashboard:**
```
https://cloudinary.com/console
```

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] CORS configured correctly
- [ ] MongoDB Atlas connected
- [ ] Cloudinary uploads working
- [ ] User signup works
- [ ] User login works
- [ ] File uploads work
- [ ] Chat functionality works
- [ ] Profile pictures display
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

---

## 🚨 Security Reminders

1. **Never commit `.env` files to Git**
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Keep Cloudinary credentials secure**
4. **Regularly update dependencies**
5. **Monitor Vercel usage to stay within free tier**

---

## 💰 Free Tier Limits

### Vercel (Hobby Plan - Free)
- ✅ 100GB bandwidth/month
- ✅ 100 GB-hours serverless execution
- ✅ Unlimited projects
- ⚠️ 10-second function timeout

### MongoDB Atlas (Free Tier)
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ Perfect for development/small apps

### Cloudinary (Free Tier)
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25,000 transformations/month

---

## 🎉 Congratulations!

Your MATCHBOX application is now live and deployed on Vercel!

Share your URLs:
- **App**: https://your-frontend-url.vercel.app
- **API**: https://your-backend-url.vercel.app

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel function logs
2. Check browser console (F12)
3. Review MongoDB Atlas metrics
4. Check Cloudinary dashboard
5. Refer to the troubleshooting section above

**Happy deploying! 🚀**
