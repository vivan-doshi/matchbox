# ⚡ Quick Start (5 Minutes)

## The Absolute Fastest Way to Get Running

### 1. Install Dependencies (2 min)
```bash
cd matchbox
npm install
npm run install:all
```

### 2. Set Up Environment (1 min)
```bash
# Server
cd server
cp .env.example .env
# Edit .env - only change MONGODB_URI if you have MongoDB Atlas

# Client
cd ../client
cp .env.example .env.local
```

### 3. Start Everything (30 sec)
```bash
# Go back to root
cd ..

# Start both servers at once
npm run dev
```

### 4. Open Browser (30 sec)
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ⚠️ First Time Setup Only

### If you don't have MongoDB installed:

**Option 1: MongoDB Atlas (Easiest - 2 min)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Paste in `server/.env` as `MONGODB_URI`

**Option 2: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongod

# Windows
# Download from https://www.mongodb.com/try/download/community
```

## 🎯 What You Get Out of the Box

✅ User authentication (register/login)
✅ JWT tokens
✅ Password hashing
✅ TypeScript everywhere
✅ MongoDB database
✅ Next.js frontend with Tailwind
✅ Express backend with proper structure
✅ API client configured
✅ CORS configured
✅ Error handling
✅ Input validation

## 📁 Project Structure

```
matchbox/
├── client/              # Frontend (Next.js + Tailwind)
│   ├── src/app/        # Pages
│   ├── src/components/ # React components
│   └── src/lib/        # API client, utilities
│
├── server/              # Backend (Express + TypeScript)
│   ├── src/models/     # Database models
│   ├── src/routes/     # API endpoints
│   └── src/controllers/# Business logic
│
└── package.json        # Run both servers together
```

## 🧪 Test the API

Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'
```

## 📚 Next Steps

1. Read `SETUP.md` for detailed setup
2. Read `ROADMAP.md` for what to build next
3. Start building auth UI pages
4. Add user profiles
5. Build matching algorithm

## 🆘 Having Issues?

Check `SETUP.md` for detailed troubleshooting!

**Most common fix:**
```bash
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

That's it! You're ready to build 🔥
