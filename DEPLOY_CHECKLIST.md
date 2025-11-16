# ✅ MATCHBOX Deployment Checklist

## Pre-Deployment Setup

### MongoDB Atlas
- [ ] Account created at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Free M0 cluster created
- [ ] Database user created (username & password saved)
- [ ] Network access set to `0.0.0.0/0`
- [ ] Connection string copied and formatted:
  ```
  mongodb+srv://username:PASSWORD@cluster.mongodb.net/matchbox?retryWrites=true&w=majority
  ```

### Cloudinary
- [ ] Account logged in at [cloudinary.com](https://cloudinary.com)
- [ ] Cloud name noted: `dxzbv2wsb`
- [ ] API Key copied
- [ ] API Secret copied

### Vercel
- [ ] Account created at [vercel.com](https://vercel.com)
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in via CLI: `vercel login`

### JWT Secret
- [ ] Generated strong secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- [ ] Secret saved securely

---

## Backend Deployment

### Deploy Backend
- [ ] Navigate to backend: `cd backend`
- [ ] Deploy: `vercel --prod`
- [ ] Backend URL saved: `https://_________________________.vercel.app`

### Configure Backend Environment Variables
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Backend Project → Settings → Environment Variables

Add these variables:
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `MONGODB_URI` = `mongodb+srv://...`
- [ ] `JWT_SECRET` = `<your_generated_secret>`
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `CORS_ORIGIN` = `*` (temporarily, will update later)
- [ ] `CLOUDINARY_CLOUD_NAME` = `dxzbv2wsb`
- [ ] `CLOUDINARY_API_KEY` = `<your_key>`
- [ ] `CLOUDINARY_API_SECRET` = `<your_secret>`

### Redeploy Backend
- [ ] Redeploy: `vercel --prod`

### Test Backend
- [ ] Test health endpoint:
  ```bash
  curl https://your-backend-url.vercel.app/health
  ```
- [ ] Response shows `"success": true`

---

## Frontend Deployment

### Update Frontend Configuration
- [ ] Navigate to frontend: `cd "../MagicPatternsCode/Front End"`
- [ ] Edit `.env.production`:
  ```env
  VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
  VITE_APP_NAME=MATCHBOX
  VITE_APP_ENV=production
  ```

### Deploy Frontend
- [ ] Deploy: `vercel --prod`
- [ ] Frontend URL saved: `https://_________________________.vercel.app`

### Configure Frontend Environment Variables
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Frontend Project → Settings → Environment Variables

Add these variables:
- [ ] `VITE_API_BASE_URL` = `https://your-backend-url.vercel.app/api`
- [ ] `VITE_APP_NAME` = `MATCHBOX`
- [ ] `VITE_APP_ENV` = `production`

### Redeploy Frontend
- [ ] Redeploy: `vercel --prod`

---

## Update Backend CORS

### Fix CORS for Production
- [ ] Go to Backend Project in Vercel Dashboard
- [ ] Settings → Environment Variables
- [ ] Update `CORS_ORIGIN` = `https://your-frontend-url.vercel.app`
- [ ] Redeploy backend: `cd ../../backend && vercel --prod`

---

## Testing & Verification

### Initial Access
- [ ] Open frontend URL in browser
- [ ] Page loads without errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab - no errors
- [ ] Check Network tab - requests succeed

### User Authentication
- [ ] Navigate to signup page
- [ ] Fill out signup form
- [ ] Upload profile picture (test with 2-3MB image)
- [ ] Upload resume (test with 1-2MB PDF)
- [ ] Submit form
- [ ] Check for success message
- [ ] Verify redirect to dashboard/home

### Login Flow
- [ ] Navigate to login page
- [ ] Enter credentials from signup
- [ ] Click login
- [ ] Verify successful authentication
- [ ] Check profile picture displays

### User Discovery
- [ ] Navigate to discover/users page
- [ ] Verify users load
- [ ] Check profile pictures load from Cloudinary
- [ ] Click on a user profile
- [ ] Verify profile details display

### Chat Functionality
- [ ] Start a new chat/conversation
- [ ] Send a test message
- [ ] Verify message appears
- [ ] Refresh page
- [ ] Verify message persists

### MongoDB Verification
- [ ] Log into MongoDB Atlas
- [ ] Navigate to your cluster
- [ ] Browse Collections
- [ ] Check `matchbox` database exists
- [ ] Verify collections:
  - [ ] `users` collection has documents
  - [ ] `chats` collection exists
  - [ ] `messages` collection has data
- [ ] Open a user document
- [ ] Verify `profilePicture.url` contains Cloudinary URL (not base64)
- [ ] Verify `resume.url` contains Cloudinary URL

### Cloudinary Verification
- [ ] Log into Cloudinary dashboard
- [ ] Go to Media Library
- [ ] Check folders exist:
  - [ ] `matchbox/profiles` folder
  - [ ] `matchbox/resumes` folder
- [ ] Verify uploaded files appear
- [ ] Click on an image
- [ ] Verify URL works and image displays

### Performance Check
- [ ] Test on mobile device (responsive design)
- [ ] Check page load speed (should be < 3 seconds)
- [ ] Test file upload (should complete in < 10 seconds)
- [ ] Check API response times (should be < 2 seconds)

### Browser Console Check
- [ ] No JavaScript errors
- [ ] No failed network requests
- [ ] No CORS errors
- [ ] API requests return 200 OK status

---

## Post-Deployment

### Documentation
- [ ] Update README.md with production URLs
- [ ] Document environment variables used
- [ ] Note any known issues

### Monitoring Setup (Optional)
- [ ] Set up Vercel Analytics (free)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring

### Security
- [ ] Verify `.env` files not committed to Git
- [ ] Check `.gitignore` includes `.env*`
- [ ] Verify JWT_SECRET is strong (32+ characters)
- [ ] Confirm Cloudinary credentials are secure

### Backup
- [ ] MongoDB Atlas automatic backups enabled (requires paid tier)
- [ ] Export environment variables for backup
- [ ] Document deployment process

---

## Common Issues & Solutions

### ❌ CORS Error
**Symptom**: Browser shows "CORS policy" error
**Solution**:
1. Check `CORS_ORIGIN` in backend matches frontend URL exactly
2. Ensure both URLs use `https://` (not `http://`)
3. Redeploy backend after changing

### ❌ MongoDB Connection Failed
**Symptom**: Backend logs show "MongooseServerSelectionError"
**Solution**:
1. Verify MongoDB Atlas Network Access includes `0.0.0.0/0`
2. Check connection string format is correct
3. Verify username and password in connection string
4. Test connection string locally first

### ❌ Environment Variables Not Working
**Symptom**: Variables show as undefined
**Solution**:
1. Redeploy after adding environment variables
2. Check variable names match exactly (case-sensitive)
3. Frontend variables must start with `VITE_`
4. Don't use quotes around values in Vercel dashboard

### ❌ File Upload Fails
**Symptom**: 413 Payload Too Large or upload error
**Solution**:
1. Verify file size limits (5MB images, 10MB PDFs)
2. Check Cloudinary credentials are correct
3. Test with smaller file first
4. Check browser Network tab for detailed error

### ❌ 404 on Page Refresh
**Symptom**: Direct URLs or refresh shows 404
**Solution**:
1. Verify `vercel.json` exists in frontend directory
2. Check rewrite rules are correct
3. Redeploy frontend

### ❌ Images Don't Load
**Symptom**: Profile pictures show broken image icon
**Solution**:
1. Check browser console for errors
2. Verify Cloudinary URLs are accessible
3. Check CORS in Cloudinary settings
4. View uploaded files in Cloudinary dashboard

---

## URLs to Save

### Production URLs
- **Frontend**: `https://________________________________.vercel.app`
- **Backend**: `https://________________________________.vercel.app`
- **Health Check**: `https://________________________________.vercel.app/health`

### Service Dashboards
- **Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **Cloudinary**: [cloudinary.com/console](https://cloudinary.com/console)

### Support Resources
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

---

## Success Criteria

✅ **Deployment is successful when ALL of these are checked:**
- [ ] Frontend URL is live and accessible
- [ ] Backend health endpoint returns 200 OK
- [ ] User can complete signup with file uploads
- [ ] User can login successfully
- [ ] Profile pictures load from Cloudinary
- [ ] Chat messages can be sent and received
- [ ] No errors in browser console
- [ ] MongoDB Atlas shows user data
- [ ] Cloudinary shows uploaded files
- [ ] Application works on mobile devices

---

## Timeline

| Task | Estimated Time |
|------|---------------|
| MongoDB Atlas setup | 10 minutes |
| Backend deployment | 10 minutes |
| Frontend deployment | 10 minutes |
| Testing | 15 minutes |
| **Total** | **45 minutes** |

---

## 🎉 Congratulations!

When all checkboxes above are marked, your MATCHBOX application is successfully deployed to production!

**Next Steps**:
1. Share the frontend URL with users
2. Monitor usage in Vercel dashboard
3. Check MongoDB Atlas for data growth
4. Plan for scaling if needed

**Remember**: Free tiers should handle 100-500 active users comfortably!
