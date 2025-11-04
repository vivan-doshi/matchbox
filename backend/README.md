# MATCHBOX Backend API

Backend API for MATCHBOX - A student project team matching platform that connects university students with complementary skills for collaborative projects.

## 🚀 Features

- **User Authentication**: JWT-based authentication with .edu email validation
- **User Profiles**: Comprehensive profiles with skills, interests, and professional links
- **Project Management**: Create, update, and manage projects with role-based team formation
- **Smart Matching**: Dual-approval "BOXED" system for team member matching
- **Messaging**: Direct messaging and group chats for team coordination
- **Application System**: Apply for project roles with fit scoring
- **Recommendations**: AI-powered user and project recommendations

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcrypt
- **Development**: Nodemon, ts-node

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🔧 Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/matchbox
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

### 🔐 Auth Routes

#### Register User
```http
POST /api/auth/signup
```

**Body**:
```json
{
  "email": "student@university.edu",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "preferredName": "Johnny",
  "university": "Stanford University",
  "major": "Computer Science",
  "graduationYear": 2025,
  "isAlumni": false,
  "bio": "Passionate about building innovative products",
  "skills": {
    "programming": 8,
    "design": 5,
    "marketing": 3,
    "writing": 6,
    "research": 7
  },
  "professionalLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com"
  }
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "university": "Stanford University"
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Body**:
```json
{
  "email": "student@university.edu",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
```
*Requires authentication*

---

### 👤 User Routes

#### Get User Profile
```http
GET /api/users/:id
```

#### Update User Profile
```http
PUT /api/users/:id
```
*Requires authentication (own profile only)*

**Body**: Same as signup (partial updates allowed)

#### Get User's Projects
```http
GET /api/users/:id/projects
```

#### Search Users
```http
GET /api/users/search?q=john&university=Stanford
```
*Requires authentication*

---

### 📁 Project Routes

#### Get All Projects
```http
GET /api/projects?search=blockchain&tags=Tech,Design&status=Planning
```

**Query Parameters**:
- `search` - Full-text search
- `tags` - Comma-separated tags
- `status` - Planning | In Progress | Completed

#### Get Single Project
```http
GET /api/projects/:id
```

#### Create Project
```http
POST /api/projects
```
*Requires authentication*

**Body**:
```json
{
  "title": "AI-Powered Study Assistant",
  "description": "Building an intelligent study companion using GPT-4",
  "tags": ["Tech", "AI", "Education"],
  "roles": [
    {
      "title": "Frontend Developer",
      "description": "Build React UI with modern design",
      "filled": false
    },
    {
      "title": "ML Engineer",
      "description": "Implement and fine-tune AI models",
      "filled": false
    }
  ],
  "startDate": "2025-11-01",
  "deadline": "2025-12-15"
}
```

#### Update Project
```http
PUT /api/projects/:id
```
*Requires authentication (creator only)*

#### Delete Project
```http
DELETE /api/projects/:id
```
*Requires authentication (creator only)*

#### Apply to Project
```http
POST /api/projects/:id/apply
```
*Requires authentication*

**Body**:
```json
{
  "role": "Frontend Developer",
  "message": "I have 3 years of React experience and would love to contribute!"
}
```

#### Get Project Applicants
```http
GET /api/projects/:id/applicants
```
*Requires authentication (creator only)*

#### Update Application Status
```http
PUT /api/projects/:id/applicants/:applicationId
```
*Requires authentication (creator only)*

**Body**:
```json
{
  "status": "Accepted"
}
```
Status: `Pending` | `Accepted` | `Rejected`

#### Get Project Recommendations
```http
GET /api/projects/:id/recommendations
```
*Requires authentication*

---

### 💬 Chat & Messaging Routes

#### Get All Chats
```http
GET /api/chats
```
*Requires authentication*

#### Create or Get Chat
```http
POST /api/chats
```
*Requires authentication*

**Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

#### Get Chat by ID
```http
GET /api/chats/:id
```
*Requires authentication*

#### Send Message
```http
POST /api/chats/:id/messages
```
*Requires authentication*

**Body**:
```json
{
  "text": "Hey! Let's discuss the project timeline."
}
```

#### Get Messages
```http
GET /api/chats/:id/messages
```
*Requires authentication*

#### Mark Messages as Read
```http
PUT /api/chats/:id/read
```
*Requires authentication*

#### Get All Groups
```http
GET /api/chats/groups
```
*Requires authentication*

#### Create Group
```http
POST /api/chats/groups
```
*Requires authentication*

**Body**:
```json
{
  "name": "AI Study Assistant Team",
  "members": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "project": "507f1f77bcf86cd799439013"
}
```

#### Get Group by ID
```http
GET /api/chats/groups/:id
```
*Requires authentication*

#### Send Group Message
```http
POST /api/chats/groups/:id/messages
```
*Requires authentication*

**Body**:
```json
{
  "text": "Team meeting tomorrow at 3 PM!"
}
```

---

### 🤝 Matching Routes

#### Get All Matches
```http
GET /api/matches
```
*Requires authentication*

#### Create or Update Match (Approve)
```http
POST /api/matches
```
*Requires authentication*

**Body**:
```json
{
  "otherUserId": "507f1f77bcf86cd799439011",
  "project": "507f1f77bcf86cd799439013"
}
```

#### Get Match by ID
```http
GET /api/matches/:id
```
*Requires authentication*

#### Get Pending Matches
```http
GET /api/matches/pending
```
*Requires authentication*

Returns matches waiting for the other user's approval.

#### Get Boxed Matches
```http
GET /api/matches/boxed
```
*Requires authentication*

Returns matches where both users have approved (BOXED status).

#### Delete Match
```http
DELETE /api/matches/:id
```
*Requires authentication*

#### Get Match Recommendations
```http
GET /api/matches/recommendations
```
*Requires authentication*

Returns recommended users based on skills, interests, and university.

---

## 🗄️ Database Models

### User
- email (unique, .edu required)
- password (hashed)
- firstName, lastName, preferredName
- university, major, graduationYear, isAlumni
- bio, profilePicture
- skills (programming, design, marketing, writing, research: 0-10)
- professionalLinks (linkedin, github, portfolio)
- interests (array of tags)

### Project
- title, description
- creator (User reference)
- tags (array)
- status (Planning | In Progress | Completed)
- roles (array of {title, description, filled, user})
- startDate, deadline
- githubRepo, mediumArticle

### Application
- project, user (references)
- role (string)
- message
- fitScore (High | Medium | Low)
- status (Pending | Accepted | Rejected)

### Match
- user1, user2 (User references)
- approvedByUser1, approvedByUser2 (boolean)
- isBoxed (auto-set when both approve)
- project (optional reference)

### Chat
- participants (array of User references)
- messages (array of {sender, text, read, createdAt})
- lastMessage

### Group
- name
- members (array of User references)
- project (optional reference)
- messages (array of {sender, text, createdAt})
- lastMessage

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Email Validation**: .edu domain requirement
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Mongoose schema validation
- **Authorization**: Route-level access control

---

## 📱 Frontend Integration

### Setting up API Client

```typescript
// In your frontend (React)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example Usage

```typescript
// Signup
const response = await api.post('/auth/signup', userData);
localStorage.setItem('token', response.data.token);

// Get projects
const projects = await api.get('/projects?tags=Tech');

// Create project
const newProject = await api.post('/projects', projectData);

// Send message
await api.post(`/chats/${chatId}/messages`, { text: 'Hello!' });
```

---

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Environment variables for production:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure MongoDB Atlas URI
- Set proper `CORS_ORIGIN`

---

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for student collaboration**
