# 🚀 MATCHBOX Quick Start Guide

## ⚡ TL;DR - Get Running in 5 Minutes

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure backend environment
cd backend
cp .env.example .env
# Edit .env and set JWT_SECRET

# 3. Make sure MongoDB is running
mongod

# 4. Start both servers (from root directory)
cd ..
npm run dev
```

**That's it!** Open http://localhost:5173 in your browser.

---

## 🎯 What You Get

### Backend (Port 5000)
- ✅ Express + TypeScript API
- ✅ MongoDB with Mongoose
- ✅ JWT Authentication
- ✅ CORS enabled for frontend
- ✅ Full error handling
- ✅ Request logging

### Frontend (Port 5173)
- ✅ React + TypeScript + Vite
- ✅ Tailwind CSS
- ✅ Typed API client (Axios)
- ✅ Auth context with token management
- ✅ Protected routes
- ✅ Custom hooks for data fetching
- ✅ No CORS issues (Vite proxy)

---

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** running on localhost:27017

Check versions:
```bash
node --version  # Should be v18+
npm --version   # Should be 9+
mongod --version # Make sure MongoDB is installed
```

---

## 🔧 Detailed Setup

### Step 1: Clone & Install

```bash
cd matchbox

# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd "../MagicPatternsCode/Front End"
npm install

# Or use the shortcut:
cd ../..
npm run install:all
```

### Step 2: Configure Environment

**Backend** (`backend/.env`)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/matchbox
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

⚠️ **IMPORTANT:** Change `JWT_SECRET` to a secure random string (min 32 chars)

**Frontend** (`MagicPatternsCode/Front End/.env`) - Optional
```bash
cd "../MagicPatternsCode/Front End"
cp .env.example .env
```

Default values work fine for development.

### Step 3: Start MongoDB

Make sure MongoDB is running:
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Or start manually
mongod --dbpath /path/to/your/data

# Check if running
mongosh --eval "db.version()"
```

### Step 4: Run the App

**Option A: Run both servers together (Recommended)**
```bash
# From root directory
npm run dev
```

You'll see:
```
[0] Backend: Server running on port 5000
[1] Frontend: Server running on port 5173
```

**Option B: Run servers separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd "MagicPatternsCode/Front End"
npm run dev
```

### Step 5: Open Browser

Navigate to: **http://localhost:5173**

---

## ✅ Verify It's Working

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "MATCHBOX API is running",
  "timestamp": "..."
}
```

### 2. Frontend Check
- Open http://localhost:5173
- Should see the landing page
- No errors in browser console

### 3. Test Signup
1. Go to `/signup`
2. Enter email ending with `.edu`
3. Complete the form
4. Check browser Network tab - should see POST to `/api/auth/signup`

### 4. Test Login
1. Go to `/login`
2. Enter credentials
3. Should redirect to dashboard
4. Token saved in localStorage

---

## 🎮 Available Scripts

### Root Directory
```bash
npm run dev              # Run both backend + frontend
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only
npm run build            # Build both
npm run install:all      # Install all dependencies
npm run clean            # Remove all node_modules
```

### Backend
```bash
cd backend
npm run dev              # Start with nodemon (hot reload)
npm run build            # Compile TypeScript
npm start                # Run compiled JS
npm run lint             # Run ESLint
```

### Frontend
```bash
cd "MagicPatternsCode/Front End"
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

---

## 📁 Key Files & Folders

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # MongoDB connection
│   │   └── env.ts            # Environment config
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── types/
│   │   └── api.ts           # 🔥 Shared types (sync with frontend!)
│   ├── utils/
│   └── server.ts            # Express app setup
├── .env                     # Environment variables (don't commit!)
├── .env.example            # Template
└── package.json
```

### Frontend Structure
```
MagicPatternsCode/Front End/
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx   # Auth guards
│   ├── context/
│   │   ├── AuthContext.tsx          # 🔥 Auth state
│   │   └── SignupContext.tsx
│   ├── hooks/
│   │   └── useProjects.ts           # 🔥 Data fetching hooks
│   ├── pages/                       # Route components
│   ├── types/
│   │   └── api.ts                   # 🔥 Shared types (synced!)
│   ├── utils/
│   │   └── apiClient.ts             # 🔥 Axios wrapper
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts                   # 🔥 Proxy config
├── .env                             # Optional
└── package.json
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (protected)

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (protected)
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Matches
- `GET /api/matches` - Get matches
- `GET /api/matches/user/:userId` - Get matches for user

### Chats
- `GET /api/chats` - List chats (protected)
- `POST /api/chats` - Create chat (protected)
- `GET /api/chats/:id` - Get chat (protected)
- `POST /api/chats/:id/messages` - Send message (protected)

---

## 💡 Usage Examples

### Using apiClient
```typescript
import apiClient from '@/utils/apiClient';

// Login
const response = await apiClient.login({
  email: 'user@usc.edu',
  password: 'password123'
});

// Get projects
const projects = await apiClient.getProjects({
  status: 'Planning',
  page: 1
});

// Create project
const newProject = await apiClient.createProject({
  title: 'My Project',
  description: 'Description',
  tags: ['web', 'mobile'],
  roles: []
});
```

### Using Custom Hooks
```typescript
import { useProjects } from '@/hooks/useProjects';

function ProjectsList() {
  const { projects, loading, error, refetch } = useProjects({
    status: 'Planning'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects.map(p => <div key={p.id}>{p.title}</div>)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Using Auth Context
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => login('email', 'pass')}>Login</button>;
  }

  return <div>Welcome {user?.firstName}!</div>;
}
```

### Protected Routes
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Make sure MongoDB is running
```bash
brew services start mongodb-community
# or
mongod --dbpath /path/to/data
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Fix:** Kill the process or change port in `.env`
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### CORS Errors
```
Access to fetch blocked by CORS policy
```
**Fix:**
1. Check `backend/.env` has `CORS_ORIGIN=http://localhost:5173`
2. Check `vite.config.ts` has proxy configured
3. Restart both servers

### TypeScript Errors in Frontend
```
Cannot find module '@/utils/apiClient'
```
**Fix:** Make sure you're in the correct directory and dependencies are installed
```bash
cd "MagicPatternsCode/Front End"
npm install
```

### 401 Unauthorized
**Fix:** Check JWT_SECRET is set in backend `.env` and is at least 32 characters

### Token Not Saved
**Fix:** Check browser allows localStorage (not in incognito/private mode)

---

## 📚 Documentation

- [Complete Integration Guide](./INTEGRATION_COMPLETE.md)
- [Integration Checklist](./INTEGRATION_CHECKLIST.md)
- [Backend API Reference](./backend/API_REFERENCE.md)

---

## 🎯 Next Steps

1. **Test the signup flow**
   - Navigate to `/signup`
   - Complete all steps
   - Check if redirected to dashboard

2. **Test authentication**
   - Try accessing `/dashboard` without login
   - Should redirect to `/login`
   - Login and retry

3. **Explore the API**
   - Open browser DevTools → Network tab
   - Watch API calls as you navigate
   - Check Authorization headers are included

4. **Start building features**
   - Use `apiClient` for API calls
   - Use `useProjects` hook for project data
   - Add your own custom hooks
   - Create new pages and routes

---

## 💻 Development Tips

1. **Type Safety**
   - Always use types from `@/types/api`
   - Let TypeScript guide you

2. **API Calls**
   - Use `apiClient` methods (not raw axios)
   - Tokens are automatically included
   - Errors are automatically handled

3. **Hot Reload**
   - Both backend and frontend have hot reload
   - Save file → see changes immediately

4. **Debugging**
   - Backend logs in terminal
   - Frontend errors in browser console
   - Use React DevTools for component debugging

5. **Keep Types in Sync**
   - When changing backend types, copy to frontend:
   ```bash
   cp backend/src/types/api.ts "MagicPatternsCode/Front End/src/types/api.ts"
   ```

---

## 🎉 You're All Set!

Both servers are running, fully connected with:
- ✅ Type-safe API calls
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Error handling
- ✅ Hot reload

**Start building amazing features!** 🚀

---

**Need help?**
- Check [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) for detailed docs
- Use [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) to verify setup
- Review backend logs for API issues
- Check browser console for frontend issues
