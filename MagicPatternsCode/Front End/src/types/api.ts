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

export interface UserResume {
  filename?: string;
  url?: string;
  dataUrl?: string; // Deprecated - kept for backward compatibility
  publicId?: string;
  uploadedAt?: string;
}

export interface ProfilePicture {
  url: string;
  publicId?: string;
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
  profilePicture?: ProfilePicture | string; // Support both old (string) and new (object) formats
  resume?: UserResume;
  skills: UserSkill[];
  professionalLinks: ProfessionalLinks;
  interests: string[];
  weeklyAvailability?: {
    hoursPerWeek: number;
  };
  savedProjects?: Array<string | Project>;
  // Email Verification
  emailVerified: boolean;
  // USC ID Verification for Competitions
  uscId?: string;
  uscIdVerified: boolean;
  uscIdVerifiedAt?: string;
  // Competition Participation
  hostedCompetitions?: string[];
  participatedTeams?: string[];
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
  profilePicture?: File | string; // File for new uploads, string for URLs
  resume?: File | UserResume; // File for new uploads, UserResume for existing data
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
  user?: string | User; // May be populated with user object
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
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  projectId: string;
  roleTitle: string;
  message: string;
}

// ============= INVITATION TYPES =============
export interface Invitation {
  id: string;
  _id?: string;
  project: string | Project;
  inviter: string | User;
  invitee: string | User;
  role?: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
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
  _id?: string;
  sender: string | User;
  text: string;
  createdAt?: string;
  read?: boolean;
}

export interface Chat {
  id?: string;
  _id?: string;
  participants: (string | User)[];
  messages: Message[];
  project?: string | Project;
  lastMessage?: Message;
  type?: 'direct' | 'invitation' | 'application';
  relatedProject?: string | Project;
  relatedInvitation?: string | Invitation;
  relatedApplication?: string | Application;
  status?: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

// ============= NOTIFICATION TYPES =============
export interface Notification {
  id: string;
  user: string | User;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============= COMPETITION TYPES =============
export interface Milestone {
  _id: string;
  order: number;
  title: string;
  description: string;
  dueDate: string;
  weight?: number;
  isRequired: boolean;
}

export interface Competition {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: 'hackathon' | 'case-competition' | 'group-project';
  hostId: string;
  hostName: string;
  startDate: string;
  endDate: string;
  maxTeamSize: number;
  minTeamSize: number;
  maxTeams?: number;
  rules: string;
  objectives: string;
  evaluationCriteria?: string;
  prize?: string;
  milestones: Milestone[];
  status: 'draft' | 'open' | 'in-progress' | 'closed' | 'archived';
  requiresHostApproval: boolean;
  allowSelfTeams: boolean;
  registeredTeamCount: number;
  totalParticipants: number;
  averageProgress: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  isRegistrationOpen?: boolean;
  hasStarted?: boolean;
  hasEnded?: boolean;
}

export interface CreateCompetitionRequest {
  title: string;
  description: string;
  type: 'hackathon' | 'case-competition' | 'group-project';
  startDate: string;
  endDate: string;
  maxTeamSize: number;
  minTeamSize: number;
  maxTeams?: number;
  rules: string;
  objectives: string;
  evaluationCriteria?: string;
  prize?: string;
  milestones: Omit<Milestone, '_id'>[];
  requiresHostApproval?: boolean;
  allowSelfTeams?: boolean;
}

// ============= TEAM TYPES =============
export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'leader' | 'member';
  joinedAt: string;
  status: 'active' | 'inactive';
  contributionPercentage?: number;
}

export interface ProgressUpdate {
  timestamp: string;
  progressPercentage: number;
  comment: string;
  updatedBy: string;
  updatedByName: string;
}

export interface Deliverable {
  type: 'file' | 'link' | 'document';
  title: string;
  url: string;
  uploadedAt: string;
}

export interface AchievedMilestone {
  milestoneId: string;
  achievedAt: string;
  deliverables: Deliverable[];
  comment: string;
  verifiedBy?: string;
  verificationFeedback?: string;
}

export interface FinalSubmission {
  submittedAt: string;
  deliverables: Deliverable[];
  teamSummary: string;
  contributionBreakdown: {
    userId: string;
    percentage: number;
  }[];
}

export interface Team {
  id: string;
  _id?: string;
  competitionId: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMember[];
  maxMembers: number;
  status: 'forming' | 'active' | 'submitted' | 'disqualified';
  joinedCompetitionAt: string;
  currentProgress: number;
  lastProgressUpdate?: string;
  progressHistory: ProgressUpdate[];
  achievedMilestones: AchievedMilestone[];
  finalSubmission?: FinalSubmission;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isFull?: boolean;
  hasSubmitted?: boolean;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  initialMembers?: { email: string }[];
}

export interface UpdateProgressRequest {
  progressPercentage: number;
  comment: string;
}

export interface AchieveMilestoneRequest {
  comment: string;
  deliverables?: Deliverable[];
}

export interface SubmitFinalRequest {
  deliverables: Deliverable[];
  teamSummary: string;
  contributionBreakdown: {
    userId: string;
    percentage: number;
  }[];
}

export interface CompetitionStats {
  registeredTeams: number;
  totalParticipants: number;
  averageProgress: number;
  submittedTeams: number;
  milestoneAchievementRate: {
    milestoneId: string;
    achievementCount: number;
  }[];
}

export interface CompetitionDashboard {
  competition: Competition;
  stats: CompetitionStats;
  teams: Team[];
}

export interface CompetitionFilters extends PaginationParams {
  status?: string;
  type?: string;
  search?: string;
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
