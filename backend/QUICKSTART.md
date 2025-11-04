# MATCHBOX Backend - Quick Start Guide

Get the MATCHBOX backend up and running in 5 minutes!

## Prerequisites

Make sure you have these installed:
- ✅ Node.js (v18+)
- ✅ MongoDB (v6+)
- ✅ npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/matchbox
JWT_SECRET=change-this-to-a-random-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB

**Option A - Local MongoDB**:
```bash
mongod
```

**Option B - MongoDB Atlas (Cloud)**:
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Run Development Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║   MATCHBOX API Server Running         ║
║   Environment: development            ║
║   Port: 5000                          ║
╚═══════════════════════════════════════╝
```

### 5. Test the API

**Health Check**:
```bash
curl http://localhost:5000/health
```

**Response**:
```json
{
  "success": true,
  "message": "MATCHBOX API is running",
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

### 6. Create Your First User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@stanford.edu",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "university": "Stanford University",
    "major": "Computer Science"
  }'
```

Save the token from the response!

### 7. Test Protected Route

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

### Connect Frontend

In your React app:

```typescript
// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Update Frontend AuthContext

Update the AuthContext in your frontend to use the real API:

```typescript
// MagicPatternsCode/Front End/src/context/AuthContext.tsx

import api from '../utils/api';

const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  localStorage.setItem('token', response.data.token);
  setUser(response.data.user);
};

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  setUser(response.data.user);
};
```

## Useful Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint

# Check TypeScript errors
npx tsc --noEmit
```

## Common Issues

### MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
1. Make sure MongoDB is running: `mongod`
2. Check connection string in `.env`
3. For MongoDB Atlas, whitelist your IP address

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9

   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### JWT Secret Warning

**Error**: Warning about weak JWT secret

**Solution**: Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output to `JWT_SECRET` in `.env`

## API Testing Tools

### Using Postman

1. Download [Postman](https://www.postman.com/)
2. Import collection from `postman_collection.json` (to be created)
3. Set `{{baseUrl}}` variable to `http://localhost:5000/api`

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests to `http://localhost:5000/api`
3. Save token in environment variables

### Using curl

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@stanford.edu","password":"pass123","firstName":"Test","lastName":"User","university":"Stanford","major":"CS"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@stanford.edu","password":"pass123"}'

# Get projects
curl http://localhost:5000/api/projects

# Create project (with auth)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Project","description":"A test","tags":["Tech"],"roles":[{"title":"Developer","description":"Code"}]}'
```

## Database Management

### View Data with MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Select `matchbox` database
4. Browse collections: users, projects, chats, matches, etc.

### Clear Database (Development Only)

```bash
# Connect to MongoDB
mongosh

# Switch to matchbox database
use matchbox

# Drop all collections
db.dropDatabase()
```

## Production Deployment

### Environment Variables

Set these in production:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matchbox
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

### Build & Deploy

```bash
# Build
npm run build

# Start
npm start
```

### Deployment Platforms

- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Simple Node.js hosting
- **Render**: Free tier available
- **AWS/DigitalOcean**: Full control

## Support

- 📚 Full API docs: See [README.md](README.md)
- 🔍 API reference: See [API_REFERENCE.md](API_REFERENCE.md)
- 🐛 Issues: Open GitHub issue

---

**Happy coding! 🚀**
