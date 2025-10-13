import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import { HomeIcon, SearchIcon, MessageSquareIcon, UserIcon, PlusIcon, FolderIcon } from 'lucide-react';
import HomePage from '../components/dashboard/HomePage';
import DiscoverPage from '../components/dashboard/DiscoverPage';
import ChatPage from '../components/dashboard/ChatPage';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/discover')) return 'Discover';
    if (path.includes('/dashboard/chat')) return 'Messages';
    return 'Home';
  };
  return <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
          </div>
          <div className="flex items-center">
            <Link to="/my-projects" className="flex items-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-all mr-2">
              <FolderIcon className="h-4 w-4 mr-1" />
              My Projects
            </Link>
            <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">
              <PlusIcon className="h-4 w-4 mr-1" />
              New Project
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
      <nav className="bg-white border-t border-slate-200 py-3 px-6 fixed bottom-0 w-full">
        <div className="container mx-auto flex justify-around items-center">
          <NavLink to="/dashboard" end className={({
          isActive
        }) => `flex flex-col items-center ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}>
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink to="/dashboard/discover" className={({
          isActive
        }) => `flex flex-col items-center ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}>
            <SearchIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Discover</span>
          </NavLink>
          <NavLink to="/dashboard/chat" className={({
          isActive
        }) => `flex flex-col items-center ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}>
            <MessageSquareIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </NavLink>
          <NavLink to="/profile" className={({
          isActive
        }) => `flex flex-col items-center ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}>
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        </div>
      </nav>
      {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>;
};
export default Dashboard;