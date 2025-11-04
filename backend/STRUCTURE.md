# MATCHBOX Backend - Project Structure

## Directory Overview

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # MongoDB connection setup
│   │
│   ├── controllers/      # Request handlers (business logic)
│   │   ├── authController.ts      # Signup, login, auth
│   │   ├── userController.ts      # User CRUD operations
│   │   ├── projectController.ts   # Project management
│   │   ├── chatController.ts      # Messaging & groups
│   │   └── matchController.ts     # Matching system
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   └── errorHandler.ts   # Global error handling
│   │
│   ├── models/          # Mongoose schemas
│   │   ├── User.ts          # User model
│   │   ├── Project.ts       # Project model
│   │   ├── Application.ts   # Application model
│   │   ├── Match.ts         # Match model
│   │   ├── Chat.ts          # Chat model
│   │   └── Group.ts         # Group chat model
│   │
│   ├── routes/          # API route definitions
│   │   ├── authRoutes.ts     # /api/auth/*
│   │   ├── userRoutes.ts     # /api/users/*
│   │   ├── projectRoutes.ts  # /api/projects/*
│   │   ├── chatRoutes.ts     # /api/chats/*
│   │   └── matchRoutes.ts    # /api/matches/*
│   │
│   ├── types/           # TypeScript type definitions
│   │   └── (future custom types)
│   │
│   ├── utils/           # Utility functions
│   │   └── generateToken.ts  # JWT token generation
│   │
│   └── server.ts        # Express app entry point
│
├── tests/               # Test files (future)
│
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── .gitignore          # Git ignore rules
├── nodemon.json        # Nodemon configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── API_REFERENCE.md    # Complete API documentation
├── QUICKSTART.md       # Quick setup guide
├── README.md           # Main documentation
└── STRUCTURE.md        # This file
```

## File Descriptions

### Configuration

**src/config/database.ts**
- MongoDB connection using Mongoose
- Connection error handling
- Environment-based configuration

### Controllers

**src/controllers/authController.ts**
- `signup()` - Register new users
- `login()` - Authenticate users
- `getMe()` - Get current user info

**src/controllers/userController.ts**
- `getUserProfile()` - Get user by ID
- `updateUserProfile()` - Update user data
- `getUserProjects()` - Get user's projects
- `searchUsers()` - Search for users

**src/controllers/projectController.ts**
- `getProjects()` - List all projects (with filters)
- `getProject()` - Get single project
- `createProject()` - Create new project
- `updateProject()` - Update project
- `deleteProject()` - Delete project
- `applyToProject()` - Apply for project role
- `getProjectApplicants()` - Get applicants (creator only)
- `updateApplicationStatus()` - Accept/reject applications
- `getProjectRecommendations()` - Get recommended users

**src/controllers/chatController.ts**
- `getChats()` - Get all user chats
- `createOrGetChat()` - Create or retrieve chat
- `getChat()` - Get chat by ID
- `sendMessage()` - Send message
- `getMessages()` - Get chat messages
- `markAsRead()` - Mark messages as read
- `getGroups()` - Get user's groups
- `createGroup()` - Create group chat
- `getGroup()` - Get group by ID
- `sendGroupMessage()` - Send group message

**src/controllers/matchController.ts**
- `getMatches()` - Get all matches
- `createOrUpdateMatch()` - Create/approve match
- `getMatch()` - Get match by ID
- `getPendingMatches()` - Get pending approvals
- `getBoxedMatches()` - Get confirmed matches
- `deleteMatch()` - Delete match
- `getRecommendations()` - Get match recommendations

### Middleware

**src/middleware/auth.ts**
- `protect()` - JWT authentication middleware
- Verifies Bearer token
- Attaches user to request object
- Returns 401 if unauthorized

**src/middleware/errorHandler.ts**
- Global error handler
- Handles Mongoose errors
- Formats error responses
- Logs errors in development

### Models

**src/models/User.ts**
- User schema and model
- Password hashing (bcrypt)
- Email validation (.edu required)
- Skills rating (0-10)
- Professional links
- `comparePassword()` method

**src/models/Project.ts**
- Project schema and model
- Roles array with fill status
- Full-text search index
- Creator reference
- Status tracking

**src/models/Application.ts**
- Application schema
- Fit score calculation
- Status tracking (Pending/Accepted/Rejected)
- Unique constraint (user + project + role)

**src/models/Match.ts**
- Match schema
- Dual approval system
- Auto-BOXED when both approve
- Unique user pairing

**src/models/Chat.ts**
- Direct messaging
- Message array with sender/text/read
- Auto-update lastMessage
- Participant validation

**src/models/Group.ts**
- Group messaging
- Multiple members
- Project reference
- Message history

### Routes

**src/routes/authRoutes.ts**
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
```

**src/routes/userRoutes.ts**
```
GET    /api/users/search
GET    /api/users/:id
PUT    /api/users/:id
GET    /api/users/:id/projects
```

**src/routes/projectRoutes.ts**
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/apply
GET    /api/projects/:id/applicants
PUT    /api/projects/:id/applicants/:applicationId
GET    /api/projects/:id/recommendations
```

**src/routes/chatRoutes.ts**
```
GET    /api/chats
POST   /api/chats
GET    /api/chats/:id
POST   /api/chats/:id/messages
GET    /api/chats/:id/messages
PUT    /api/chats/:id/read
GET    /api/chats/groups
POST   /api/chats/groups
GET    /api/chats/groups/:id
POST   /api/chats/groups/:id/messages
```

**src/routes/matchRoutes.ts**
```
GET    /api/matches
POST   /api/matches
GET    /api/matches/pending
GET    /api/matches/boxed
GET    /api/matches/recommendations
GET    /api/matches/:id
DELETE /api/matches/:id
```

### Utilities

**src/utils/generateToken.ts**
- JWT token generation
- Uses JWT_SECRET from environment
- Configurable expiration

### Main Server

**src/server.ts**
- Express app initialization
- Middleware setup (CORS, Helmet, Morgan)
- Route mounting
- Error handling
- Database connection
- Server startup

## Data Flow

### Request Flow Example (Create Project)

```
1. Client sends POST /api/projects
   ↓
2. Express routes to projectRoutes
   ↓
3. protect() middleware validates JWT
   ↓
4. createProject() controller is called
   ↓
5. Project.create() saves to MongoDB
   ↓
6. Response sent back to client
```

### Authentication Flow

```
1. User signs up: POST /api/auth/signup
   ↓
2. Password hashed with bcrypt
   ↓
3. User saved to database
   ↓
4. JWT token generated
   ↓
5. Token + user data returned

Later requests:
1. Client sends token in Authorization header
   ↓
2. protect() middleware verifies token
   ↓
3. User attached to req.user
   ↓
4. Controller accesses req.userId
```

### Match System Flow (BOXED)

```
1. User A approves User B: POST /api/matches
   ↓
2. Match created with approvedByUser1: true
   ↓
3. User B approves User A: POST /api/matches
   ↓
4. Match updated with approvedByUser2: true
   ↓
5. Pre-save hook sets isBoxed: true
   ↓
6. Both users can now collaborate
```

## Technology Decisions

### Why TypeScript?
- Type safety for large codebase
- Better IDE support
- Catches errors at compile time
- Self-documenting code

### Why Mongoose?
- Schema validation
- Middleware/hooks
- Population (joins)
- Built-in TypeScript support

### Why JWT?
- Stateless authentication
- Scalable across servers
- Mobile-friendly
- Easy to implement

### Why Express?
- Most popular Node.js framework
- Large ecosystem
- Flexible middleware
- Well-documented

## Development Workflow

1. **Create Model** - Define data structure
2. **Create Controller** - Implement business logic
3. **Create Routes** - Define API endpoints
4. **Add Middleware** - Handle cross-cutting concerns
5. **Test** - Verify functionality
6. **Document** - Update API docs

## Future Enhancements

### Planned Features
- [ ] Socket.io for real-time chat
- [ ] Email verification
- [ ] Password reset
- [ ] File uploads (profile pictures, project files)
- [ ] Notifications system
- [ ] Advanced search with Elasticsearch
- [ ] Pagination on all list endpoints
- [ ] Rate limiting
- [ ] Caching with Redis
- [ ] Analytics tracking

### Code Organization
- [ ] Move interfaces to separate type files
- [ ] Add validation layer (class-validator)
- [ ] Implement service layer (separate from controllers)
- [ ] Add repository pattern
- [ ] Create API versioning (/api/v1)

### Testing
- [ ] Unit tests with Jest
- [ ] Integration tests
- [ ] E2E tests
- [ ] Test coverage >80%

### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Automated deployments
- [ ] Monitoring (Datadog, New Relic)
- [ ] Logging (Winston, Morgan)

## Best Practices Used

✅ **TypeScript** for type safety
✅ **Environment variables** for configuration
✅ **JWT** for stateless auth
✅ **Password hashing** with bcrypt
✅ **Input validation** with Mongoose schemas
✅ **Error handling** middleware
✅ **Security headers** with Helmet
✅ **CORS** configuration
✅ **Code organization** (MVC pattern)
✅ **Documentation** (README, API Reference)

## Common Patterns

### Controller Pattern
```typescript
export const controllerName = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Business logic
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Protected Route Pattern
```typescript
router.get('/protected', protect, controllerName);
```

### Population Pattern
```typescript
const data = await Model.find()
  .populate('reference', 'field1 field2')
  .populate('otherReference');
```

### Response Pattern
```typescript
{
  "success": true,
  "count": 10,        // For lists
  "data": { ... }     // Or array
}
```

---

**Last Updated**: October 2025
