# 🧪 API Testing Guide

## Test Your Backend Without Building UI

Before building the frontend pages, verify your API works!

## Method 1: Using curl (Terminal)

### Test Server is Running
```bash
curl http://localhost:5000/
```
Expected: `{"message":"Matchbox API is running 🔥"}`

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User (Protected Route)
```bash
# Replace YOUR_TOKEN with the token from register/login response
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Method 2: Using Postman (Recommended)

### Setup
1. Download Postman: https://www.postman.com/downloads/
2. Create a new collection called "Matchbox"

### Create Requests

**1. Register User**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**2. Login**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "jane@example.com",
  "password": "securepass123"
}
```
- **Save the token** from response!

**3. Get Me (Protected)**
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`

### Pro Tip: Environment Variables in Postman
1. Click "Environments" → Create "Local"
2. Add variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: (paste your token here)
3. Use in requests:
   - URL: `{{baseUrl}}/api/auth/login`
   - Header: `Bearer {{token}}`

## Method 3: Using VS Code Thunder Client

1. Install "Thunder Client" extension in VS Code
2. Click Thunder Client icon in sidebar
3. Create new request
4. Same steps as Postman above

## Method 4: Using JavaScript (Browser Console)

Open http://localhost:3000 and run in browser console:

### Register
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Browser Test',
    email: 'browser@test.com',
    password: 'test12345'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

### Login
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'browser@test.com',
    password: 'test12345'
  })
})
.then(r => r.json())
.then(data => {
  console.log(data);
  localStorage.setItem('token', data.data.token);
})
```

### Get Me
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data))
```

## Testing Validation

### Should Fail: Missing Fields
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```
Expected: 400 error with validation messages

### Should Fail: Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "notanemail",
    "password": "password123"
  }'
```
Expected: 400 error - "Valid email is required"

### Should Fail: Short Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "short"
  }'
```
Expected: 400 error - "Password must be at least 8 characters"

### Should Fail: Duplicate Email
Register same email twice:
```bash
# First time - should work
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "duplicate@test.com",
    "password": "password123"
  }'

# Second time - should fail
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test2",
    "email": "duplicate@test.com",
    "password": "password123"
  }'
```
Expected: 400 error - "User already exists"

### Should Fail: Wrong Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```
Expected: 401 error - "Invalid credentials"

### Should Fail: No Token
```bash
curl http://localhost:5000/api/auth/me
```
Expected: 401 error - "Not authorized, no token provided"

### Should Fail: Invalid Token
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```
Expected: 401 error - "Not authorized, token failed"

## Checking MongoDB

### Using MongoDB Compass (GUI)
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `matchbox` database → `users` collection
4. See all registered users

### Using MongoDB Shell
```bash
mongosh
use matchbox
db.users.find().pretty()
```

### Using Atlas (Cloud)
1. Go to your Atlas cluster
2. Click "Browse Collections"
3. See `matchbox` database

## Test Checklist

Before building UI, verify:
- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Receive JWT token
- [ ] Can access protected route with token
- [ ] Validation rejects invalid data
- [ ] Duplicate emails are rejected
- [ ] Wrong password is rejected
- [ ] Users appear in MongoDB
- [ ] Passwords are hashed (not plain text in DB)

## Expected MongoDB User Document

```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",  // Hashed!
  "skills": [],
  "interests": [],
  "isEmailVerified": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Common Issues

**CORS Error in Browser:**
- Make sure `CLIENT_URL` in server `.env` is correct
- Should be: `http://localhost:3000`

**Connection Refused:**
- Check if server is running: `npm run dev:server`
- Check if PORT is correct in `.env`

**Cannot Find Module:**
- Run: `npm install` in server directory

**MongoDB Connection Error:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`

## Next Steps

Once all tests pass:
1. Build login page UI
2. Build register page UI
3. Connect forms to API
4. Add authentication context
5. Implement protected routes

Happy testing! 🧪
