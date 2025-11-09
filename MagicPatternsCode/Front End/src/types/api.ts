// =============================================
// SHARED API TYPES - Backend & Frontend
// =============================================

// ============= COMMON TYPES =============
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============= USER TYPES =============
export interface UserSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert';
}

export interface ProfessionalLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  university: string;
  major: string;
  graduationYear?: number;
  isAlumni: boolean;
  bio?: string;
  profilePicture?: string;
  skills: UserSkill[];
  professionalLinks: ProfessionalLinks;
  interests: string[];
  weeklyAvailability?: {
    hoursPerWeek: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  // Extended profile with additional computed fields
}

// ============= AUTH TYPES =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  university: string;
  major: string;
  graduationYear?: number;
  isAlumni?: boolean;
  bio?: string;
  skills?: UserSkill[];
  professionalLinks?: ProfessionalLinks;
  interests?: string[];
  weeklyAvailability?: {
    hoursPerWeek: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredName?: string;
    university: string;
    major: string;
    profilePicture?: string;
  };
}

export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

// ============= PROJECT TYPES =============
export interface ProjectRole {
  title: string;
  description: string;
  filled: boolean;
  user?: string; // User ID
}

export interface CreatorRole {
  title: string;
  responsibilities?: string;
  expertise?: string;
}

export interface TeamMember {
  name: string;
  profileLink?: string;
  role: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creator: string | User; // Can be populated
  category: string;
  tags?: string[];
  timeCommitment?: string;
  duration?: number;
  status: 'Planning' | 'In Progress' | 'Completed';
  roles: ProjectRole[];
  creatorRole?: CreatorRole;
  existingMembers?: TeamMember[];
  startDate?: string;
  deadline?: string;
  githubRepo?: string;
  mediumArticle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  timeCommitment?: string;
  duration?: number;
  roles: Omit<ProjectRole, 'filled' | 'user'>[];
  creatorRole?: CreatorRole;
  existingMembers?: TeamMember[];
  startDate?: string;
  deadline?: string;
  githubRepo?: string;
  mediumArticle?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: 'Planning' | 'In Progress' | 'Completed';
}

export interface ProjectFilters extends PaginationParams {
  status?: 'Planning' | 'In Progress' | 'Completed';
  category?: string;
  tags?: string[];
  search?: string;
  creatorId?: string;
}

// ============= APPLICATION TYPES =============
export interface Application {
  id: string;
  project: string | Project;
  user: string | User;
  role: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  projectId: string;
  roleTitle: string;
  message: string;
}

// ============= MATCH TYPES =============
export interface Match {
  id: string;
  user: string | User;
  project: string | Project;
  score: number;
  reasons: string[];
  createdAt: string;
}

export interface MatchFilters extends PaginationParams {
  userId?: string;
  minScore?: number;
}

// ============= CHAT TYPES =============
export interface Message {
  sender: string | User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: (string | User)[];
  messages: Message[];
  project?: string | Project;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
}

export interface CreateChatRequest {
  participantIds: string[];
  projectId?: string;
}

// ============= ERROR TYPES =============
export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode?: number;
}

// ============= API ENDPOINTS =============
export const API_ENDPOINTS = {
  // Auth
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_PROFILE: (id: string) => `/api/users/${id}/profile`,

  // Projects
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
  PROJECT_APPLY: (id: string) => `/api/projects/${id}/apply`,
  MY_PROJECTS: '/api/projects/my-projects',

  // Matches
  MATCHES: '/api/matches',
  USER_MATCHES: (userId: string) => `/api/matches/user/${userId}`,

  // Chats
  CHATS: '/api/chats',
  CHAT_BY_ID: (id: string) => `/api/chats/${id}`,
  CHAT_MESSAGES: (id: string) => `/api/chats/${id}/messages`,
} as const;
