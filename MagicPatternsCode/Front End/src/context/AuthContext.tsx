import React, { useState, createContext, useContext } from 'react';
type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  university?: string;
  major?: string;
  bio?: string;
  profilePicture?: string;
  skills?: Record<string, number>;
};
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    setUser({
      id: '123',
      email,
      firstName: '',
      lastName: '',
      preferredName: ''
    });
  };
  const signup = async (email: string) => {
    // In a real app, this would make an API call to register
    setUser({
      id: '123',
      email,
      firstName: '',
      lastName: '',
      preferredName: ''
    });
  };
  const logout = () => {
    setUser(null);
  };
  const updateUserProfile = (userData: Partial<User>) => {
    setUser(prev => prev ? {
      ...prev,
      ...userData
    } : null);
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUserProfile
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};