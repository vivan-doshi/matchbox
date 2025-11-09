import React, { useState, useEffect, createContext, useContext } from 'react';
import apiClient from '../utils/apiClient';
import type { User, SignupRequest, LoginRequest } from '../types/api';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount and fetch fresh data
  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();

      if (token) {
        try {
          // Fetch fresh user data from server
          const response = await apiClient.getMe();
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Token is invalid, clear it
          apiClient.clearToken();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data: LoginRequest = { email, password };
      const response = await apiClient.login(data);

      if (response.success && response.user) {
        // Fetch full user profile
        const userResponse = await apiClient.getMe();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (userData: SignupRequest) => {
    try {
      const response = await apiClient.signup(userData);

      if (response.success && response.user) {
        // Fetch full user profile
        const userResponse = await apiClient.getMe();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    console.log('[AuthContext] updateUserProfile called');
    console.log('[AuthContext] Current user:', user);
    console.log('[AuthContext] Update data:', userData);

    if (!user?.id) {
      console.error('[AuthContext] No user logged in');
      throw new Error('No user logged in');
    }

    try {
      console.log('[AuthContext] Calling apiClient.updateUser with ID:', user.id);
      const response = await apiClient.updateUser(user.id, userData);
      console.log('[AuthContext] API response:', response);

      if (response.success && response.data) {
        console.log('[AuthContext] Profile update successful, updating local state');
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        console.warn('[AuthContext] Response success was false or no data returned');
      }
    } catch (error: any) {
      console.error('[AuthContext] Update profile error:', error);
      console.error('[AuthContext] Error response:', error.response);
      console.error('[AuthContext] Error message:', error.message);
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      throw new Error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
