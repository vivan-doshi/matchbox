import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UsersIcon,
  CalendarIcon,
  CheckIcon,
  BookmarkIcon,
  MessageCircleIcon,
  ClockIcon,
  XIcon,
  SendIcon,
  CheckCircleIcon,
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  university: string;
  profilePic: string;
}

interface Role {
  title: string;
  description: string;
  filled: boolean;
  user?: User;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  roles: Role[];
  creator: User;
  timeline: {
    startDate: string;
    endDate: string;
  };
  timeCommitment: string;
  duration: number;
}

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [isSaved, setIsSaved] = useState(false);
  const [appliedRoles, setAppliedRoles] = useState<string[]>([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Mock project data
  const project: Project = {
    id: '1',
    title: 'AI-powered Study Assistant',
    description:
      "We're building an AI assistant to help students organize notes, schedule study sessions, and provide personalized learning recommendations. The app will use natural language processing to analyze notes and machine learning to create personalized study plans. This is a comprehensive project that aims to revolutionize how students approach their studies.",
    tags: ['AI/ML', 'Mobile', 'Education'],
    timeCommitment: '10-15 hrs/week',
    duration: 10,
    roles: [
      {
        title: 'Backend Developer',
        description: 'Responsible for building the API and database architecture, implementing authentication, and creating scalable microservices.',
        filled: true,
        user: {
          id: '101',
          name: 'Alex Chen',
          university: 'Stanford',
          profilePic: 'https://i.pravatar.cc/150?img=11',
        },
      },
      {
        title: 'ML Engineer',
        description: 'Will work on developing and training the machine learning models, optimizing algorithms, and implementing recommendation systems.',
        filled: true,
        user: {
          id: '102',
          name: 'Taylor Kim',
          university: 'MIT',
          profilePic: 'https://i.pravatar.cc/150?img=12',
        },
      },
      {
        title: 'UI/UX Designer',
        description: 'Will create user flows, wireframes, and high-fidelity designs. Responsible for maintaining design system and conducting user research.',
        filled: false,
      },
      {
        title: 'Frontend Developer',
        description: 'Will implement the UI designs and integrate with the backend API. Experience with React Native required.',
        filled: false,
      },
    ],
    creator: {
      id: '101',
      name: 'Alex Chen',
      university: 'Stanford',
      profilePic: 'https://i.pravatar.cc/150?img=11',
    },
    timeline: {
      startDate: 'Oct 15, 2023',
      endDate: 'Dec 20, 2023',
    },
  };

  const filledRoles = project.roles.filter((role) => role.filled).length;
  const totalRoles = project.roles.length;

  // Load saved state from localStorage
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    setIsSaved(savedProjects.includes(project.id));

    const applied = JSON.parse(localStorage.getItem('appliedRoles') || '[]');
    setAppliedRoles(applied);
  }, [project.id]);

  // Save/bookmark toggle
  const handleSaveToggle = () => {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    let updated;
    if (isSaved) {
      updated = savedProjects.filter((pid: string) => pid !== project.id);
    } else {
      updated = [...savedProjects, project.id];
    }
    localStorage.setItem('savedProjects', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  // Handle profile click
  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Handle apply button click - opens modal for role selection
  const handleApplyClick = () => {
    // Get all open (unfilled) roles that haven't been applied to
    const openRoles = project.roles
      .filter((role) => !role.filled && !hasApplied(role.title))
      .map((role) => role.title);

    setSelectedRoles(openRoles.length > 0 ? [openRoles[0]] : []); // Pre-select first available role
    setShowApplicationModal(true);
    setApplicationMessage('');
  };

  // Toggle role selection in modal
  const toggleRoleSelection = (roleTitle: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleTitle)
        ? prev.filter((r) => r !== roleTitle)
        : [...prev, roleTitle]
    );
  };

  // Select all available roles
  const selectAllRoles = () => {
    const openRoles = project.roles
      .filter((role) => !role.filled && !hasApplied(role.title))
      .map((role) => role.title);
    setSelectedRoles(openRoles);
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (selectedRoles.length === 0) return;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update applied roles for all selected roles
    const newRoleKeys = selectedRoles.map((roleTitle) => `${project.id}-${roleTitle}`);
    const updated = [...appliedRoles, ...newRoleKeys];
    setAppliedRoles(updated);
    localStorage.setItem('appliedRoles', JSON.stringify(updated));

    // Close modal and show success animation
    setShowApplicationModal(false);
    setSelectedRoles([]);
    setShowSuccessAnimation(true);

    // Hide success animation after 3 seconds
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);
  };

  // Check if user has applied to a role
  const hasApplied = (roleTitle: string): boolean => {
    return appliedRoles.includes(`${project.id}-${roleTitle}`);
  };

  // Handle message click
  const handleMessageClick = (user: User) => {
    setSelectedUser(user);
    setShowMessageModal(true);
    setMessageText('');
    setMessageSent(false);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 500));

    setMessageSent(true);

    // Close modal after brief delay
    setTimeout(() => {
      setShowMessageModal(false);
      setMessageSent(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen page-background-gradient">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => {
                // Check if we came from My Projects page
                const referrer = sessionStorage.getItem('projectReferrer');
                if (referrer) {
                  sessionStorage.removeItem('projectReferrer');
                  navigate(referrer);
                } else if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="text-slate-600 hover:text-orange-500 transition-colors mr-4 cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Project Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-slate-500 mr-2">Created by</span>
            <button
              onClick={() => handleProfileClick(project.creator.id)}
              className="flex items-center group hover:bg-slate-50 rounded-lg p-2 transition-all"
              aria-label={`View ${project.creator.name}'s profile`}
            >
              <img
                src={project.creator.profilePic}
                alt={project.creator.name}
                className="w-10 h-10 rounded-full mr-2 ring-2 ring-transparent group-hover:ring-orange-300 transition-all transform group-hover:scale-105"
              />
              <span className="font-semibold text-base text-slate-900 group-hover:text-orange-500 transition-colors">
                {project.creator.name}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            {/* Title and Save Button */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-slate-900 flex-1 pr-4">{project.title}</h2>
              <button
                onClick={handleSaveToggle}
                className="p-3 rounded-full hover:bg-orange-50 transition-all transform hover:scale-110"
                aria-label={isSaved ? 'Remove bookmark' : 'Bookmark project'}
              >
                <BookmarkIcon
                  className={`h-6 w-6 transition-all ${
                    isSaved ? 'fill-orange-500 text-orange-500' : 'text-slate-400 hover:text-orange-500'
                  }`}
                />
              </button>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-base text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <UsersIcon className="h-5 w-5 mr-2 text-orange-500" />
                <span className="font-medium">
                  {filledRoles}/{totalRoles} roles filled
                </span>
              </div>
              <div className="flex items-center text-base text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <CalendarIcon className="h-5 w-5 mr-2 text-orange-500" />
                <span className="font-medium">{project.duration} weeks</span>
              </div>
              <div className="flex items-center text-base text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
                <span className="font-medium">{project.timeCommitment}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag, index) => (
                <div key={index} className="flex items-center">
                  <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-base font-medium">
                    {tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
              <p className="text-slate-700 text-base leading-relaxed">{project.description}</p>
            </div>

            {/* Team Roles */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Team Roles</h3>
                <span className="text-base text-slate-500 font-medium">
                  {filledRoles}/{totalRoles} filled
                </span>
              </div>

              <div className="space-y-4">
                {project.roles.map((role, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">{role.title}</h4>
                        <p className="text-base text-slate-600 leading-relaxed">{role.description}</p>
                      </div>
                      {role.filled && role.user ? (
                        <div className="flex items-center gap-3 ml-4">
                          <div className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Filled
                          </div>
                          <button
                            onClick={() => handleMessageClick(role.user!)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-all transform hover:scale-105"
                            aria-label={`Message ${role.user.name}`}
                          >
                            <MessageCircleIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Message</span>
                          </button>
                        </div>
                      ) : hasApplied(role.title) ? (
                        <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold ml-4">
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Applied
                        </div>
                      ) : (
                        <div className="flex items-center bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold ml-4">
                          Open
                        </div>
                      )}
                    </div>

                    {/* Team Member Info */}
                    {role.filled && role.user && (
                      <div className="flex items-center mt-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleProfileClick(role.user!.id)}
                          className="flex items-center group hover:bg-slate-50 rounded-lg p-2 -ml-2 transition-all"
                          aria-label={`View ${role.user.name}'s profile`}
                        >
                          <img
                            src={role.user.profilePic}
                            alt={role.user.name}
                            className="w-10 h-10 rounded-full mr-3 ring-2 ring-transparent group-hover:ring-orange-300 transition-all transform group-hover:scale-110"
                          />
                          <div className="text-left">
                            <p className="text-base font-semibold text-slate-900 group-hover:text-orange-500 transition-colors">
                              {role.user.name}
                            </p>
                            <p className="text-sm text-slate-500">{role.user.university}</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Consolidated Apply to Project Button */}
              {project.roles.some((role) => !role.filled && !hasApplied(role.title)) && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleApplyClick}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    Apply to Project
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Show message if all roles are filled or applied */}
              {!project.roles.some((role) => !role.filled && !hasApplied(role.title)) && (
                <div className="mt-8 flex justify-center">
                  <div className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full text-base font-semibold">
                    All positions filled or already applied
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal - Multi-Select */}
      {showApplicationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowApplicationModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Apply to Project</h3>
                <p className="text-base text-slate-500">
                  {selectedRoles.length} {selectedRoles.length === 1 ? 'role' : 'roles'} selected
                </p>
              </div>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <XIcon className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Project Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                <h4 className="text-lg font-bold text-slate-900 mb-3">{project.title}</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg">
                    <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <span className="font-medium">{project.duration} weeks</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg">
                    <ClockIcon className="h-4 w-4 mr-2 text-orange-500" />
                    <span className="font-medium">{project.timeCommitment}</span>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-bold text-slate-900">Select Roles to Apply For</h4>
                  <button
                    onClick={selectAllRoles}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Select All
                  </button>
                </div>
                <div className="space-y-3">
                  {project.roles
                    .filter((role) => !role.filled && !hasApplied(role.title))
                    .map((role, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.title)}
                          onChange={() => toggleRoleSelection(role.title)}
                          className="mt-1 h-5 w-5 text-orange-500 rounded border-slate-300 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-base font-semibold text-slate-900 mb-1">{role.title}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{role.description}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Application Message */}
              <div>
                <label htmlFor="application-message" className="block text-base font-bold text-slate-900 mb-3">
                  Message (Optional)
                </label>
                <textarea
                  id="application-message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the project creator why you're a great fit..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-base resize-none"
                  rows={5}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="px-6 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={selectedRoles.length === 0}
                className={`px-6 py-3 rounded-xl text-base font-semibold transition-all transform ${
                  selectedRoles.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => !messageSent && setShowMessageModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {!messageSent ? (
              <>
                {/* Message Header */}
                <div className="border-b border-slate-200 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.profilePic}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full ring-2 ring-orange-200"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                      <p className="text-sm text-slate-500">{selectedUser.university}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <XIcon className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                {/* Message Content */}
                <div className="p-6">
                  <label htmlFor="message-text" className="block text-base font-semibold text-slate-900 mb-3">
                    Type your message
                  </label>
                  <textarea
                    id="message-text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Say hello to ${selectedUser.name}...`}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-base resize-none"
                    rows={4}
                    autoFocus
                  />
                </div>

                {/* Message Footer */}
                <div className="border-t border-slate-200 p-6 flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span>Send</span>
                    <SendIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-base text-slate-600">
                  Your message has been sent to {selectedUser.name}. You can continue the conversation in the Chat
                  section.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-scaleUp">
            <div className="mb-6 relative">
              {/* Animated Checkmark Circle */}
              <div className="w-24 h-24 mx-auto relative">
                <svg className="w-24 h-24 animate-spin-slow" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeDasharray="283"
                    strokeDashoffset="283"
                    className="animate-drawCircle"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 animate-checkPop" />
                </div>
              </div>

              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-orange-500 rounded-full animate-confetti"
                    style={{
                      left: '50%',
                      top: '50%',
                      animationDelay: `${i * 0.05}s`,
                      transform: `rotate(${i * 18}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-3xl font-bold text-slate-900 mb-3">Application Sent!</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              The project creator will review your application soon. Keep an eye on your notifications!
            </p>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes checkPop {
          0%, 50% {
            opacity: 0;
            transform: scale(0);
          }
          70% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes confetti {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100px) translateX(var(--x)) rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-scaleUp {
          animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-drawCircle {
          animation: drawCircle 0.6s ease-out forwards;
        }

        .animate-checkPop {
          animation: checkPop 0.6s ease-out forwards;
        }

        .animate-confetti {
          --x: ${Math.random() * 200 - 100}px;
          animation: confetti 1s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailsPage;
