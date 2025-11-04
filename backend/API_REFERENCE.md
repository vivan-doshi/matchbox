# MATCHBOX API Reference

Complete API endpoint reference for the MATCHBOX backend.

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Projects](#projects)
4. [Applications](#applications)
5. [Chats & Messaging](#chats--messaging)
6. [Matches](#matches)
7. [Error Handling](#error-handling)

---

## Authentication

### POST /api/auth/signup
Register a new user account.

**Access**: Public

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Must be .edu domain |
| password | string | Yes | Minimum 6 characters |
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |
| preferredName | string | No | Preferred name |
| university | string | Yes | University name |
| major | string | Yes | Major/field of study |
| graduationYear | number | No | Expected graduation year |
| isAlumni | boolean | No | Alumni status |
| bio | string | No | User bio (max 500 chars) |
| skills | object | No | Skill ratings (0-10) |
| professionalLinks | object | No | LinkedIn, GitHub, Portfolio |

**Response**: `201 Created`
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### POST /api/auth/login
Login to existing account.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@university.edu",
  "password": "password123"
}
```

**Response**: `200 OK`

### GET /api/auth/me
Get current logged in user.

**Access**: Private (requires JWT)

**Response**: `200 OK`

---

## Users

### GET /api/users/:id
Get user profile by ID.

**Access**: Public

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "university": "Stanford",
    "skills": { ... },
    ...
  }
}
```

### PUT /api/users/:id
Update user profile.

**Access**: Private (own profile only)

**Request Body**: Partial user object

**Response**: `200 OK`

### GET /api/users/:id/projects
Get all projects created by user.

**Access**: Public

**Response**: `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

### GET /api/users/search
Search for users.

**Access**: Private

**Query Parameters**:
- `q` - Search query (name, email)
- `university` - Filter by university
- `skills` - Filter by skills

**Response**: `200 OK`

---

## Projects

### GET /api/projects
Get all projects with optional filtering.

**Access**: Public

**Query Parameters**:
- `search` - Full-text search
- `tags` - Comma-separated tags (Tech,Design,Business)
- `status` - Planning | In Progress | Completed

**Response**: `200 OK`
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "...",
      "title": "AI Study Assistant",
      "description": "...",
      "creator": { ... },
      "tags": ["Tech", "AI"],
      "status": "Planning",
      "roles": [ ... ],
      "createdAt": "2025-10-23T..."
    }
  ]
}
```

### GET /api/projects/:id
Get single project details.

**Access**: Public

**Response**: `200 OK`

### POST /api/projects
Create new project.

**Access**: Private

**Request Body**:
```json
{
  "title": "Project Title",
  "description": "Detailed description",
  "tags": ["Tech", "Design"],
  "roles": [
    {
      "title": "Frontend Developer",
      "description": "Build React UI",
      "filled": false
    }
  ],
  "startDate": "2025-11-01",
  "deadline": "2025-12-15"
}
```

**Response**: `201 Created`

### PUT /api/projects/:id
Update project.

**Access**: Private (creator only)

**Response**: `200 OK`

### DELETE /api/projects/:id
Delete project.

**Access**: Private (creator only)

**Response**: `200 OK`

---

## Applications

### POST /api/projects/:id/apply
Apply for a project role.

**Access**: Private

**Request Body**:
```json
{
  "role": "Frontend Developer",
  "message": "I'm interested in this role because..."
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "...",
    "project": "...",
    "user": { ... },
    "role": "Frontend Developer",
    "message": "...",
    "fitScore": "High",
    "status": "Pending"
  }
}
```

### GET /api/projects/:id/applicants
Get all applicants for a project.

**Access**: Private (creator only)

**Response**: `200 OK`

### PUT /api/projects/:id/applicants/:applicationId
Accept or reject an application.

**Access**: Private (creator only)

**Request Body**:
```json
{
  "status": "Accepted"
}
```

**Response**: `200 OK`

**Note**: When status is "Accepted", the user is automatically added to the project role.

### GET /api/projects/:id/recommendations
Get recommended users for project roles.

**Access**: Private

**Response**: `200 OK`

---

## Chats & Messaging

### GET /api/chats
Get all chats for current user.

**Access**: Private

**Response**: `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "...",
      "participants": [ ... ],
      "lastMessage": {
        "text": "Hello!",
        "sender": "...",
        "createdAt": "..."
      },
      "updatedAt": "..."
    }
  ]
}
```

### POST /api/chats
Create or get existing chat with another user.

**Access**: Private

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response**: `200 OK` or `201 Created`

### GET /api/chats/:id
Get chat details.

**Access**: Private (participants only)

**Response**: `200 OK`

### POST /api/chats/:id/messages
Send a message in chat.

**Access**: Private (participants only)

**Request Body**:
```json
{
  "text": "Message content here"
}
```

**Response**: `201 Created`

### GET /api/chats/:id/messages
Get all messages in chat.

**Access**: Private (participants only)

**Response**: `200 OK`

### PUT /api/chats/:id/read
Mark all messages in chat as read.

**Access**: Private (participants only)

**Response**: `200 OK`

### GET /api/chats/groups
Get all groups for current user.

**Access**: Private

**Response**: `200 OK`

### POST /api/chats/groups
Create a new group.

**Access**: Private

**Request Body**:
```json
{
  "name": "Team Alpha",
  "members": ["userId1", "userId2"],
  "project": "projectId"
}
```

**Response**: `201 Created`

### GET /api/chats/groups/:id
Get group details.

**Access**: Private (members only)

**Response**: `200 OK`

### POST /api/chats/groups/:id/messages
Send message in group.

**Access**: Private (members only)

**Request Body**:
```json
{
  "text": "Group message"
}
```

**Response**: `201 Created`

---

## Matches

### GET /api/matches
Get all matches for current user.

**Access**: Private

**Response**: `200 OK`
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "...",
      "user1": { ... },
      "user2": { ... },
      "approvedByUser1": true,
      "approvedByUser2": true,
      "isBoxed": true,
      "project": { ... },
      "createdAt": "..."
    }
  ]
}
```

### POST /api/matches
Create match or approve existing match.

**Access**: Private

**Request Body**:
```json
{
  "otherUserId": "507f1f77bcf86cd799439011",
  "project": "507f1f77bcf86cd799439013"
}
```

**Response**: `200 OK`

**Note**:
- Creates new match if doesn't exist
- Updates approval status if exists
- Auto-sets `isBoxed: true` when both users approve

### GET /api/matches/:id
Get match details.

**Access**: Private (participants only)

**Response**: `200 OK`

### GET /api/matches/pending
Get pending matches (waiting for other user's approval).

**Access**: Private

**Response**: `200 OK`

### GET /api/matches/boxed
Get all BOXED matches (both users approved).

**Access**: Private

**Response**: `200 OK`

### DELETE /api/matches/:id
Delete a match.

**Access**: Private (participants only)

**Response**: `200 OK`

### GET /api/matches/recommendations
Get recommended users to match with.

**Access**: Private

**Response**: `200 OK`

**Algorithm**: Based on:
- Similar interests
- Same university
- Complementary skills

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

### Common Error Messages

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**400 Validation Error**:
```json
{
  "success": false,
  "message": "Email must be from an educational institution (.edu)",
  "errors": { ... }
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users

---

## Pagination

Future enhancement - add pagination to list endpoints:

```
GET /api/projects?page=1&limit=20
```

Response:
```json
{
  "success": true,
  "count": 20,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 157,
    "pages": 8
  },
  "data": [ ... ]
}
```

---

## Webhooks

Future feature for real-time notifications:
- New message received
- Match approved (BOXED)
- Application status changed
- New project applicant

---

**Last Updated**: October 2025
