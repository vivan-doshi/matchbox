# 📝 Useful Code Snippets

Quick copy-paste code for common tasks

## Frontend Snippets

### 1. Login Page (`client/src/app/auth/login/page.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', data.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Login to Matchbox</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary-600 hover:text-primary-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 2. Register Page (`client/src/app/auth/register/page.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', data.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Join Matchbox</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 3. Auth Context (`client/src/contexts/AuthContext.tsx`)

```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 4. Protected Route HOC (`client/src/components/ProtectedRoute.tsx`)

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

## Backend Snippets

### 5. User Controller (`server/src/controllers/user.controller.ts`)

```typescript
import { Response } from 'express';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, major, year, skills, interests, projectPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, bio, major, year, skills, interests, projectPreferences },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=searchTerm
// @access  Private
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { skills: { $in: [new RegExp(searchTerm, 'i')] } },
        { interests: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    }).select('-password').limit(20);

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### 6. Match Model (`server/src/models/Match.model.ts`)

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  user1: mongoose.Types.ObjectId;
  user2: mongoose.Types.ObjectId;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  initiatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate matches
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default mongoose.model<IMatch>('Match', matchSchema);
```

### 7. Simple Matching Algorithm (`server/src/utils/matchingAlgorithm.ts`)

```typescript
import { IUser } from '../models/User.model';

export function calculateMatchScore(user1: IUser, user2: IUser): number {
  let score = 0;

  // Common skills (40%)
  const commonSkills = user1.skills.filter(skill => 
    user2.skills.includes(skill)
  );
  const skillScore = (commonSkills.length / Math.max(user1.skills.length, user2.skills.length, 1)) * 40;

  // Common interests (30%)
  const commonInterests = user1.interests.filter(interest => 
    user2.interests.includes(interest)
  );
  const interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length, 1)) * 30;

  // Same year (20%)
  const yearScore = user1.year === user2.year ? 20 : 0;

  // Same major (10%)
  const majorScore = user1.major === user2.major ? 10 : 0;

  score = skillScore + interestScore + yearScore + majorScore;

  return Math.round(score);
}

export function findBestMatches(currentUser: IUser, allUsers: IUser[], limit: number = 10): Array<{ user: IUser, score: number }> {
  const matches = allUsers
    .filter(user => user._id.toString() !== currentUser._id.toString())
    .map(user => ({
      user,
      score: calculateMatchScore(currentUser, user)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}
```

## Git Commands for Team

```bash
# Clone repository
git clone <repo-url>
cd matchbox

# Create feature branch
git checkout -b feature/login-page

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add login page"

# Push to remote
git push origin feature/login-page

# Pull latest changes
git pull origin main

# Merge main into your branch
git checkout main
git pull
git checkout feature/login-page
git merge main
```

## Package Installation Commands

```bash
# Add a new package to server
cd server
npm install package-name

# Add a new package to client
cd client
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Common packages you might need
npm install socket.io              # Real-time chat
npm install cloudinary             # Image uploads
npm install nodemailer             # Emails
npm install express-rate-limit     # Rate limiting
npm install joi                    # Alternative validation
```

## Deployment Commands

```bash
# Build for production
cd server
npm run build

cd ../client
npm run build

# Test production build locally
npm run start
```

These snippets will save you hours of development time! 🚀
