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
  SendMessageRequest,
  CreateChatRequest,
  ErrorResponse,
} from '../types/api';

// =============================================
// API CLIENT CONFIGURATION
// =============================================

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: '/api', // Vite proxy will forward to localhost:5000
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

  // ============= AUTH ENDPOINTS =============

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/signup', data);
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

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/users/${id}`);
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

  async getMyProjects(): Promise<PaginatedResponse<Project>> {
    const response = await this.client.get<PaginatedResponse<Project>>('/projects/my-projects');
    return response.data;
  }

  async applyToProject(projectId: string, data: { roleTitle: string; message: string }): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/projects/${projectId}/apply`, data);
    return response.data;
  }

  // ============= MATCH ENDPOINTS =============

  async getMatches(userId?: string): Promise<PaginatedResponse<Match>> {
    const endpoint = userId ? `/matches/user/${userId}` : '/matches';
    const response = await this.client.get<PaginatedResponse<Match>>(endpoint);
    return response.data;
  }

  // ============= CHAT ENDPOINTS =============

  async getChats(): Promise<PaginatedResponse<Chat>> {
    const response = await this.client.get<PaginatedResponse<Chat>>('/chats');
    return response.data;
  }

  async getChatById(id: string): Promise<ApiResponse<Chat>> {
    const response = await this.client.get<ApiResponse<Chat>>(`/chats/${id}`);
    return response.data;
  }

  async createChat(data: CreateChatRequest): Promise<ApiResponse<Chat>> {
    const response = await this.client.post<ApiResponse<Chat>>('/chats', data);
    return response.data;
  }

  async sendMessage(data: SendMessageRequest): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/chats/${data.chatId}/messages`, {
      content: data.content,
    });
    return response.data;
  }

  // ============= GENERIC REQUEST METHOD =============

  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for easier imports
export default apiClient;
