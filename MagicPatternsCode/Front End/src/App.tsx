import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupFlow from './pages/SignupFlow';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import EditProjectPage from './pages/EditProjectPage';
import ManageTeamPage from './pages/ManageTeamPage';
import MyProjects from './pages/MyProjects';
import NetworkPage from './pages/NetworkPage';
import { AuthProvider } from './context/AuthContext';
import { SignupProvider } from './context/SignupContext';

export function App() {
  return <AuthProvider>
      <BrowserRouter>
        <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup/*" element={<SignupProvider><SignupFlow /></SignupProvider>} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/project/:id" element={<ProjectDetailsPage />} />
            <Route path="/project/:id/edit" element={<EditProjectPage />} />
            <Route path="/project/:id/manage-team" element={<ManageTeamPage />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/network" element={<NetworkPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>;
}
