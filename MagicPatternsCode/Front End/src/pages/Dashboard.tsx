import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import { HomeIcon, MessageSquareIcon, UserIcon, PlusIcon, FolderIcon, MenuIcon, XIcon, BellIcon, UsersIcon } from 'lucide-react';
import HomePage from '../components/dashboard/HomePage';
import ChatPage from '../components/dashboard/ChatPage';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import DiscoverPeoplePage from '../pages/DiscoverPeoplePage';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newProject, setNewProject] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Mock unread count
  const location = useLocation();
  const notificationRef = useRef<HTMLDivElement>(null);

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/chat')) return 'Messages';
    if (path.includes('/dashboard/discover')) return 'Discover People';
    return 'Home';
  };

  // Close sidebar when navigation link is clicked
  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Fetch unread count (in production, this would be an API call)
  const fetchUnreadCount = () => {
    // Mock implementation
    // In production: const response = await api.get('/api/notifications/unread-count');
    // setUnreadCount(response.data.count);
  };

  const handleNotificationRead = () => {
    // Refresh unread count after marking notifications as read
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

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

            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Icon */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <NotificationDropdown
                  onClose={() => setShowNotifications(false)}
                  onNotificationRead={handleNotificationRead}
                />
              )}
            </div>

            <Link
              to="/my-projects"
              className="flex items-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-all"
            >
              <FolderIcon className="h-4 w-4 mr-1" />
              My Projects
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay - darkens the background when sidebar is open */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Navigation */}
        <nav
          className={`absolute top-0 left-0 h-full w-64 bg-gradient-to-b from-orange-500 to-red-500 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Main navigation"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-white border-opacity-20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-500 font-bold text-lg">M</span>
              </div>
              <span className="text-white font-bold text-lg">Matchbox</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="Close navigation menu"
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="py-6 px-4 space-y-2">
            <NavLink
              to="/dashboard"
              end
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white font-semibold'
                    : 'text-white text-opacity-90 hover:bg-white hover:bg-opacity-10'
                }`
              }
            >
              <HomeIcon className="h-5 w-5 mr-3" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/dashboard/discover"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white font-semibold'
                    : 'text-white text-opacity-90 hover:bg-white hover:bg-opacity-10'
                }`
              }
            >
              <UsersIcon className="h-5 w-5 mr-3" />
              <span>Discover People</span>
            </NavLink>

            <NavLink
              to="/my-projects"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white font-semibold'
                    : 'text-white text-opacity-90 hover:bg-white hover:bg-opacity-10'
                }`
              }
            >
              <FolderIcon className="h-5 w-5 mr-3" />
              <span>My Projects</span>
            </NavLink>

            <NavLink
              to="/profile"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white font-semibold'
                    : 'text-white text-opacity-90 hover:bg-white hover:bg-opacity-10'
                }`
              }
            >
              <UserIcon className="h-5 w-5 mr-3" />
              <span>My Profile</span>
            </NavLink>

            <NavLink
              to="/dashboard/chat"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white font-semibold'
                    : 'text-white text-opacity-90 hover:bg-white hover:bg-opacity-10'
                }`
              }
            >
              <MessageSquareIcon className="h-5 w-5 mr-3" />
              <span>Chat</span>
            </NavLink>
          </div>
        </nav>
      </div>

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