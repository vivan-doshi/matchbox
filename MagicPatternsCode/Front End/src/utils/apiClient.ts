import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  Project,
  ProjectFilters,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse,
  Match,
  Chat,
  Message,
  Application,
  Invitation,
  Notification,
  ErrorResponse,
} from '../types/api';

// =============================================
// API CLIENT CONFIGURATION
// =============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL, // Supports proxy in dev and explicit URLs elsewhere
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on init
    this.token = localStorage.getItem('token');
  }

  // ============= TOKEN MANAGEMENT =============

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private getCurrentUserId(): string {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('User not authenticated');
    }

    try {
      const parsed = JSON.parse(storedUser);
      return parsed.id || parsed._id;
    } catch {
      throw new Error('User not authenticated');
    }
  }

  // ============= AUTH ENDPOINTS =============

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    const response = await this.client.post<ApiResponse<{ exists: boolean }>>('/auth/check-email', { email });
    return response.data;
  }

  async signup(data: SignupRequest | FormData): Promise<AuthResponse> {
    // Determine if we're sending FormData or JSON
    const isFormData = data instanceof FormData;

    const response = await this.client.post<AuthResponse>('/auth/signup', data, {
      headers: isFormData ? {
        // Let browser set Content-Type with boundary for FormData
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });

    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async getMe(): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // ============= USER ENDPOINTS =============

  async getUsers(params?: Record<string, any>): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  }

  async searchUsers(params?: Record<string, any>): Promise<ApiResponse<User[]>> {
    const response = await this.client.get<ApiResponse<User[]>>('/users/search', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  }

  async updateUserProfilePicture(userId: string, file: File): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await this.client.put<ApiResponse<User>>(`/users/${userId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateUserResume(userId: string, file: File): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await this.client.put<ApiResponse<User>>(`/users/${userId}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  }

  async saveProject(projectId: string): Promise<ApiResponse> {
    const userId = this.getCurrentUserId();
    const response = await this.client.post<ApiResponse>(`/users/${userId}/saved-projects/${projectId}`);
    return response.data;
  }

  async unsaveProject(projectId: string): Promise<ApiResponse> {
    const userId = this.getCurrentUserId();
    const response = await this.client.delete<ApiResponse>(`/users/${userId}/saved-projects/${projectId}`);
    return response.data;
  }

  async getSavedProjects(): Promise<ApiResponse<Project[]>> {
    const userId = this.getCurrentUserId();
    const response = await this.client.get<ApiResponse<Project[]>>(`/users/${userId}/saved-projects`);
    return response.data;
  }

  // ============= PROJECT ENDPOINTS =============

  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const response = await this.client.get<PaginatedResponse<Project>>('/projects', {
      params: filters,
    });
    return response.data;
  }

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const response = await this.client.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await this.client.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await this.client.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/projects/${id}`);
    return response.data;
  }

  async getMyProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.client.get<ApiResponse<Project[]>>('/projects/my-projects');
    return response.data;
  }

  async getJoinedProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.client.get<ApiResponse<Project[]>>('/projects/joined');
    return response.data;
  }

  async applyToProject(projectId: string, data: { roles: string[]; message: string }): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/projects/${projectId}/apply`, data);
    return response.data;
  }

  async inviteUserToProject(
    projectId: string,
    data: { inviteeId: string; message?: string }
  ): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/projects/${projectId}/invite`, data);
    return response.data;
  }

  async getMyApplications(projectId: string): Promise<ApiResponse<Application[]>> {
    const response = await this.client.get<ApiResponse<Application[]>>(`/projects/${projectId}/my-applications`);
    return response.data;
  }

  async getProjectApplicants(projectId: string): Promise<ApiResponse> {
    const response = await this.client.get<ApiResponse>(`/projects/${projectId}/applicants`);
    return response.data;
  }

  async updateApplicationStatus(
    projectId: string,
    applicationId: string,
    status: 'Accepted' | 'Rejected',
    declineReason?: string
  ): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>(`/projects/${projectId}/applicants/${applicationId}`, {
      status,
      declineReason,
    });
    return response.data;
  }

  async removeTeamMember(projectId: string, roleId: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/projects/${projectId}/roles/${roleId}/member`);
    return response.data;
  }

  // ============= INVITATION ENDPOINTS =============

  async getReceivedInvitations(): Promise<ApiResponse<Invitation[]>> {
    const response = await this.client.get<ApiResponse<Invitation[]>>('/invitations/received');
    return response.data;
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<Invitation>> {
    const response = await this.client.put<ApiResponse<Invitation>>(`/invitations/${invitationId}/accept`);
    return response.data;
  }

  async rejectInvitation(invitationId: string, reason: string): Promise<ApiResponse<Invitation>> {
    const response = await this.client.put<ApiResponse<Invitation>>(`/invitations/${invitationId}/reject`, {
      reason,
    });
    return response.data;
  }

  // ============= MATCH ENDPOINTS =============

  async getMatches(userId?: string): Promise<PaginatedResponse<Match>> {
    const endpoint = userId ? `/matches/user/${userId}` : '/matches';
    const response = await this.client.get<PaginatedResponse<Match>>(endpoint);
    return response.data;
  }

  // ============= CHAT ENDPOINTS =============

  async getChats(params?: {
    type?: 'direct' | 'invitation' | 'application';
    status?: 'Pending' | 'Accepted' | 'Rejected';
    tab?: 'active' | 'invitations' | 'requests';
  }): Promise<ApiResponse<Chat[]>> {
    const response = await this.client.get<ApiResponse<Chat[]>>('/chats', { params });
    return response.data;
  }

  async getChatById(id: string): Promise<ApiResponse<Chat>> {
    const response = await this.client.get<ApiResponse<Chat>>(`/chats/${id}`);
    return response.data;
  }

  async createChat(userId: string): Promise<ApiResponse<Chat>> {
    const response = await this.client.post<ApiResponse<Chat>>('/chats', { userId });
    return response.data;
  }

  async getMessages(chatId: string): Promise<ApiResponse<Message[]>> {
    const response = await this.client.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`);
    return response.data;
  }

  async sendMessage(chatId: string, text: string): Promise<ApiResponse<Chat>> {
    const response = await this.client.post<ApiResponse<Chat>>(`/chats/${chatId}/messages`, { text });
    return response.data;
  }

  async markChatAsRead(chatId: string): Promise<ApiResponse<Chat>> {
    const response = await this.client.put<ApiResponse<Chat>>(`/chats/${chatId}/read`);
    return response.data;
  }

  // ============= NOTIFICATION ENDPOINTS =============

  async getNotifications(params?: { limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<Notification[]>> {
    const response = await this.client.get<ApiResponse<Notification[]>>('/notifications', {
      params,
    });
    return response.data;
  }

  async getNotificationUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await this.client.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await this.client.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>('/notifications/read-all');
    return response.data;
  }

  // ============= GENERIC REQUEST METHOD =============

  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  // ============= GENERIC HTTP METHODS =============

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for easier imports
export default apiClient;
