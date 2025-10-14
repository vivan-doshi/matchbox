# 🚀 Matchbox Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)
- A code editor (VS Code recommended)

## Step 1: Clone & Install

```bash
# Navigate to your projects folder
cd /path/to/your/projects

# If you haven't cloned yet, initialize or clone your repo
# git clone <your-repo-url>
# cd matchbox

# Install root dependencies
npm install

# Install all workspace dependencies (client + server)
npm run install:all
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Windows
   # MongoDB should start automatically as a service
   
   # Linux
   sudo systemctl start mongod
   ```

2. Your connection string will be: `mongodb://localhost:27017/matchbox`

### Option B: MongoDB Atlas (Recommended for beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/matchbox
   ```
6. Replace `<username>` and `<password>` with your database credentials

## Step 3: Configure Environment Variables

### Server Configuration
1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `server/.env` with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Use your MongoDB connection string here
   MONGODB_URI=mongodb://localhost:27017/matchbox
   # OR for Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/matchbox
   
   # Generate a secure random string for JWT_SECRET
   # You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   
   CLIENT_URL=http://localhost:3000
   ```

### Client Configuration
1. Navigate to client directory:
   ```bash
   cd ../client
   ```

2. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

## Step 4: Start Development Servers

From the root `matchbox` directory:

```bash
# Start both client and server together
npm run dev
```

Or start them individually:

```bash
# Terminal 1 - Start server
npm run dev:server

# Terminal 2 - Start client  
npm run dev:client
```

You should see:
- ✅ Backend running at: `http://localhost:5000`
- ✅ Frontend running at: `http://localhost:3000`
- ✅ MongoDB connected

## Step 5: Verify Setup

1. Open browser to `http://localhost:3000`
2. You should see the Matchbox homepage
3. Test the API: `http://localhost:5000/` should return:
   ```json
   {"message": "Matchbox API is running 🔥"}
   ```

## Step 6: Test Authentication (Optional)

You can test the API using tools like:
- **Postman** - [Download](https://www.postman.com/downloads/)
- **Thunder Client** (VS Code extension)
- **curl** (command line)

### Register a test user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address in Atlas dashboard

### Issue: "Port 5000 already in use"
**Solution**: 
- Change `PORT` in `server/.env` to a different port (e.g., 5001)
- Or kill the process using port 5000

### Issue: "Module not found" errors
**Solution**: 
```bash
# Delete node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

### Issue: Next.js won't start
**Solution**:
```bash
cd client
rm -rf .next
npm run dev
```

## Next Steps

Now that your setup is complete, you can:

1. **Build the UI**: Create login/register pages
2. **Add features**: User profiles, matching algorithm
3. **Implement matching**: Build the core matching logic
4. **Add chat**: Integrate real-time messaging

Check out the main README.md for the full roadmap!

## Useful Commands

```bash
# Root directory
npm run dev              # Start both servers
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only

# Server directory
cd server
npm run dev              # Start with nodemon (auto-reload)
npm run build            # Compile TypeScript
npm run start            # Run compiled code

# Client directory
cd client
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
```

## Project Structure Overview

```
matchbox/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities (API client, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript types
│   │   └── contexts/         # React contexts
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/           # Database, env config
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, validation, etc.
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   └── utils/            # Helper functions
│   └── package.json
│
└── package.json               # Root workspace config
```

## Need Help?

- Check the [main README](./README.md)
- Review MongoDB docs: https://docs.mongodb.com/
- Next.js docs: https://nextjs.org/docs
- Express docs: https://expressjs.com/

Happy coding! 🔥
