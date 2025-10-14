export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  major?: string;
  year?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  projectPreferences?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
