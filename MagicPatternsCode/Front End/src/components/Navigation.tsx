import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, MessageSquareIcon, UserIcon, FolderIcon, UsersIcon, MenuIcon, XIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Hamburger Button - Always visible */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Open navigation menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* Overlay - Darkens background when sidebar is open */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Sidebar Navigation - Slide-out drawer */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-orange-500 to-red-500 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          aria-label="Close navigation menu"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white border-opacity-20">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-orange-500 font-bold text-xl">M</span>
            </div>
            <span className="ml-3 text-xl font-bold">MATCHBOX</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-2">
          <NavLink
            to="/dashboard"
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

          {/* Logout Button */}
          <button
            onClick={() => {
              handleNavClick();
              handleLogout();
            }}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-all text-white text-opacity-90 hover:bg-white hover:bg-opacity-10"
          >
            <LogOutIcon className="h-5 w-5 mr-3" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
