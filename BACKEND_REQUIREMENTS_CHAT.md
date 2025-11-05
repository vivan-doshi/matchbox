# Backend Requirements for Chat Feature

## Overview
This document outlines the backend API requirements to support the updated chat functionality in the Matchbox platform. The frontend has been updated to support a cleaner chat interface with a new Requests section for managing incoming messages and project join requests.

## Current Frontend Implementation

### Data Models

#### Chat
```typescript
type Chat = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    university: string;
    role?: string;
  };
  lastMessage: {
    text: string;
    time: string;
    read: boolean;
    sentByMe: boolean;
  };
  matched: boolean;        // Legacy field - can be deprecated
  approved: {              // Legacy field - can be deprecated
    byMe: boolean;
    byThem: boolean;
  };
};
```

#### Request
```typescript
type Request = {
  id: string;
  type: 'message' | 'project_join';
  user: {
    id: string;
    name: string;
    avatar: string;
    university: string;
    role?: string;
  };
  message?: {
    text: string;
    time: string;
  };
  project?: {
    id: string;
    name: string;
    requestedRole: string;
  };
};
```

#### Group
```typescript
type Group = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  }[];
  lastMessage?: {
    text: string;
    time: string;
    sender: string;
  };
};
```

#### Message
```typescript
type Message = {
  id: string;
  text: string;
  time: string;
  sentByMe: boolean;
};
```

---

## Required Backend APIs

### 1. Chat/Direct Messages APIs

#### `GET /api/chats`
**Description:** Retrieve all direct message conversations for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat_123",
      "user": {
        "id": "user_456",
        "name": "Jamie Chen",
        "avatar": "https://example.com/avatar.jpg",
        "university": "Stanford",
        "role": "UI/UX Designer"
      },
      "lastMessage": {
        "text": "I'd love to join your project!",
        "time": "2024-01-15T14:30:00Z",
        "read": true,
        "sentByMe": false
      }
    }
  ]
}
```

**Persistence Requirements:**
- Chats should persist in the database
- Once a conversation is created (first message sent), it should remain in the user's chat list
- Chats should NOT be deleted when a user navigates away from the chat page
- Conversations should be sorted by most recent message

---

#### `GET /api/chats/:chatId/messages`
**Description:** Retrieve all messages for a specific chat conversation.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_789",
      "text": "Hi! How's the project going?",
      "time": "2024-01-15T14:30:00Z",
      "sentByMe": true
    },
    {
      "id": "msg_790",
      "text": "Great! I just finished the design mockups.",
      "time": "2024-01-15T14:35:00Z",
      "sentByMe": false
    }
  ]
}
```

**Persistence Requirements:**
- All messages should be stored permanently
- Messages should be retrievable even after navigating away
- Support pagination for long conversation histories

---

#### `POST /api/chats/:chatId/messages`
**Description:** Send a new message in a chat conversation.

**Request Body:**
```json
{
  "text": "Looking forward to collaborating with you!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg_791",
    "text": "Looking forward to collaborating with you!",
    "time": "2024-01-15T14:40:00Z",
    "sentByMe": true
  }
}
```

**Side Effects:**
- Update the `lastMessage` field for the chat
- Mark the message as unread for the recipient
- Send real-time notification to the recipient (WebSocket/Socket.io)

---

### 2. Requests APIs

#### `GET /api/requests`
**Description:** Retrieve all pending requests (both message requests from new users and project join requests).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "req_123",
      "type": "message",
      "user": {
        "id": "user_789",
        "name": "Sarah Johnson",
        "avatar": "https://example.com/avatar2.jpg",
        "university": "Berkeley",
        "role": "Frontend Developer"
      },
      "message": {
        "text": "Hi! I saw your project and would love to collaborate!",
        "time": "2024-01-15T13:00:00Z"
      }
    },
    {
      "id": "req_124",
      "type": "project_join",
      "user": {
        "id": "user_890",
        "name": "Mike Chen",
        "avatar": "https://example.com/avatar3.jpg",
        "university": "UCLA",
        "role": "Data Scientist"
      },
      "project": {
        "id": "proj_456",
        "name": "AI Study Assistant",
        "requestedRole": "ML Engineer"
      }
    }
  ]
}
```

**Persistence Requirements:**
- Requests should persist until approved or declined
- Requests should NOT disappear on page navigation
- Requests should be sorted by most recent first

---

#### `POST /api/requests/:requestId/approve`
**Description:** Approve a request (either message request or project join request).

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "chat_new_456",
    "message": "Request approved successfully"
  }
}
```

**Side Effects:**
- **For message requests:**
  - Remove request from requests list
  - Create a new chat conversation between the two users
  - Send notification to the requester that their request was approved

- **For project join requests:**
  - Remove request from requests list
  - Add user to the project with the requested role
  - Create a chat conversation if one doesn't exist
  - Send notification to the requester
  - Update project team members list

---

#### `POST /api/requests/:requestId/decline`
**Description:** Decline a request.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Request declined successfully"
  }
}
```

**Side Effects:**
- Remove request from requests list
- Optionally send notification to the requester (configurable)
- Log the declined request for analytics (optional)

---

### 3. Groups APIs

#### `GET /api/groups`
**Description:** Retrieve all group conversations for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "group_123",
      "name": "AI Study Assistant Team",
      "members": [
        {
          "id": "user_101",
          "name": "Alex Morgan",
          "avatar": "https://example.com/avatar4.jpg",
          "role": "Backend Developer"
        },
        {
          "id": "user_102",
          "name": "Jordan Smith",
          "avatar": "https://example.com/avatar5.jpg",
          "role": "ML Engineer"
        }
      ],
      "lastMessage": {
        "text": "I pushed the new API endpoints to GitHub",
        "time": "2024-01-15T09:15:00Z",
        "sender": "Alex Morgan"
      }
    }
  ]
}
```

---

#### `GET /api/groups/:groupId/messages`
**Description:** Retrieve all messages for a specific group.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_group_123",
      "text": "Welcome to the team!",
      "time": "2024-01-15T09:00:00Z",
      "sentByMe": true
    },
    {
      "id": "msg_group_124",
      "text": "Thanks! Excited to work with everyone.",
      "time": "2024-01-15T09:05:00Z",
      "sentByMe": false
    }
  ]
}
```

---

#### `POST /api/groups`
**Description:** Create a new group.

**Request Body:**
```json
{
  "name": "Hackathon Dream Team",
  "memberIds": ["user_123", "user_456", "user_789"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "group_new_456",
    "name": "Hackathon Dream Team",
    "members": [
      {
        "id": "user_123",
        "name": "Alice Johnson",
        "avatar": "https://example.com/avatar6.jpg",
        "role": "Product Manager"
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### `POST /api/groups/:groupId/messages`
**Description:** Send a message in a group.

**Request Body:**
```json
{
  "text": "Let's schedule our first meeting!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg_group_125",
    "text": "Let's schedule our first meeting!",
    "time": "2024-01-15T10:05:00Z",
    "sentByMe": true
  }
}
```

---

## Data Persistence Strategy

### Critical Requirements

1. **Conversation Persistence**
   - All chats (direct messages and groups) MUST persist in the database
   - Once a conversation exists (first message sent), it should never disappear
   - Conversations should remain accessible even after:
     - User navigates away from the chat page
     - User logs out and logs back in
     - Browser is closed and reopened

2. **Message Persistence**
   - All messages (direct and group) MUST be stored permanently
   - Messages should support:
     - Full conversation history retrieval
     - Pagination for performance
     - Search functionality (future enhancement)

3. **Request Persistence**
   - Pending requests MUST persist until explicitly approved or declined
   - Requests should remain even after:
     - Page navigation
     - Browser refresh
     - User logout/login

### Recommended Database Schema

#### Tables/Collections

**users**
- id (primary key)
- name
- email
- avatar
- university
- role
- created_at
- updated_at

**chats**
- id (primary key)
- type (enum: 'direct', 'group')
- created_at
- updated_at

**chat_participants**
- id (primary key)
- chat_id (foreign key)
- user_id (foreign key)
- last_read_message_id (foreign key, nullable)
- created_at

**messages**
- id (primary key)
- chat_id (foreign key)
- sender_id (foreign key)
- text
- created_at
- updated_at

**requests**
- id (primary key)
- type (enum: 'message', 'project_join')
- requester_id (foreign key)
- recipient_id (foreign key)
- project_id (foreign key, nullable)
- requested_role (nullable)
- message_text (nullable)
- status (enum: 'pending', 'approved', 'declined')
- created_at
- updated_at

**groups**
- id (primary key)
- chat_id (foreign key)
- name
- created_by (foreign key)
- created_at
- updated_at

---

## Real-Time Communication

### WebSocket/Socket.io Events

To provide a seamless chat experience, implement real-time updates using WebSocket or Socket.io:

#### Client → Server Events
- `join_chat` - User opens a chat conversation
- `leave_chat` - User closes a chat conversation
- `send_message` - User sends a message
- `typing` - User is typing (optional)

#### Server → Client Events
- `new_message` - New message received in a chat
- `message_read` - Message was read by recipient
- `new_request` - New request received
- `request_approved` - Request was approved
- `request_declined` - Request was declined
- `user_typing` - Another user is typing (optional)

---

## API Error Handling

All APIs should follow consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "CHAT_NOT_FOUND",
    "message": "The requested chat does not exist or you don't have access to it"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User doesn't have permission
- `CHAT_NOT_FOUND` - Chat doesn't exist
- `REQUEST_NOT_FOUND` - Request doesn't exist
- `INVALID_REQUEST_TYPE` - Invalid request type
- `USER_NOT_FOUND` - User doesn't exist
- `PROJECT_NOT_FOUND` - Project doesn't exist
- `ALREADY_APPROVED` - Request already approved
- `VALIDATION_ERROR` - Input validation failed

---

## Authentication & Authorization

All chat APIs require authentication. Use JWT tokens or session-based auth.

### Authorization Rules

1. **Direct Messages:**
   - Users can only access chats they are participants in
   - Users cannot access other users' private chats

2. **Groups:**
   - Users can only access groups they are members of
   - Only group members can send messages

3. **Requests:**
   - Users can only see requests directed to them
   - Users can only approve/decline their own requests

---

## Performance Considerations

1. **Pagination**
   - Implement pagination for message lists (recommended: 50 messages per page)
   - Implement pagination for chat lists if user has many conversations

2. **Caching**
   - Cache recent messages in Redis for faster retrieval
   - Invalidate cache when new messages are sent

3. **Indexes**
   - Index `chat_id` in messages table
   - Index `user_id` in chat_participants table
   - Index `recipient_id` and `status` in requests table
   - Index `created_at` for sorting by recency

4. **Database Queries**
   - Use JOIN queries efficiently to minimize round trips
   - Fetch user data along with messages to avoid N+1 queries

---

## Future Enhancements

1. **Message Attachments**
   - Support for images, files, links
   - File storage integration (AWS S3, Cloudinary)

2. **Message Reactions**
   - Allow users to react to messages with emojis

3. **Message Threading**
   - Reply to specific messages

4. **Read Receipts**
   - Show when messages are read

5. **Message Search**
   - Full-text search across all conversations

6. **Voice/Video Calls**
   - Integration with WebRTC for calls

7. **Message Editing/Deletion**
   - Allow users to edit or delete sent messages

8. **Typing Indicators**
   - Show when other users are typing

---

## Security Considerations

1. **Input Validation**
   - Sanitize all message text to prevent XSS attacks
   - Validate message length (max 5000 characters recommended)

2. **Rate Limiting**
   - Limit messages per user per minute (e.g., 30 messages/minute)
   - Limit requests per user per day (e.g., 50 requests/day)

3. **Spam Prevention**
   - Detect and block spam messages
   - Allow users to report/block other users

4. **Data Privacy**
   - Encrypt sensitive messages in database
   - Comply with GDPR/CCPA regulations
   - Allow users to delete their data

---

## Testing Requirements

### Unit Tests
- Test all API endpoints
- Test request approval/decline logic
- Test message persistence

### Integration Tests
- Test real-time message delivery
- Test chat creation from approved requests
- Test group message broadcasting

### Load Tests
- Test with 1000+ concurrent users
- Test with 10,000+ messages in a conversation
- Test WebSocket connection scalability

---

## Migration Plan

If existing backend has approval status system:

1. **Phase 1:** Add new requests table and APIs
2. **Phase 2:** Migrate existing approval data to requests
3. **Phase 3:** Deprecate old approval fields from chats table
4. **Phase 4:** Remove old approval logic from backend

---

## Summary

The frontend now provides a cleaner, more intuitive chat interface with:
- **Direct Messages:** Clean list without approval status clutter
- **Groups:** Team-based conversations
- **Requests:** Dedicated section for managing incoming connection and project requests

The backend must ensure:
✅ All conversations persist permanently
✅ Messages never disappear on navigation
✅ Requests remain until explicitly handled
✅ Real-time updates for seamless UX
✅ Secure, scalable, and performant APIs

For questions or clarifications, please contact the frontend development team.
