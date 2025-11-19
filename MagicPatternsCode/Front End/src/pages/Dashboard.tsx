import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { PlusIcon, FolderIcon, MenuIcon } from 'lucide-react';
import HomePage from '../components/dashboard/HomePage';
import ChatPage from '../components/dashboard/ChatPage';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import DiscoverPeoplePage from '../pages/DiscoverPeoplePage';
import NotificationBell from '../components/notifications/NotificationBell';
import Navigation from '../components/Navigation';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newProject, setNewProject] = useState<any>(null);
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/chat')) return 'Messages';
    if (path.includes('/dashboard/discover')) return 'Discover People';
    return 'Home';
  };


  useEffect(() => {
    if (location.state && (location.state as any).openCreateModal) {
      setIsCreateModalOpen(true);
      navigate('/dashboard', { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Handle new project creation
  const handleProjectCreated = (project: any) => {
    console.log('Dashboard: New project created', project.id);
    setNewProject(project);
    // Reset newProject state after HomePage has processed it
    // This doesn't remove the project from HomePage's state, just clears the "trigger"
    setTimeout(() => {
      console.log('Dashboard: Clearing newProject trigger');
      setNewProject(null);
    }, 500);
  };

  return (
    <div className="min-h-screen page-background-gradient flex flex-col">
      {/* Header with Hamburger Menu */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-6 w-6 text-slate-700" />
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-cardinal to-cardinal-light rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/my-projects"
              className="flex items-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-all"
            >
              <FolderIcon className="h-4 w-4 mr-1" />
              My Projects
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-cardinal to-cardinal-light text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Component */}
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 mb-0">
        <Routes>
          <Route path="/" element={<HomePage newProject={newProject} />} />
          <Route path="/discover" element={<DiscoverPeoplePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
