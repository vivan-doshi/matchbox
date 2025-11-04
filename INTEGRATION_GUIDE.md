# MATCHBOX - Full Stack Integration Guide

## 🎉 Setup Complete!

Your MATCHBOX application is now fully integrated with both frontend and backend running!

## 🚀 Current Status

### ✅ Backend (Port 5000)
- **Status**: Running successfully
- **URL**: http://localhost:5000
- **Database**: MongoDB connected
- **API Endpoints**: All routes active

### ✅ Frontend (Port 5173)
- **Status**: Running successfully
- **URL**: http://localhost:5173
- **Framework**: React + Vite + TypeScript
- **API Integration**: Connected to backend

## 📋 What's Integrated

### 1. **Authentication System**
- Real JWT-based authentication
- Login & Signup with backend API
- Token storage in localStorage
- Automatic token attachment to requests
- Auto-logout on 401 errors

### 2. **API Client Setup**
- **File**: `src/utils/api.ts`
- Axios instance configured
- Request/response interceptors
- Automatic token management
- Error handling

### 3. **Auth Context Updated**
- **File**: `src/context/AuthContext.tsx`
- Connected to real API endpoints
- Persistent authentication (localStorage)
- Loading states
- Error handling

## 🧪 Testing the Application

### Test Authentication Flow:

1. **Open Frontend**: http://localhost:5173

2. **Sign Up**:
   - Click "Get Started" or "Sign Up"
   - Use email ending with `.edu` (required)
   - Fill in all required fields:
     ```
     Email: test@stanford.edu
     Password: password123
     First Name: John
     Last Name: Doe
     University: Stanford University
     Major: Computer Science
     ```

3. **Verify in Browser Console**:
   ```javascript
   // Check if token is stored
   localStorage.getItem('token')

   // Check user data
   localStorage.getItem('user')
   ```

4. **Login**:
   - Use the same credentials
   - Should redirect to dashboard

### Test API Endpoints:

#### Health Check:
```bash
curl http://localhost:5000/health
```

#### Signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@stanford.edu",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "university": "Stanford University",
    "major": "Computer Science"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@stanford.edu",
    "password": "password123"
  }'
```

#### Get Projects (with token):
```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📂 Project Structure

```
matchbox/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── models/            # MongoDB models
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & error handling
│   │   └── server.ts          # Server entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── MagicPatternsCode/
    └── Front End/             # React + Vite app
        ├── src/
        │   ├── components/    # React components
        │   ├── pages/         # Page components
        │   ├── context/       # AuthContext
        │   ├── utils/         # API client
        │   └── App.tsx
        └── package.json
```

## 🔗 API Endpoints Available

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (requires auth)
- `GET /api/users/:id/projects` - Get user's projects
- `GET /api/users/search` - Search users (requires auth)

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project (requires auth)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)
- `POST /api/projects/:id/apply` - Apply to project (requires auth)
- `GET /api/projects/:id/applicants` - Get applicants (requires auth)
- `GET /api/projects/:id/recommendations` - Get recommendations (requires auth)

### Chats & Messaging
- `GET /api/chats` - Get all chats (requires auth)
- `POST /api/chats` - Create or get chat (requires auth)
- `POST /api/chats/:id/messages` - Send message (requires auth)
- `GET /api/chats/groups` - Get groups (requires auth)
- `POST /api/chats/groups` - Create group (requires auth)

### Matches
- `GET /api/matches` - Get all matches (requires auth)
- `POST /api/matches` - Create/approve match (requires auth)
- `GET /api/matches/pending` - Get pending matches (requires auth)
- `GET /api/matches/boxed` - Get BOXED matches (requires auth)
- `GET /api/matches/recommendations` - Get recommendations (requires auth)

## 💻 Development Workflow

### Starting Both Servers:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd "MagicPatternsCode/Front End"
npm run dev
```

### Making Changes:

#### Backend Changes:
- Edit files in `backend/src/`
- Server auto-restarts with nodemon
- Check terminal for errors

#### Frontend Changes:
- Edit files in `MagicPatternsCode/Front End/src/`
- Hot reload happens automatically
- Check browser console for errors

## 🔍 Debugging

### Backend Not Starting?
1. Check MongoDB is running:
   ```bash
   mongosh
   ```
2. Check port 5000 is free:
   ```bash
   lsof -i :5000
   ```
3. Check `.env` file exists in backend/

### Frontend Not Connecting?
1. Check Network tab in browser DevTools
2. Verify backend URL in `src/utils/api.ts`
3. Check CORS settings in backend `.env`

### Authentication Issues?
1. Check browser console for errors
2. Verify `.edu` email requirement
3. Check localStorage:
   ```javascript
   console.log(localStorage.getItem('token'));
   console.log(localStorage.getItem('user'));
   ```

## 🎯 Next Steps

### 1. **Add More API Integration**
Update these pages to use real API:
- `HomePage.tsx` - Fetch real projects
- `ProjectDetailsPage.tsx` - Fetch project data
- `ProfilePage.tsx` - Fetch and update user data
- `ChatPage.tsx` - Real-time messaging
- `MyProjectsPage.tsx` - Fetch user's projects

### 2. **Enhance Error Handling**
- Add toast notifications
- Better error messages
- Loading states

### 3. **Add More Features**
- File upload for profiles/resumes
- Real-time chat with Socket.IO
- Project recommendations
- Match notifications

### 4. **Testing**
- Write unit tests for API
- Integration tests for auth flow
- E2E tests with Cypress

### 5. **Production Deployment**
- Set up MongoDB Atlas
- Deploy backend (Heroku/Railway/Render)
- Deploy frontend (Vercel/Netlify)
- Configure environment variables

## 📚 Resources

- **Backend API Docs**: See [backend/README.md](backend/README.md)
- **API Reference**: See [backend/API_REFERENCE.md](backend/API_REFERENCE.md)
- **Quick Start**: See [backend/QUICKSTART.md](backend/QUICKSTART.md)
- **Project Structure**: See [backend/STRUCTURE.md](backend/STRUCTURE.md)

## 🐛 Common Issues

### CORS Errors
If you see CORS errors in console:
1. Check `CORS_ORIGIN` in `backend/.env`
2. Should be: `http://localhost:5173`
3. Restart backend server

### MongoDB Connection Errors
1. Start MongoDB: `mongod` or `brew services start mongodb-community`
2. Check connection string in `.env`
3. For cloud: Use MongoDB Atlas

### Token Expired
Tokens expire after 7 days. To reset:
```javascript
localStorage.clear();
```
Then signup/login again.

## 🎉 Success!

You now have a fully functional full-stack application with:
- ✅ React frontend with TypeScript
- ✅ Express backend with TypeScript
- ✅ MongoDB database
- ✅ JWT authentication
- ✅ Real API integration
- ✅ Hot reload on both ends

Happy coding! 🚀
