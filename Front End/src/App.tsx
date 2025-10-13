import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupFlow from './pages/SignupFlow';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import { AuthProvider } from './context/AuthContext';
export function App() {
  return <AuthProvider>
      <BrowserRouter>
        <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup/*" element={<SignupFlow />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project/:id" element={<ProjectDetailsPage />} />
            <Route path="/my-projects" element={<MyProjectsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>;
}