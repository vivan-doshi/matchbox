import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircleIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
  MenuIcon,
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

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
  const { user: currentUser, isAuthenticated } = useAuth();

  console.log('ProjectDetailsPage rendered with ID:', id);
  console.log('Current user:', currentUser);

  // State management
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [appliedRoles, setAppliedRoles] = useState<string[]>([]);
  const [checkingApplications, setCheckingApplications] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Check if current user is the project creator
  const isCreator = React.useMemo(() => {
    if (!currentUser || !project) return false;

    const userId = currentUser.id;
    const creatorId = project.creator.id;

    console.log('Creator check:', {
      userId,
      creatorId,
      match: userId === creatorId,
      currentUser,
      creator: project.creator
    });

    return userId === creatorId;
  }, [currentUser, project]);

  console.log('Is creator?', isCreator);

  // Fetch project data
  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      console.log('Fetching project with ID:', id);
      const response = await apiClient.getProjectById(id!);
      console.log('API response:', response);

      if (response.success && response.data) {
        // Transform API data to match local Project interface
        const apiProject = response.data;
        console.log('API project data:', apiProject);
        const creator = typeof apiProject.creator === 'object' ? apiProject.creator : null;

        const transformedProject: Project = {
          id: apiProject.id,
          title: apiProject.title,
          description: apiProject.description,
          tags: apiProject.tags || [],
          timeCommitment: apiProject.timeCommitment || 'Not specified',
          duration: apiProject.duration || 0,
          roles: apiProject.roles.map((role: any) => {
            const user = typeof role.user === 'object' && role.user ? role.user : null;
            return {
              title: role.title,
              description: role.description,
              filled: role.filled,
              user: user ? {
                id: user.id || user._id,
                name: user.preferredName || `${user.firstName} ${user.lastName}`,
                university: user.university || '',
                profilePic: user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`,
              } : undefined,
            };
          }),
          creator: {
            id: creator?.id || creator?._id || '',
            name: creator?.preferredName || `${creator?.firstName} ${creator?.lastName}` || 'Unknown',
            university: creator?.university || '',
            profilePic: creator?.profilePicture || `https://ui-avatars.com/api/?name=${creator?.firstName}+${creator?.lastName}`,
          },
          timeline: {
            startDate: apiProject.startDate
              ? new Date(apiProject.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Not set',
            endDate: apiProject.deadline
              ? new Date(apiProject.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Not set',
          },
        };

        console.log('Transformed project:', transformedProject);
        setProject(transformedProject);
        console.log('Project state updated successfully');
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
      console.log('Loading complete, loading state:', false);
    }
  };

  const filledRoles = project?.roles.filter((role) => role.filled).length || 0;
  const totalRoles = project?.roles.length || 0;

  const checkSavedStatus = useCallback(
    async (projectId: string) => {
      if (!isAuthenticated) {
        setIsSaved(false);
        setCheckingSaved(false);
        return;
      }

      try {
        setCheckingSaved(true);
        const response = await apiClient.getSavedProjects();
        const savedProjects = response.data || [];
        const savedIds = savedProjects.map((saved: any) => saved.id || saved._id);
        setIsSaved(savedIds.includes(projectId));
      } catch (err) {
        console.error('Error checking saved status:', err);
      } finally {
        setCheckingSaved(false);
      }
    },
    [isAuthenticated]
  );

  const checkApplicationStatus = useCallback(async () => {
    if (!project || !isAuthenticated) {
      setAppliedRoles([]);
      setCheckingApplications(false);
      return;
    }

    try {
      setCheckingApplications(true);
      const response = await apiClient.getMyApplications(project.id);
      const roles = (response.data || []).map((application: any) => application.role);
      setAppliedRoles(roles);
    } catch (err) {
      console.error('Error checking applications:', err);
    } finally {
      setCheckingApplications(false);
    }
  }, [project, isAuthenticated]);

  // Load saved state from localStorage
  useEffect(() => {
    if (!project) return;

    checkSavedStatus(project.id);
  }, [project, checkSavedStatus]);

  useEffect(() => {
    if (!project) return;
    checkApplicationStatus();
  }, [project, checkApplicationStatus]);

  useEffect(() => {
    if (!project) return;

    const handleSavedProjectsChange = () => {
      checkSavedStatus(project.id);
    };

    window.addEventListener('savedProjectsChanged', handleSavedProjectsChange);
    return () => {
      window.removeEventListener('savedProjectsChanged', handleSavedProjectsChange);
    };
  }, [project, checkSavedStatus]);

  // Save/bookmark toggle
  const handleSaveToggle = async () => {
    if (!project) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await apiClient.unsaveProject(project.id);
        setIsSaved(false);
      } else {
        await apiClient.saveProject(project.id);
        setIsSaved(true);
      }

      window.dispatchEvent(new Event('savedProjectsChanged'));
    } catch (err: any) {
      console.error('Error updating saved project:', err);
      alert(err.response?.data?.message || 'Failed to update saved projects');
    }
  };

  // Handle profile click
  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Handle apply button click - opens modal for role selection
  const handleApplyClick = () => {
    if (!project) return;

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
    if (!project) return;

    const openRoles = project.roles
      .filter((role) => !role.filled && !hasApplied(role.title))
      .map((role) => role.title);
    setSelectedRoles(openRoles);
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (selectedRoles.length === 0 || !project) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.applyToProject(project.id, {
        roles: selectedRoles,
        message: applicationMessage,
      });

      setShowApplicationModal(false);
      setSelectedRoles([]);
      setApplicationMessage('');
      setShowSuccessAnimation(true);
      await checkApplicationStatus();

      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has applied to a role
  const hasApplied = (roleTitle: string): boolean => {
    return appliedRoles.includes(roleTitle);
  };

  // Handle message click
  const handleMessageClick = async (userToMessage: User) => {
    const targetUserId = (userToMessage?.id || (userToMessage as any)?._id)?.toString();

    if (!targetUserId) {
      alert('Unable to start conversation for this user.');
      return;
    }

    try {
      const response = await apiClient.createChat(targetUserId);
      const chat = response.data as any;
      const chatId = chat?._id || chat?.id;

      if (!chatId) {
        throw new Error('Chat ID missing from response');
      }

      navigate(`/dashboard/chat?chatId=${chatId}`);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      alert(error.response?.data?.message || 'Failed to start conversation');
    }
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!project) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone and will:\n- Remove the project permanently\n- Delete all associated data\n- Remove all team member assignments`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await apiClient.deleteProject(project.id);

      if (response.success) {
        alert('Project deleted successfully!');
        // Navigate back to My Projects page
        navigate('/my-projects');
      } else {
        alert('Failed to delete project: ' + (response.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle send message
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cardinal border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-cardinal text-white rounded-lg hover:bg-cardinal mr-2"
          >
            Go Back
          </button>
          <button
            onClick={fetchProject}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background-gradient">
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-6 w-6 text-slate-700" />
            </button>
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
              className="text-slate-600 hover:text-cardinal transition-colors mr-4 cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Project Details</h1>
          </div>
          <div className="flex items-center gap-2">
            {isCreator ? (
              <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-base text-blue-700 font-semibold">Your Project</span>
              </div>
            ) : (
              <>
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
                  <span className="font-semibold text-base text-slate-900 group-hover:text-cardinal transition-colors">
                    {project.creator.name}
                  </span>
                </button>
              </>
            )}
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
                disabled={checkingSaved}
                className="p-3 rounded-full hover:bg-red-50 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isSaved ? 'Remove bookmark' : 'Bookmark project'}
              >
                <BookmarkIcon
                  className={`h-6 w-6 transition-all ${
                    isSaved ? 'fill-orange-500 text-cardinal' : 'text-slate-400 hover:text-cardinal'
                  }`}
                />
              </button>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-base text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <UsersIcon className="h-5 w-5 mr-2 text-cardinal" />
                <span className="font-medium">
                  {filledRoles}/{totalRoles} roles filled
                </span>
              </div>
              <div className="flex items-center text-base text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <CalendarIcon className="h-5 w-5 mr-2 text-cardinal" />
                <span className="font-medium">{project.duration} weeks</span>
              </div>
              <div className="flex items-center text-base text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
                <ClockIcon className="h-5 w-5 mr-2 text-cardinal" />
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
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-cardinal hover:bg-red-50 transition-all transform hover:scale-105"
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
                        <div className="flex items-center bg-red-50 text-cardinal px-4 py-2 rounded-full text-sm font-semibold ml-4">
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
                            <p className="text-base font-semibold text-slate-900 group-hover:text-cardinal transition-colors">
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

              {/* Conditional Buttons - Creator vs Non-Creator */}
              {isCreator ? (
                // Creator Actions
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => navigate(`/project/${project.id}/edit`)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full text-base font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <EditIcon className="h-5 w-5" />
                    Edit Project
                  </button>
                  <button
                    onClick={() => navigate(`/project/${project.id}/manage-team`)}
                    className="bg-gradient-to-r from-cardinal to-cardinal-light text-white px-6 py-3 rounded-full text-base font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <UsersIcon className="h-5 w-5" />
                    Manage Team
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-base font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Delete
                  </button>
                </div>
              ) : (
                // Non-Creator Actions
                <>
                  {/* Apply to Project Button */}
                  {project.roles.some((role) => !role.filled && !hasApplied(role.title)) && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={handleApplyClick}
                        disabled={checkingApplications}
                        className="bg-gradient-to-r from-cardinal to-cardinal-light text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {checkingApplications ? 'Loading...' : 'Apply to Project'}
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
                </>
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
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-orange-100">
                <h4 className="text-lg font-bold text-slate-900 mb-3">{project.title}</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg">
                    <CalendarIcon className="h-4 w-4 mr-2 text-cardinal" />
                    <span className="font-medium">{project.duration} weeks</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg">
                    <ClockIcon className="h-4 w-4 mr-2 text-cardinal" />
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
                    className="text-sm font-semibold text-cardinal hover:text-cardinal transition-colors"
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
                          className="mt-1 h-5 w-5 text-cardinal rounded border-slate-300 focus:ring-2 focus:ring-cardinal cursor-pointer"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cardinal focus:border-cardinal outline-none transition-all text-base resize-none"
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
                disabled={selectedRoles.length === 0 || isSubmitting}
                className={`px-6 py-3 rounded-xl text-base font-semibold transition-all transform ${
                  selectedRoles.length === 0 || isSubmitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cardinal to-cardinal-light text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
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
                    className="absolute w-2 h-2 bg-cardinal rounded-full animate-confetti"
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
