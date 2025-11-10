# MatchBox Project Completion Plan

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Backend-Frontend Connection Fixes](#phase-1-backend-frontend-connection-fixes)
4. [Phase 2: Messaging System Integration](#phase-2-messaging-system-integration)
5. [Phase 3: Invitation System](#phase-3-invitation-system)
6. [Phase 4: Notification System](#phase-4-notification-system)
7. [Phase 5: Search & Filter Improvements](#phase-5-search--filter-improvements)
8. [Phase 6: UI/UX Improvements](#phase-6-uiux-improvements)
9. [Phase 7: Data Consistency & State Management](#phase-7-data-consistency--state-management)
10. [Phase 8: Complete User Journey Flows](#phase-8-complete-user-journey-flows)
11. [Phase 9: Testing & Validation](#phase-9-testing--validation)
12. [Phase 10: Polish & Enhancements](#phase-10-polish--enhancements)
13. [Implementation Timeline](#implementation-timeline)
14. [Success Criteria](#success-criteria)

---

## 📊 Project Overview

### Current State Summary
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express + Node.js + MongoDB + Socket.io
- **Authentication**: JWT-based auth (fully functional)
- **Status**: Core features exist but many are disconnected

### Critical Issues
1. ❌ Discover People page uses mock data (not connected to backend)
2. ❌ Application system stores data in localStorage only
3. ❌ Messaging UI exists but not connected to backend
4. ❌ No invitation system implementation
5. ❌ No notification system (hardcoded counts)
6. ❌ Projects Joined tab always empty
7. ❌ Saved projects not synced to backend

### What Works
- ✅ User authentication (signup, login, logout)
- ✅ Project CRUD operations
- ✅ Profile management
- ✅ Project creation with comprehensive form
- ✅ Backend API structure is solid

---

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend:
├── React 18.3.1
├── TypeScript
├── Vite 5.2.0
├── React Router DOM 6.26.2
├── Axios 1.13.1
├── TailwindCSS 3.4.17
└── Lucide React 0.522.0

Backend:
├── Express 4.18.2
├── MongoDB + Mongoose 8.0.0
├── JWT Authentication
├── Socket.io 4.6.1
├── Bcrypt (password hashing)
└── Helmet + CORS
```

### Directory Structure
```
matchbox/
├── MagicPatternsCode/Front End/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── discover/
│       │   ├── notifications/
│       │   ├── projects/
│       │   └── shared/
│       ├── context/
│       ├── pages/
│       ├── types/
│       └── utils/
└── backend/
    └── src/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── utils/
```

---

## 🎯 Phase 1: Backend-Frontend Connection Fixes

**Priority**: ⭐⭐⭐⭐⭐ CRITICAL
**Estimated Time**: 2-3 days

### 1.1 Connect Discover People Page to Backend

**Problem**: DiscoverPeoplePage.tsx uses hardcoded MOCK_USERS array (lines 7-132)
**Solution**: Connect to `GET /api/users/search` endpoint

#### Step-by-Step Execution:

**File**: `MagicPatternsCode/Front End/src/pages/DiscoverPeoplePage.tsx`

1. **Remove mock data** (lines 7-132):
```typescript
// DELETE THIS:
const MOCK_USERS = [
  // ... all mock user data
];
```

2. **Add API integration** (around line 150):
```typescript
// ADD THIS:
import { api } from '../utils/apiClient';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  university: string;
  major: string;
  graduationYear: number;
  skills: Array<{ name: string; proficiency: string }>;
  interests: string[];
  weeklyAvailability: { hoursPerWeek: number };
  profilePicture?: string;
  bio?: string;
}

const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

3. **Create fetch function** (add after state declarations):
```typescript
const fetchUsers = async () => {
  try {
    setLoading(true);
    setError(null);

    // Build query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (filters.school) params.append('university', filters.school);
    if (filters.major) params.append('major', filters.major);
    if (filters.gradYear) params.append('graduationYear', filters.gradYear);
    if (filters.minAvailability) params.append('minAvailability', filters.minAvailability);
    if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));

    const response = await api.get(`/users/search?${params.toString()}`);
    setUsers(response.data.users || []);
  } catch (err: any) {
    console.error('Error fetching users:', err);
    setError(err.response?.data?.message || 'Failed to fetch users');
  } finally {
    setLoading(false);
  }
};
```

4. **Add useEffect to fetch on mount and filter changes**:
```typescript
useEffect(() => {
  fetchUsers();
}, [searchQuery, filters]); // Refetch when search or filters change
```

5. **Update filteredUsers logic** (replace existing filter logic):
```typescript
// REPLACE the existing filteredUsers logic with:
const filteredUsers = users; // Filtering now happens on backend
```

6. **Add loading and error states to UI** (in the return statement):
```typescript
{loading && (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
    {error}
  </div>
)}

{!loading && !error && users.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    No users found. Try adjusting your filters.
  </div>
)}
```

7. **Add debouncing to search** (install lodash.debounce if needed):
```typescript
import { debounce } from 'lodash';

// Create debounced search function
const debouncedFetchUsers = useMemo(
  () => debounce(fetchUsers, 500),
  []
);

// Update useEffect
useEffect(() => {
  debouncedFetchUsers();
  return () => debouncedFetchUsers.cancel();
}, [searchQuery, filters]);
```

**Backend Verification**: The endpoint already exists at `backend/src/controllers/userController.ts:176-216`

---

### 1.2 Implement Complete Application System

**Problem**: Applications stored in localStorage, not connected to backend
**Solution**: Implement full application flow with backend integration

#### Step-by-Step Execution:

**File 1**: `MagicPatternsCode/Front End/src/pages/ProjectDetailsPage.tsx`

1. **Remove localStorage logic** (find and delete around lines 171-194):
```typescript
// DELETE ALL localStorage application logic:
const savedApplications = localStorage.getItem('applications');
// ... etc
```

2. **Add application state**:
```typescript
const [hasApplied, setHasApplied] = useState(false);
const [userApplications, setUserApplications] = useState<string[]>([]);
```

3. **Create fetch applications function**:
```typescript
const fetchUserApplications = async () => {
  try {
    const response = await api.get(`/projects/${id}/user-applications`);
    setUserApplications(response.data.roleIds || []);
    setHasApplied(response.data.hasApplied || false);
  } catch (err) {
    console.error('Error fetching applications:', err);
  }
};

useEffect(() => {
  if (user) {
    fetchUserApplications();
  }
}, [id, user]);
```

4. **Update handleApply function**:
```typescript
const handleApply = async () => {
  if (!user) {
    navigate('/login');
    return;
  }

  try {
    setIsSubmitting(true);

    // Submit application to backend
    const response = await api.post(`/projects/${id}/apply`, {
      roles: selectedRoles,
      message: applicationMessage
    });

    // Show success
    setShowApplicationModal(false);
    setShowSuccessAnimation(true);

    // Refresh applications
    await fetchUserApplications();

    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 2000);
  } catch (err: any) {
    console.error('Error submitting application:', err);
    alert(err.response?.data?.message || 'Failed to submit application');
  } finally {
    setIsSubmitting(false);
  }
};
```

5. **Update role status display**:
```typescript
const getRoleStatus = (role: any) => {
  if (role.filled && role.user) return 'Filled';
  if (userApplications.includes(role._id)) return 'Applied';
  return 'Open';
};
```

**File 2**: `backend/src/routes/projectRoutes.ts`

Add new route:
```typescript
// Add after existing routes:
router.get('/:id/user-applications', protect, getProjectApplicationStatus);
```

**File 3**: `backend/src/controllers/projectController.ts`

Add new controller function:
```typescript
// Add this function:
export const getProjectApplicationStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;

    const applications = await Application.find({
      project: projectId,
      user: userId
    });

    const roleIds = applications.map(app => app.role);
    const hasApplied = applications.length > 0;

    res.json({ hasApplied, roleIds, applications });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**File 4**: `MagicPatternsCode/Front End/src/pages/ManageTeamPage.tsx`

1. **Fetch applicants**:
```typescript
const [applicants, setApplicants] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const fetchApplicants = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/projects/${projectId}/applicants`);
    setApplicants(response.data.applications || []);
  } catch (err) {
    console.error('Error fetching applicants:', err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchApplicants();
}, [projectId]);
```

2. **Handle accept/reject**:
```typescript
const handleAccept = async (applicationId: string) => {
  try {
    await api.put(`/projects/${projectId}/applicants/${applicationId}`, {
      status: 'Accepted'
    });

    // Refresh applicants
    await fetchApplicants();

    alert('Application accepted! User added to team.');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to accept application');
  }
};

const handleReject = async (applicationId: string) => {
  try {
    await api.put(`/projects/${projectId}/applicants/${applicationId}`, {
      status: 'Rejected'
    });

    await fetchApplicants();
    alert('Application rejected.');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to reject application');
  }
};
```

3. **Display applicants UI**:
```typescript
return (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Manage Team Applications</h1>

    {loading ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    ) : applicants.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        No applications yet.
      </div>
    ) : (
      <div className="space-y-4">
        {applicants.map(app => (
          <div key={app._id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">
                  {app.user.firstName} {app.user.lastName}
                </h3>
                <p className="text-gray-600">{app.user.university}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Applied for: <span className="font-medium">{app.role}</span>
                </p>
                <p className="mt-3 text-gray-700">{app.message}</p>
                <p className="mt-2 text-sm">
                  Fit Score: <span className={`font-medium ${
                    app.fitScore === 'High' ? 'text-green-600' :
                    app.fitScore === 'Medium' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>{app.fitScore}</span>
                </p>
              </div>

              {app.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(app._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(app._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}

              {app.status !== 'Pending' && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {app.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

---

### 1.3 Projects Joined Tab Implementation

**Problem**: "Projects Joined" tab always shows 0 projects
**Solution**: Create backend endpoint and connect frontend

#### Step-by-Step Execution:

**File 1**: `backend/src/routes/projectRoutes.ts`

Add new route:
```typescript
// Add this route:
router.get('/joined', protect, getJoinedProjects);
```

**File 2**: `backend/src/controllers/projectController.ts`

Add new controller:
```typescript
export const getJoinedProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Find projects where user is in any role
    const projects = await Project.find({
      'roles.user': userId,
      creator: { $ne: userId } // Exclude projects created by user
    })
      .populate('creator', 'firstName lastName university')
      .populate('roles.user', 'firstName lastName')
      .sort({ updatedAt: -1 });

    res.json({ projects, count: projects.length });
  } catch (error) {
    console.error('Error fetching joined projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**File 3**: `MagicPatternsCode/Front End/src/pages/MyProjects.tsx`

1. **Add state for joined projects**:
```typescript
const [joinedProjects, setJoinedProjects] = useState<any[]>([]);
const [loadingJoined, setLoadingJoined] = useState(false);
```

2. **Create fetch function**:
```typescript
const fetchJoinedProjects = async () => {
  try {
    setLoadingJoined(true);
    const response = await api.get('/projects/joined');
    setJoinedProjects(response.data.projects || []);
  } catch (err) {
    console.error('Error fetching joined projects:', err);
  } finally {
    setLoadingJoined(false);
  }
};

useEffect(() => {
  if (activeTab === 'joined') {
    fetchJoinedProjects();
  }
}, [activeTab]);
```

3. **Update tab display** (find the "Projects Joined" tab around line 314):
```typescript
<button
  onClick={() => setActiveTab('joined')}
  className={`px-6 py-3 font-medium ${
    activeTab === 'joined'
      ? 'border-b-2 border-orange-500 text-orange-500'
      : 'text-gray-600 hover:text-gray-800'
  }`}
>
  Projects Joined ({joinedProjects.length})
</button>
```

4. **Update content section** (find around line 630):
```typescript
{activeTab === 'joined' && (
  <div>
    {loadingJoined ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    ) : joinedProjects.length === 0 ? (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">You haven't joined any projects yet</p>
        <p className="text-gray-500 text-sm">
          Browse projects on the home page and apply to join a team!
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {joinedProjects.map(project => (
          <div key={project._id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {project.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  Created by: {project.creator.firstName} {project.creator.lastName}
                </p>

                {/* Show user's role in this project */}
                <div className="mt-3">
                  {project.roles
                    .filter((role: any) => role.user?._id === user?._id)
                    .map((role: any, idx: number) => (
                      <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mr-2">
                        Your Role: {role.title}
                      </span>
                    ))}
                </div>
              </div>

              <button
                onClick={() => navigate(`/project/${project._id}`)}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600"
              >
                View Project
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

---

### 1.4 Profile Projects Display

**Problem**: Profile page shows empty projects with TODO comment
**Solution**: Fetch and display user's projects

#### Step-by-Step Execution:

**File**: `MagicPatternsCode/Front End/src/pages/ProfilePage.tsx`

1. **Update state** (around line 40):
```typescript
// REPLACE:
projects: [] as any[]

// WITH:
projects: [] as any[],
loadingProjects: false
```

2. **Add fetch projects function**:
```typescript
const fetchUserProjects = async () => {
  try {
    setFormData(prev => ({ ...prev, loadingProjects: true }));

    // Fetch created projects
    const createdResponse = await api.get(`/projects/my-projects`);

    // Fetch joined projects
    const joinedResponse = await api.get(`/projects/joined`);

    // Combine both
    const allProjects = [
      ...createdResponse.data.projects.map((p: any) => ({ ...p, userRole: 'Creator' })),
      ...joinedResponse.data.projects.map((p: any) => {
        const userRole = p.roles.find((r: any) => r.user?._id === user?._id);
        return { ...p, userRole: userRole?.title || 'Member' };
      })
    ];

    setFormData(prev => ({
      ...prev,
      projects: allProjects,
      loadingProjects: false
    }));
  } catch (err) {
    console.error('Error fetching projects:', err);
    setFormData(prev => ({ ...prev, loadingProjects: false }));
  }
};

useEffect(() => {
  if (user) {
    fetchUserProjects();
  }
}, [user]);
```

3. **Update Projects tab UI** (find around line 700+):
```typescript
{activeTab === 'projects' && (
  <div className="space-y-6">
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setProjectFilter('active')}
        className={`px-4 py-2 rounded-lg ${
          projectFilter === 'active'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Active Projects
      </button>
      <button
        onClick={() => setProjectFilter('completed')}
        className={`px-4 py-2 rounded-lg ${
          projectFilter === 'completed'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Completed Projects
      </button>
    </div>

    {formData.loadingProjects ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    ) : formData.projects.filter(p =>
      projectFilter === 'active'
        ? p.status !== 'Completed'
        : p.status === 'Completed'
    ).length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <p>No {projectFilter} projects yet.</p>
      </div>
    ) : (
      <div className="grid gap-4">
        {formData.projects
          .filter(p =>
            projectFilter === 'active'
              ? p.status !== 'Completed'
              : p.status === 'Completed'
          )
          .map(project => (
            <div
              key={project._id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {project.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {project.userRole}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {project.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {project.roles.filter((r: any) => r.filled).length}/{project.roles.length} Roles Filled
                    </span>
                    {project.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
)}
```

4. **Add state for project filter**:
```typescript
const [projectFilter, setProjectFilter] = useState<'active' | 'completed'>('active');
```

---

## 🎯 Phase 2: Messaging System Integration

**Priority**: ⭐⭐⭐⭐ HIGH
**Estimated Time**: 3-4 days

### 2.1 Connect Chat Infrastructure

**Problem**: ChatPage exists but not connected to backend
**Solution**: Implement full chat functionality

#### Step-by-Step Execution:

**File 1**: Create `MagicPatternsCode/Front End/src/services/chatService.ts`

```typescript
import { api } from '../utils/apiClient';

export interface Message {
  _id?: string;
  sender: string | any;
  text: string;
  read?: boolean;
  createdAt: Date;
}

export interface Chat {
  _id: string;
  participants: any[];
  messages: Message[];
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const chatService = {
  // Get all user's chats
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  // Create or get existing chat with user
  createOrGetChat: async (participantId: string) => {
    const response = await api.post('/chats', { participants: [participantId] });
    return response.data;
  },

  // Get specific chat
  getChat: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  // Get messages for a chat
  getMessages: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  // Send a message
  sendMessage: async (chatId: string, text: string) => {
    const response = await api.post(`/chats/${chatId}/messages`, { text });
    return response.data;
  },

  // Mark chat as read
  markAsRead: async (chatId: string) => {
    const response = await api.put(`/chats/${chatId}/read`);
    return response.data;
  },

  // Group chats
  getGroups: async () => {
    const response = await api.get('/chats/groups');
    return response.data;
  },

  createGroup: async (name: string, members: string[], projectId?: string) => {
    const response = await api.post('/chats/groups', { name, members, project: projectId });
    return response.data;
  },

  sendGroupMessage: async (groupId: string, text: string) => {
    const response = await api.post(`/chats/groups/${groupId}/messages`, { text });
    return response.data;
  }
};
```

**File 2**: `MagicPatternsCode/Front End/src/pages/ChatPage.tsx`

Create complete ChatPage component:

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService, Chat, Message } from '../services/chatService';
import { Send, ArrowLeft, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch all chats on mount
  useEffect(() => {
    fetchChats();

    // Check if we should open a specific chat from URL
    const chatId = searchParams.get('chat');
    if (chatId) {
      openChat(chatId);
    }
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await chatService.getChats();
      setChats(data.chats || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (chatId: string) => {
    try {
      const chatData = await chatService.getChat(chatId);
      setSelectedChat(chatData.chat);

      const messagesData = await chatService.getMessages(chatId);
      setMessages(messagesData.messages || []);

      // Mark as read
      await chatService.markAsRead(chatId);

      // Scroll to bottom
      scrollToBottom();
    } catch (err) {
      console.error('Error opening chat:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      const messageData = await chatService.sendMessage(selectedChat._id, newMessage);

      // Add message to UI
      setMessages(prev => [...prev, messageData.message]);
      setNewMessage('');

      // Update chat list
      await fetchChats();

      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p: any) => p._id !== user?._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat List */}
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r bg-white`}>
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          {chats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start messaging team members!</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = getOtherParticipant(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedChat?._id === chat._id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold">
                      {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              {(() => {
                const otherUser = getOtherParticipant(selectedChat);
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold">
                      {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{otherUser?.university}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, idx) => {
                const isOwnMessage = typeof message.sender === 'string'
                  ? message.sender === user?._id
                  : message.sender._id === user?._id;

                return (
                  <div
                    key={message._id || idx}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-orange-100' : 'text-gray-500'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
```

**File 3**: Update `MagicPatternsCode/Front End/src/App.tsx`

Make sure ChatPage route is included:
```typescript
<Route path="/dashboard/chat" element={<ChatPage />} />
```

---

### 2.2 Message Modals Integration

**Problem**: "Message" buttons in ProjectDetailsPage don't do anything
**Solution**: Create chat and redirect to ChatPage

#### Step-by-Step Execution:

**File**: `MagicPatternsCode/Front End/src/pages/ProjectDetailsPage.tsx`

1. **Import chatService**:
```typescript
import { chatService } from '../services/chatService';
```

2. **Update handleMessageMember function**:
```typescript
const handleMessageMember = async (userId: string) => {
  if (!user) {
    navigate('/login');
    return;
  }

  try {
    // Create or get existing chat
    const chatData = await chatService.createOrGetChat(userId);

    // Navigate to chat page with this chat opened
    navigate(`/dashboard/chat?chat=${chatData.chat._id}`);
  } catch (err) {
    console.error('Error creating chat:', err);
    alert('Failed to start conversation');
  }
};
```

3. **Update message button in team table** (find the message button):
```typescript
<button
  onClick={() => handleMessageMember(member.user._id)}
  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  title="Message"
>
  <MessageCircle className="h-5 w-5" />
</button>
```

---

## 🎯 Phase 3: Invitation System

**Priority**: ⭐⭐⭐⭐ HIGH
**Estimated Time**: 2-3 days

### 3.1 Create Invitation Backend

#### Step-by-Step Execution:

**File 1**: Create `backend/src/models/Invitation.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  role: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    message: {
      type: String,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

// Index to prevent duplicate invitations
invitationSchema.index({ from: 1, to: 1, project: 1, role: 1 }, { unique: true });

const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);

export default Invitation;
```

**File 2**: Create `backend/src/routes/invitationRoutes.ts`

```typescript
import express from 'express';
import {
  createInvitation,
  getInvitations,
  getInvitationById,
  acceptInvitation,
  declineInvitation,
  getSentInvitations
} from '../controllers/invitationController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createInvitation);
router.get('/', getInvitations); // Received invitations
router.get('/sent', getSentInvitations); // Sent invitations
router.get('/:id', getInvitationById);
router.put('/:id/accept', acceptInvitation);
router.put('/:id/decline', declineInvitation);

export default router;
```

**File 3**: Create `backend/src/controllers/invitationController.ts`

```typescript
import { Request, Response } from 'express';
import Invitation from '../models/Invitation';
import Project from '../models/Project';
import User from '../models/User';

// Create invitation
export const createInvitation = async (req: Request, res: Response) => {
  try {
    const { to, project, role, message } = req.body;
    const from = req.user._id;

    // Validate project exists and user is creator
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectDoc.creator.toString() !== from.toString()) {
      return res.status(403).json({ message: 'Only project creator can send invitations' });
    }

    // Validate recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      from,
      to,
      project,
      role,
      status: 'Pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent for this role' });
    }

    // Create invitation
    const invitation = await Invitation.create({
      from,
      to,
      project,
      role,
      message
    });

    // Populate for response
    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate('from', 'firstName lastName university')
      .populate('to', 'firstName lastName university')
      .populate('project', 'title description');

    // TODO: Create notification for recipient

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: populatedInvitation
    });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Invitation already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Get received invitations
export const getInvitations = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const status = req.query.status as string;

    const query: any = { to: userId };
    if (status) {
      query.status = status;
    }

    const invitations = await Invitation.find(query)
      .populate('from', 'firstName lastName university profilePicture')
      .populate('project', 'title description category')
      .sort({ createdAt: -1 });

    res.json({
      invitations,
      count: invitations.length
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sent invitations
export const getSentInvitations = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const invitations = await Invitation.find({ from: userId })
      .populate('to', 'firstName lastName university profilePicture')
      .populate('project', 'title description category')
      .sort({ createdAt: -1 });

    res.json({
      invitations,
      count: invitations.length
    });
  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get invitation by ID
export const getInvitationById = async (req: Request, res: Response) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('from', 'firstName lastName university')
      .populate('to', 'firstName lastName university')
      .populate('project');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if user is involved in invitation
    if (
      invitation.from.toString() !== req.user._id.toString() &&
      invitation.to.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ invitation });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if user is the recipient
    if (invitation.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (invitation.status !== 'Pending') {
      return res.status(400).json({ message: 'Invitation already responded to' });
    }

    // Update invitation status
    invitation.status = 'Accepted';
    await invitation.save();

    // Add user to project role
    const project = await Project.findById(invitation.project);
    if (project) {
      const roleIndex = project.roles.findIndex(
        r => r.title === invitation.role && !r.filled
      );

      if (roleIndex !== -1) {
        project.roles[roleIndex].user = req.user._id;
        project.roles[roleIndex].filled = true;
        await project.save();
      }
    }

    // TODO: Create notification for sender

    res.json({
      message: 'Invitation accepted',
      invitation
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Decline invitation
export const declineInvitation = async (req: Request, res: Response) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if user is the recipient
    if (invitation.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (invitation.status !== 'Pending') {
      return res.status(400).json({ message: 'Invitation already responded to' });
    }

    // Update invitation status
    invitation.status = 'Declined';
    await invitation.save();

    // TODO: Create notification for sender

    res.json({
      message: 'Invitation declined',
      invitation
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**File 4**: Update `backend/src/server.ts`

Add invitation routes:
```typescript
import invitationRoutes from './routes/invitationRoutes';

// Add with other routes:
app.use('/api/invitations', invitationRoutes);
```

---

### 3.2 Connect Invite to Project Modal

**File**: `MagicPatternsCode/Front End/src/components/discover/InviteToProjectModal.tsx`

Update the component to connect to backend:

```typescript
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../utils/apiClient';

interface InviteToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  onSuccess?: () => void;
}

const InviteToProjectModal: React.FC<InviteToProjectModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p._id === selectedProject);
      if (project) {
        // Get unfilled roles
        const openRoles = project.roles.filter((r: any) => !r.filled);
        setAvailableRoles(openRoles);
        setSelectedRole(openRoles[0]?._id || '');
      }
    }
  }, [selectedProject, projects]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects/my-projects');
      setProjects(response.data.projects || []);

      if (response.data.projects.length > 0) {
        setSelectedProject(response.data.projects[0]._id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !selectedRole) {
      alert('Please select a project and role');
      return;
    }

    try {
      setSending(true);

      const selectedRoleObj = availableRoles.find(r => r._id === selectedRole);

      await api.post('/invitations', {
        to: user._id,
        project: selectedProject,
        role: selectedRoleObj.title,
        message
      });

      alert(`Invitation sent to ${user.firstName} ${user.lastName}!`);
      onSuccess?.();
      onClose();

      // Reset form
      setMessage('');
      setSelectedRole('');
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      alert(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Invite {user.firstName} to Project
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You don't have any projects yet.</p>
            <p className="text-sm mt-2">Create a project first to invite collaborators!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Role</label>
              {availableRoles.length === 0 ? (
                <p className="text-sm text-gray-500">No open roles in this project</p>
              ) : (
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {availableRoles.map(role => (
                    <option key={role._id} value={role._id}>
                      {role.title} - {role.description}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || availableRoles.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteToProjectModal;
```

---

### 3.3 Create Invitations Page

**File**: Create `MagicPatternsCode/Front End/src/pages/InvitationsPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Invitation {
  _id: string;
  from: any;
  project: any;
  role: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: Date;
}

const InvitationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    fetchInvitations();
  }, [activeTab]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'received' ? '/invitations' : '/invitations/sent';
      const response = await api.get(endpoint);
      setInvitations(response.data.invitations || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      await api.put(`/invitations/${invitationId}/accept`);
      alert('Invitation accepted! You are now part of the team.');
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (invitationId: string) => {
    if (!confirm('Are you sure you want to decline this invitation?')) return;

    try {
      await api.put(`/invitations/${invitationId}/decline`);
      alert('Invitation declined.');
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to decline invitation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Invitations</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'received'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Received
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'sent'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Sent
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mail className="mx-auto h-12 w-12 mb-4 text-gray-400" />
          <p>No {activeTab} invitations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map(invitation => (
            <div key={invitation._id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(invitation.status)}
                    <h3 className="text-xl font-bold">
                      {invitation.project.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-2">
                    {activeTab === 'received' ? (
                      <>
                        <span className="font-medium">
                          {invitation.from.firstName} {invitation.from.lastName}
                        </span>
                        {' '}invited you to join as{' '}
                        <span className="font-medium">{invitation.role}</span>
                      </>
                    ) : (
                      <>
                        You invited{' '}
                        <span className="font-medium">
                          {invitation.to?.firstName} {invitation.to?.lastName}
                        </span>
                        {' '}to join as{' '}
                        <span className="font-medium">{invitation.role}</span>
                      </>
                    )}
                  </p>

                  {invitation.message && (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">
                      "{invitation.message}"
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    {new Date(invitation.createdAt).toLocaleDateString()} at{' '}
                    {new Date(invitation.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/project/${invitation.project._id}`)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    View Project
                  </button>

                  {activeTab === 'received' && invitation.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(invitation._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(invitation._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {invitation.status !== 'Pending' && (
                    <span className={`px-3 py-1 rounded-full text-sm text-center ${
                      invitation.status === 'Accepted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {invitation.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
```

**Add route in** `App.tsx`:
```typescript
<Route path="/invitations" element={<InvitationsPage />} />
```

**Add to Navigation** in `Navigation.tsx`:
```typescript
<Link
  to="/invitations"
  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
>
  <Mail className="h-5 w-5" />
  <span>Invitations</span>
</Link>
```

---

## 🎯 Phase 4: Notification System

**Priority**: ⭐⭐⭐ MEDIUM
**Estimated Time**: 3-4 days

### 4.1 Create Notification Backend

**File 1**: Create `backend/src/models/Notification.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'application_received' | 'application_accepted' | 'application_rejected' |
        'invitation_received' | 'invitation_accepted' | 'invitation_declined' |
        'message_received' | 'project_update' | 'role_filled';
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: 'Project' | 'Application' | 'Invitation' | 'Chat';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'application_received',
        'application_accepted',
        'application_rejected',
        'invitation_received',
        'invitation_accepted',
        'invitation_declined',
        'message_received',
        'project_update',
        'role_filled'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedModel'
    },
    relatedModel: {
      type: String,
      enum: ['Project', 'Application', 'Invitation', 'Chat']
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    actionUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
```

**File 2**: Create `backend/src/routes/notificationRoutes.ts`

```typescript
import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
```

**File 3**: Create `backend/src/controllers/notificationController.ts`

```typescript
import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Get user's notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit as string) || 50;
    const unreadOnly = req.query.unreadOnly === 'true';

    const query: any = { user: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**File 4**: Create `backend/src/utils/notificationHelper.ts`

```typescript
import Notification from '../models/Notification';

export const createNotification = async ({
  user,
  type,
  title,
  message,
  relatedId,
  relatedModel,
  actionUrl
}: {
  user: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  actionUrl?: string;
}) => {
  try {
    await Notification.create({
      user,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      actionUrl
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
```

**File 5**: Update `backend/src/server.ts`

```typescript
import notificationRoutes from './routes/notificationRoutes';

app.use('/api/notifications', notificationRoutes);
```

---

### 4.2 Trigger Notifications on Events

**File**: `backend/src/controllers/projectController.ts`

Update `applyToProject` function:

```typescript
import { createNotification } from '../utils/notificationHelper';

// In applyToProject function, add after creating application:
// Notify project creator
await createNotification({
  user: project.creator.toString(),
  type: 'application_received',
  title: 'New Application Received',
  message: `${req.user.firstName} ${req.user.lastName} applied for ${role} in ${project.title}`,
  relatedId: application._id,
  relatedModel: 'Application',
  actionUrl: `/project/${project._id}/manage-team`
});
```

Update `updateApplicationStatus` function:

```typescript
// After updating application status, add:
if (status === 'Accepted') {
  await createNotification({
    user: application.user.toString(),
    type: 'application_accepted',
    title: 'Application Accepted!',
    message: `Your application for ${application.role} in ${project.title} was accepted!`,
    relatedId: project._id,
    relatedModel: 'Project',
    actionUrl: `/project/${project._id}`
  });
} else if (status === 'Rejected') {
  await createNotification({
    user: application.user.toString(),
    type: 'application_rejected',
    title: 'Application Update',
    message: `Your application for ${application.role} in ${project.title} was not accepted this time.`,
    relatedId: project._id,
    relatedModel: 'Project',
    actionUrl: `/dashboard`
  });
}
```

**File**: `backend/src/controllers/invitationController.ts`

Update invitation functions to add notifications (already have TODO comments).

---

### 4.3 Connect Notification UI

**File 1**: `MagicPatternsCode/Front End/src/components/notifications/NotificationDropdown.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { api } from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=20');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, actionUrl?: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate if there's an action URL
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleMarkAsRead(notification._id, notification.actionUrl)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
```

**File 2**: `MagicPatternsCode/Front End/src/pages/Dashboard.tsx`

Update to use real notification component:

```typescript
// Remove this line:
const [unreadCount] = useState(2);

// Replace bell icon section with:
<NotificationDropdown />
```

Make sure NotificationDropdown is imported:
```typescript
import NotificationDropdown from '../components/notifications/NotificationDropdown';
```

---

## 🎯 Phase 5: Search & Filter Improvements

**Priority**: ⭐⭐⭐ MEDIUM
**Estimated Time**: 2 days

### 5.1 Home Page Search Implementation

**File 1**: `MagicPatternsCode/Front End/src/components/dashboard/HomePage.tsx`

Update to use backend filtering:

```typescript
const fetchProjects = async () => {
  try {
    setLoading(true);

    // Build query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory !== 'All Projects') params.append('category', selectedCategory);

    // Map sortBy to backend parameter
    const sortMap: Record<string, string> = {
      'Most Recent': '-createdAt',
      'Most Recommended': 'recommended', // Backend needs to implement this
      'Short Duration': 'duration',
      'Long Duration': '-duration',
      'Deadline Soon': 'deadline'
    };
    if (sortBy) params.append('sort', sortMap[sortBy] || '-createdAt');

    const response = await api.get(`/projects?${params.toString()}`);
    setProjects(response.data.projects || []);
  } catch (err) {
    console.error('Error fetching projects:', err);
  } finally {
    setLoading(false);
  }
};

// Debounce search
const debouncedFetchProjects = useMemo(
  () => debounce(fetchProjects, 500),
  [searchQuery, selectedCategory, sortBy]
);

useEffect(() => {
  debouncedFetchProjects();
  return () => debouncedFetchProjects.cancel();
}, [searchQuery, selectedCategory, sortBy]);
```

**File 2**: `backend/src/controllers/projectController.ts`

Update `getAllProjects` to support more query parameters:

```typescript
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      status,
      sort = '-createdAt',
      limit = 50,
      page = 1
    } = req.query;

    // Build query
    const query: any = {};

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Category filter
    if (category && category !== 'All Projects') {
      query.category = category;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Execute query
    const projects = await Project.find(query)
      .populate('creator', 'firstName lastName university')
      .sort(sort as string)
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      total,
      page: parseInt(page as string),
      pages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

---

## 🎯 Phase 6: UI/UX Improvements

**Priority**: ⭐⭐⭐ MEDIUM
**Estimated Time**: 2-3 days

### 6.1 Make Project Cards Fully Clickable

**File**: `MagicPatternsCode/Front End/src/components/dashboard/ProjectCard.tsx`

```typescript
import { useNavigate } from 'react-router-dom';

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/project/${project._id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent card click
    action();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Content */}

      {/* Any action buttons should stop propagation */}
      <button
        onClick={(e) => handleActionClick(e, () => handleBookmark(project._id))}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <Bookmark className="h-5 w-5" />
      </button>
    </div>
  );
};
```

---

### 6.2 Universal Sidebar Menu Structure

**File**: `MagicPatternsCode/Front End/src/components/Navigation.tsx`

Update to include all necessary links and sign out:

```typescript
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FolderOpen, User, MessageCircle, Mail, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/discover', icon: Users, label: 'Discover People' },
    { path: '/my-projects', icon: FolderOpen, label: 'My Projects' },
    { path: '/invitations', icon: Mail, label: 'Invitations' },
    { path: '/dashboard/chat', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: User, label: 'My Profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-orange-500 to-red-500 text-white z-50 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold">MatchBox</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-white text-orange-500 font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/10 mt-4 border-t border-white/20 pt-6"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <p className="text-xs text-white/70 text-center">
            © 2025 MatchBox
          </p>
        </div>
      </div>
    </>
  );
};

export default Navigation;
```

Use this component consistently across all pages by including it in the Dashboard layout.

---

## 🎯 Phase 7: Data Consistency & State Management

**Priority**: ⭐⭐⭐⭐ HIGH
**Estimated Time**: 2 days

### 7.1 Saved Projects Backend Sync

**File 1**: `backend/src/models/User.ts`

Add savedProjects field:

```typescript
savedProjects: [{
  type: Schema.Types.ObjectId,
  ref: 'Project'
}]
```

**File 2**: `backend/src/routes/userRoutes.ts`

Add routes:

```typescript
router.post('/:id/saved-projects/:projectId', protect, saveProject);
router.delete('/:id/saved-projects/:projectId', protect, unsaveProject);
router.get('/:id/saved-projects', protect, getSavedProjects);
```

**File 3**: `backend/src/controllers/userController.ts`

Add functions:

```typescript
export const saveProject = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const projectId = req.params.projectId;

    // Verify user
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already saved
    if (user.savedProjects.includes(projectId as any)) {
      return res.status(400).json({ message: 'Project already saved' });
    }

    user.savedProjects.push(projectId as any);
    await user.save();

    res.json({ message: 'Project saved', savedProjects: user.savedProjects });
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unsaveProject = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const projectId = req.params.projectId;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedProjects = user.savedProjects.filter(
      (id: any) => id.toString() !== projectId
    );
    await user.save();

    res.json({ message: 'Project unsaved', savedProjects: user.savedProjects });
  } catch (error) {
    console.error('Error unsaving project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSavedProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).populate({
      path: 'savedProjects',
      populate: { path: 'creator', select: 'firstName lastName university' }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ projects: user.savedProjects });
  } catch (error) {
    console.error('Error fetching saved projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**File 4**: `MagicPatternsCode/Front End/src/pages/ProjectDetailsPage.tsx`

Replace localStorage saved projects with backend:

```typescript
// Remove localStorage logic
// Add:
const [isSaved, setIsSaved] = useState(false);

const checkIfSaved = async () => {
  if (!user) return;

  try {
    const response = await api.get(`/users/${user._id}/saved-projects`);
    const savedIds = response.data.projects.map((p: any) => p._id);
    setIsSaved(savedIds.includes(id));
  } catch (err) {
    console.error('Error checking saved status:', err);
  }
};

useEffect(() => {
  if (user) {
    checkIfSaved();
  }
}, [user, id]);

const handleSaveProject = async () => {
  if (!user) {
    navigate('/login');
    return;
  }

  try {
    if (isSaved) {
      await api.delete(`/users/${user._id}/saved-projects/${id}`);
      setIsSaved(false);
    } else {
      await api.post(`/users/${user._id}/saved-projects/${id}`);
      setIsSaved(true);
    }
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to save project');
  }
};
```

**File 5**: `MagicPatternsCode/Front End/src/pages/MyProjects.tsx`

Update Saved tab to fetch from backend:

```typescript
const fetchSavedProjects = async () => {
  if (!user) return;

  try {
    setLoadingSaved(true);
    const response = await api.get(`/users/${user._id}/saved-projects`);
    setSavedProjects(response.data.projects || []);
  } catch (err) {
    console.error('Error fetching saved projects:', err);
  } finally {
    setLoadingSaved(false);
  }
};

useEffect(() => {
  if (activeTab === 'saved' && user) {
    fetchSavedProjects();
  }
}, [activeTab, user]);
```

---

## 🎯 Phase 8: Complete User Journey Flows

**Priority**: ⭐⭐⭐⭐⭐ CRITICAL
**Estimated Time**: 2-3 days

This phase involves testing and ensuring all the user journeys work end-to-end after implementing the previous phases.

### 8.1 New User Onboarding Flow

**Create onboarding tour component** (Optional enhancement):

**File**: Create `MagicPatternsCode/Front End/src/components/OnboardingTour.tsx`

```typescript
import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface Step {
  target: string;
  title: string;
  content: string;
}

const steps: Step[] = [
  {
    target: 'home',
    title: 'Welcome to MatchBox!',
    content: 'Discover projects, connect with teammates, and bring your ideas to life.'
  },
  {
    target: 'new-project',
    title: 'Create a Project',
    content: 'Click here to create your own project and find collaborators.'
  },
  {
    target: 'discover',
    title: 'Discover People',
    content: 'Find skilled teammates based on their expertise and interests.'
  },
  {
    target: 'profile',
    title: 'Your Profile',
    content: 'Keep your profile updated to get better matches and invitations.'
  }
];

const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{steps[currentStep].title}</h3>
            <p className="text-gray-600">{steps[currentStep].content}</p>
          </div>
          <button onClick={handleSkip} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 flex items-center gap-2"
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
```

Add to Dashboard for first-time users:

```typescript
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  if (user && !user.onboardingCompleted) {
    setShowOnboarding(true);
  }
}, [user]);

const handleOnboardingComplete = async () => {
  setShowOnboarding(false);
  // Mark as completed in backend
  try {
    await api.put(`/users/${user._id}`, { onboardingCompleted: true });
  } catch (err) {
    console.error('Error updating onboarding status:', err);
  }
};
```

---

### 8.2-8.6 User Journey Testing

For each journey (Project Creator, Applicant, Networking, Communication, Profile), create a comprehensive test checklist:

**Create test document**: `TESTING_CHECKLIST.md`

```markdown
# User Journey Testing Checklist

## Project Creator Journey
- [ ] Can create new project
- [ ] Project appears on homepage with NEW badge
- [ ] Project appears in My Projects > Posted
- [ ] Can receive applications
- [ ] Get notification when application received
- [ ] Can view applicants in Manage Team
- [ ] Can accept/reject applications
- [ ] Accepted users appear in team
- [ ] Can message team members
- [ ] Can update project status
- [ ] Can mark project as completed

## Project Applicant Journey
- [ ] Can browse projects on homepage
- [ ] Can search and filter projects
- [ ] Can view project details
- [ ] Can apply to multiple roles
- [ ] Get confirmation after applying
- [ ] Application status shows "Applied"
- [ ] Get notification when accepted/rejected
- [ ] Accepted project appears in Projects Joined
- [ ] Can view team in project details
- [ ] Can message team members
- [ ] Project appears on profile page

## Networking Journey
- [ ] Can navigate to Discover People
- [ ] Real users are displayed (not mock data)
- [ ] Can search users by name, skills, major
- [ ] Can filter by school, major, grad year, availability
- [ ] Can click Invite to Project
- [ ] Can select project and role
- [ ] Invitation is sent
- [ ] Recipient gets notification
- [ ] Recipient can view invitation
- [ ] Recipient can accept/decline
- [ ] Accepted invitation adds user to team

## Communication Journey
- [ ] Can click Message on team member
- [ ] Chat conversation is created
- [ ] Navigate to Chat page
- [ ] Can see conversation list
- [ ] Can send messages
- [ ] Can receive messages
- [ ] Messages appear in real-time (or on refresh)
- [ ] Get notification on new message
- [ ] Can mark messages as read

## Profile Management Journey
- [ ] Profile shows all signup data
- [ ] Can edit profile
- [ ] Changes save to database
- [ ] Changes reflect across all pages
- [ ] Projects tab shows created projects
- [ ] Projects tab shows joined projects
- [ ] Can click project to view details
- [ ] Profile visible to other users (in discovery)

## Data Consistency
- [ ] Created project appears in: Homepage, My Projects, Profile
- [ ] Joined project appears in: My Projects (Joined tab), Profile
- [ ] Saved project syncs across devices
- [ ] Application status consistent across pages
- [ ] User profile updates reflect everywhere
- [ ] Notification count accurate
```

---

## 🎯 Phase 9: Testing & Validation

**Priority**: ⭐⭐⭐⭐ HIGH
**Estimated Time**: 2-3 days

### 9.1 Button & Interaction Testing

Create a systematic testing approach:

1. **Navigation Testing**:
   - Test all sidebar links
   - Test all header buttons
   - Test breadcrumb navigation
   - Test back buttons

2. **Form Testing**:
   - Test all form submissions
   - Test validation errors
   - Test required fields
   - Test field limits (character counts)

3. **Modal Testing**:
   - Test all modal open/close
   - Test modal overlay clicks
   - Test escape key to close
   - Test form submissions in modals

4. **Action Button Testing**:
   - Create Project
   - Apply to Project
   - Accept/Reject applications
   - Send Message
   - Invite to Project
   - Save Project
   - Edit Project
   - Delete Project
   - Sign Out

### 9.2 Error Handling Testing

Test error scenarios:

1. **Network Errors**:
   - Disconnect internet
   - Verify error messages display
   - Verify retry mechanisms

2. **Invalid Data**:
   - Submit empty forms
   - Submit invalid email formats
   - Submit passwords that don't match
   - Upload invalid files

3. **Permission Errors**:
   - Try to edit someone else's project
   - Try to access protected routes without login
   - Try to delete projects you don't own

### 9.3 Cross-Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Check:
- Layout consistency
- Functionality works
- Animations smooth
- Forms submit correctly

---

## 🎯 Phase 10: Polish & Enhancements

**Priority**: ⭐⭐ LOW
**Estimated Time**: 2-3 days

### 10.1 Add Toast Notifications

**File**: Create `MagicPatternsCode/Front End/src/components/shared/Toast.tsx`

```typescript
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-lg animate-slideIn`}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:bg-black/5 p-1 rounded">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
```

Create a toast context for easy usage:

**File**: Create `MagicPatternsCode/Front End/src/context/ToastContext.tsx`

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../components/shared/Toast';

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: number; type: 'success' | 'error' | 'info'; message: string }>>([]);
  let nextId = 0;

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
```

Usage:
```typescript
const { showToast } = useToast();

// Success
showToast('success', 'Project created successfully!');

// Error
showToast('error', 'Failed to save project');

// Info
showToast('info', 'Please complete your profile');
```

---

## 📅 Implementation Timeline

### Sprint 1: Critical Foundation (Week 1)
**Days 1-2**:
- Connect Discover People to backend
- Remove mock data, implement real user search

**Days 3-5**:
- Implement complete application system
- Connect apply, view applicants, accept/reject
- Update ManageTeamPage

**Days 6-7**:
- Add Projects Joined endpoint
- Fix Profile projects display
- Test data flows

### Sprint 2: Communication (Week 2)
**Days 1-3**:
- Implement chat service
- Connect ChatPage to backend
- Test messaging flow

**Days 4-5**:
- Create invitation backend (models, routes, controllers)
- Connect InviteToProjectModal

**Days 6-7**:
- Create InvitationsPage
- Test invitation flow end-to-end

### Sprint 3: Notifications & Search (Week 3)
**Days 1-3**:
- Create notification backend
- Trigger notifications on events
- Connect NotificationDropdown

**Days 4-5**:
- Implement search improvements
- Add debouncing and loading states

**Days 6-7**:
- Test notification delivery
- Test search functionality

### Sprint 4: UI/UX & State (Week 4)
**Days 1-2**:
- Make project cards fully clickable
- Create universal sidebar

**Days 3-5**:
- Implement saved projects backend sync
- Remove localStorage dependencies
- Test data consistency

**Days 6-7**:
- Add loading states and skeletons
- Improve button interactions

### Sprint 5: User Journeys (Week 5)
**Days 1-7**:
- Test all user journeys end-to-end
- Fix bugs discovered during testing
- Add onboarding tour (optional)
- Create public user profile pages

### Sprint 6: Testing & Polish (Week 6)
**Days 1-3**:
- Comprehensive button testing
- Error handling testing
- Cross-browser testing

**Days 4-7**:
- Add toast notifications
- Performance optimization
- Accessibility improvements
- Final polish

---

## ✅ Success Criteria

### Functional Requirements
- [x] All pages connected to backend (no mock data)
- [x] Users can discover real people
- [x] Application system fully functional
- [x] Messaging works between users
- [x] Invitation system operational
- [x] Notifications delivered for all key events
- [x] Search works efficiently on projects and users
- [x] Data consistent across all pages
- [x] No localStorage for user data

### User Experience
- [x] All buttons functional and responsive
- [x] Loading states for async operations
- [x] Error messages clear and helpful
- [x] Navigation intuitive with universal sidebar
- [x] Project cards fully clickable
- [x] Forms validate properly
- [x] Success feedback for actions

### Technical Quality
- [x] No console errors in production
- [x] Backend APIs properly secured with auth
- [x] Database queries optimized
- [x] Code follows consistent patterns
- [x] Components reusable
- [x] TypeScript types defined

### User Journeys
- [x] New user can sign up and complete profile
- [x] User can create project and receive applications
- [x] User can apply to projects and get accepted
- [x] User can discover people and invite to projects
- [x] User can message team members
- [x] User receives notifications for important events
- [x] Profile updates reflect across entire app
- [x] Projects user is part of visible in multiple places

---

## 🚀 Getting Started

### How to Execute This Plan

1. **Review the entire plan first**
   - Understand all phases
   - Identify dependencies between tasks

2. **Set up your development environment**
   - Ensure backend server runs: `cd backend && npm run dev`
   - Ensure frontend runs: `cd "MagicPatternsCode/Front End" && npm run dev`
   - MongoDB connected

3. **Start with Sprint 1, Phase 1, Task 1.1**
   - Follow step-by-step instructions
   - Test each change before moving to next
   - Commit frequently with clear messages

4. **Test after each task**
   - Verify the feature works
   - Check for console errors
   - Test edge cases

5. **Move sequentially through phases**
   - Complete one phase before starting next
   - Some tasks can be done in parallel (e.g., different backend models)

6. **Use the testing checklist**
   - Test user journeys after implementing features
   - Fix bugs immediately

7. **Polish and deploy**
   - Add finishing touches
   - Prepare for production

### Troubleshooting

**If something doesn't work**:
1. Check console for errors
2. Verify backend endpoint exists
3. Verify authentication token is sent
4. Check network tab for API responses
5. Review this plan for missed steps

**Common Issues**:
- **401 errors**: Token expired or not set, re-login
- **404 errors**: Backend route not registered in server.ts
- **500 errors**: Check backend console for error details
- **Empty data**: Verify database has data, check populate() calls

---

## 📝 Notes

- This plan is comprehensive but flexible
- Adjust timeline based on your pace
- Some features can be implemented in different order
- Testing is crucial at every step
- Document any deviations from the plan
- Keep track of completed tasks

---

## 🎉 Conclusion

Follow this plan systematically, and you'll have a fully functional MatchBox platform with all user journeys working end-to-end. The estimated total time is 6-8 weeks of focused development.

Good luck with your implementation!
