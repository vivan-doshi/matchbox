import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserPlusIcon,
  MessageSquareIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  MenuIcon,
  FolderOpen,
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { Project } from '../types/api';
import ProjectTeamTable from '../components/projects/ProjectTeamTable';
import Navigation from '../components/Navigation';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import { getProfilePictureUrl } from '../utils/profileHelpers';
import NotificationBell from '../components/notifications/NotificationBell';

interface FormattedProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  createdAt: string;
  deadline: string;
  teamMembers: any[];
  openRoles: any[];
  applicants: number;
  recommendations: number;
}

const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<FormattedProject[]>([]);
  const [savedProjects, setSavedProjects] = useState<FormattedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentView, setCurrentView] = useState<'posted' | 'saved' | 'joined'>('posted');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [loadingJoined, setLoadingJoined] = useState(false);
  const [joinedError, setJoinedError] = useState<string | null>(null);
  const [hasFetchedJoined, setHasFetchedJoined] = useState(false);

  const { user: authUser } = useAuth();
  const formatProject = useCallback((project: any): FormattedProject => {
    const projectId = project.id || project._id;

    return {
      id: projectId,
      title: project.title,
      description: project.description,
      tags: project.tags || [],
      status: project.status,
      createdAt: new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      deadline: project.deadline
        ? new Date(project.deadline).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Not set',
      teamMembers: (project.roles || [])
        .filter((role: any) => role.filled && role.user)
        .map((role: any) => {
          const user = typeof role.user === 'object' ? role.user : null;
          return {
            id: user?.id || '',
            name: user?.preferredName || `${user?.firstName} ${user?.lastName}` || 'Unknown',
            role: role.title,
            university: user?.university || '',
            profilePic:
              getProfilePictureUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`,
            status: 'Active',
            joinedAt: new Date(project.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
        }),
      openRoles: (project.roles || [])
        .filter((role: any) => !role.filled)
        .map((role: any, index: number) => ({
          id: role._id || `role-${index}`,
          title: role.title,
          description: role.description,
          applicants: 0,
        })),
      applicants: project.applicants?.length || 0,
      recommendations: project.recommendations?.length || 0,
    };
  }, []);

  useEffect(() => {
    fetchMyProjects();
    fetchSavedProjects();
  }, []);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'joined') {
      setCurrentView('joined');
      fetchJoinedProjects();
    } else if (tabParam === 'saved') {
      setCurrentView('saved');
    } else if (tabParam === 'posted') {
      setCurrentView('posted');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Listen for changes to saved projects from other components
  useEffect(() => {
    const handleSavedProjectsChange = () => {
      fetchSavedProjects();
    };

    window.addEventListener('savedProjectsChanged', handleSavedProjectsChange);

    return () => {
      window.removeEventListener('savedProjectsChanged', handleSavedProjectsChange);
    };
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyProjects();

      if (response.success && response.data) {
        const formattedProjects: FormattedProject[] = response.data.map((project: any) =>
          formatProject(project)
        );
        setProjects(formattedProjects);
        if (formattedProjects.length > 0) {
          setExpandedProject(formattedProjects[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedProjects = async () => {
    try {
      if (!localStorage.getItem('user')) {
        setSavedProjects([]);
        return;
      }

      const response = await apiClient.getSavedProjects();
      const savedList = response.data || [];
      const formattedProjects = savedList.map((project: any) => formatProject(project));
      setSavedProjects(formattedProjects);
    } catch (err: any) {
      console.error('Error fetching saved projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch saved projects');
    }
  };

  const fetchJoinedProjects = useCallback(async () => {
    try {
      setLoadingJoined(true);
      setJoinedError(null);
      const response = await apiClient.getJoinedProjects();

      if (response.success && response.data) {
        setJoinedProjects(response.data);
      } else {
        setJoinedProjects([]);
      }
    } catch (error: any) {
      console.error('Error fetching joined projects:', error);
      const message = error.response?.data?.message || error.message || 'Failed to load joined projects.';
      setJoinedError(message);
    } finally {
      setLoadingJoined(false);
      setHasFetchedJoined(true);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'joined' && !hasFetchedJoined) {
      fetchJoinedProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, hasFetchedJoined]);

  const toggleExpand = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
    if (expandedProject !== projectId) {
      setActiveTab({
        ...activeTab,
        [projectId]: 'team',
      });
    }
  };

  const changeTab = (projectId: string, tab: string) => {
    setActiveTab({
      ...activeTab,
      [projectId]: tab,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cardinal border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMyProjects}
            className="px-4 py-2 bg-cardinal text-white rounded-lg hover:bg-cardinal"
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

      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
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
            <h1 className="text-xl font-bold">My Projects</h1>
            <div className="ml-4 flex gap-2">
              <button
                onClick={() => setCurrentView('posted')}
                className={`px-4 py-1 text-sm font-medium ${
                  currentView === 'posted'
                    ? 'text-cardinal border-b-2 border-cardinal'
                    : 'text-slate-600 hover:text-cardinal'
                }`}
              >
                Posted Projects ({projects.length})
              </button>
              <button
                onClick={() => setCurrentView('saved')}
                className={`px-4 py-1 text-sm font-medium ${
                  currentView === 'saved'
                    ? 'text-cardinal border-b-2 border-cardinal'
                    : 'text-slate-600 hover:text-cardinal'
                }`}
              >
                Saved Projects ({savedProjects.length})
              </button>
              <button
                onClick={() => setCurrentView('joined')}
                className={`px-4 py-1 text-sm font-medium ${
                  currentView === 'joined'
                    ? 'text-cardinal border-b-2 border-cardinal'
                    : 'text-slate-600 hover:text-cardinal'
                }`}
              >
                Projects Joined ({joinedProjects.length})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-gradient-to-r from-cardinal to-cardinal-light text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New Project
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Posted Projects View */}
        {currentView === 'posted' && (
          <>
            {projects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first project to start building your team!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center bg-gradient-to-r from-cardinal to-cardinal-light text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <span
                        className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : project.status === 'Planning'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Created: {project.createdAt} • Deadline: {project.deadline}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <div className="text-sm font-medium">
                        {project.teamMembers.length}/{project.teamMembers.length + project.openRoles.length} filled
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-slate-500">
                          {project.openRoles.length} Open Roles
                        </div>
                        {project.applicants > 0 && (
                          <div className="text-xs text-cardinal font-medium">
                            {project.applicants} New Applicants
                          </div>
                        )}
                      </div>
                    </div>
                    {expandedProject === project.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedProject === project.id && (
                  <div className="border-t border-slate-100">
                    <div className="border-b border-slate-100">
                      <div className="flex">
                        <button
                          className={`px-6 py-3 text-sm font-medium ${
                            !activeTab[project.id] || activeTab[project.id] === 'team'
                              ? 'text-cardinal border-b-2 border-cardinal'
                              : 'text-slate-600'
                          }`}
                          onClick={() => changeTab(project.id, 'team')}
                        >
                          Team Members ({project.teamMembers.length})
                        </button>
                        <button
                          className={`px-6 py-3 text-sm font-medium ${
                            activeTab[project.id] === 'applicants'
                              ? 'text-cardinal border-b-2 border-cardinal'
                              : 'text-slate-600'
                          }`}
                          onClick={() => changeTab(project.id, 'applicants')}
                        >
                          Applicants ({project.applicants})
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Team Members Tab */}
                      {(!activeTab[project.id] || activeTab[project.id] === 'team') && (
                        <div>
                          <h4 className="font-medium mb-4">Current Team Members</h4>
                          {project.teamMembers.length > 0 ? (
                            <ProjectTeamTable teamMembers={project.teamMembers} />
                          ) : (
                            <p className="text-sm text-slate-500 py-4">
                              No team members yet. Start by filling the open roles!
                            </p>
                          )}

                          <div className="mt-6">
                            <h4 className="font-medium mb-4">Open Roles</h4>
                            {project.openRoles.length > 0 ? (
                              <div className="space-y-3">
                                {project.openRoles.map((role) => (
                                  <div
                                    key={role.id}
                                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                                  >
                                    <div>
                                      <span className="font-medium">{role.title}</span>
                                      <p className="text-xs text-slate-600 mt-1">
                                        {role.description}
                                      </p>
                                      {role.applicants > 0 && (
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-red-50 text-cardinal rounded-full">
                                          {role.applicants} applicant{role.applicants !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex space-x-2">
                                      <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
                                        <EditIcon className="h-4 w-4" />
                                      </button>
                                      <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
                                        <UserPlusIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 py-4">
                                All roles are filled!
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Applicants Tab */}
                      {activeTab[project.id] === 'applicants' && (
                        <div>
                          <h4 className="font-medium mb-4">Applicants</h4>
                          <div className="text-center py-8">
                            <p className="text-slate-500">
                              No applicants yet. Share your project to attract talent!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end space-x-3">
                        <Link
                          to={`/project/${project.id}`}
                          onClick={(e) => {
                            console.log('View Project clicked!');
                            console.log('Project ID:', project.id);
                            console.log('Full project:', project);
                            console.log('Target URL:', `/project/${project.id}`);

                            if (!project.id) {
                              console.error('ERROR: Project ID is undefined!');
                              e.preventDefault();
                              alert('Error: Project ID is missing. Check console for details.');
                              return;
                            }

                            sessionStorage.setItem('projectReferrer', '/my-projects');
                          }}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          View Project
                        </Link>
                        <button
                          onClick={() => navigate(`/project/${project.id}/manage-team`)}
                          className="px-4 py-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
                        >
                          Manage Team
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved Projects View */}
        {currentView === 'saved' && (
          <>
            {savedProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                <h3 className="text-xl font-bold mb-2">No saved projects</h3>
                <p className="text-slate-600 mb-6">
                  Projects you bookmark will appear here for easy access!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {savedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="font-bold text-lg">{project.title}</h3>
                          <span
                            className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                              project.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-700'
                                : project.status === 'Planning'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Created: {project.createdAt} • Deadline: {project.deadline}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4 text-right">
                          <div className="text-sm font-medium">
                            {project.teamMembers.length}/{project.teamMembers.length + project.openRoles.length} filled
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-slate-500">
                              {project.openRoles.length} Open Roles
                            </div>
                          </div>
                        </div>
                        {expandedProject === project.id ? (
                          <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {expandedProject === project.id && (
                      <div className="border-t border-slate-100 p-6">
                        <p className="text-slate-700 mb-4">{project.description}</p>
                        <div className="flex justify-end">
                          <Link
                            to={`/project/${project.id}`}
                            onClick={() => {
                              sessionStorage.setItem('projectReferrer', '/my-projects');
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
                          >
                            View Project
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Projects Joined View */}
        {currentView === 'joined' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            {loadingJoined ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cardinal"></div>
              </div>
            ) : joinedError ? (
              <div className="text-center py-12 text-red-500">
                <p className="font-semibold mb-2">Unable to load joined projects.</p>
                <p className="text-sm text-red-400 mb-4">{joinedError}</p>
                <button
                  onClick={fetchJoinedProjects}
                  className="px-4 py-2 bg-cardinal text-white rounded-lg text-sm font-medium hover:bg-cardinal transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : joinedProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <FolderOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">No joined projects</h3>
                <p className="text-slate-500">
                  Projects you've joined as a team member will appear here after you get accepted to a role.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinedProjects.map((project) => {
                  const projectId = project.id || (project as any)._id;
                  const creator =
                    typeof project.creator === 'object' && project.creator !== null
                      ? project.creator
                      : null;
                  const creatorName = creator
                    ? creator.preferredName ||
                      `${creator.firstName} ${creator.lastName}`.trim()
                    : 'Project Creator';
                  const userRoleTitle = project.roles?.find((role) => {
                    if (!authUser?.id || !role.user) return false;
                    if (typeof role.user === 'string') {
                      return role.user === authUser.id;
                    }
                    const populatedUser = role.user;
                    return (
                      populatedUser.id === authUser.id ||
                      (populatedUser as any)._id === authUser.id
                    );
                  })?.title;
                  const filledRoles = project.roles?.filter((role) => role.filled).length || 0;
                  const totalRoles = project.roles?.length || 0;
                  const formattedDeadline = project.deadline
                    ? new Date(project.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : null;

                  return (
                    <div
                      key={projectId}
                      className="border border-slate-200 rounded-lg p-6 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-slate-600 mb-4">{project.description}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.category && (
                              <span className="px-3 py-1 bg-red-50 text-cardinal rounded-full text-xs font-medium">
                                {project.category}
                              </span>
                            )}
                            {project.status && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {project.status}
                              </span>
                            )}
                            {userRoleTitle && (
                              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                Your Role: {userRoleTitle}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-500 mb-2">
                            Created by {creatorName}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>
                              Roles filled: {filledRoles}/{totalRoles}
                            </span>
                            {formattedDeadline && <span>Due {formattedDeadline}</span>}
                          </div>
                        </div>

                        <Link
                          to={`/project/${projectId}`}
                          className="self-start px-4 py-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
                          onClick={() => {
                            sessionStorage.setItem('projectReferrer', '/my-projects');
                          }}
                        >
                          View Project
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={() => {
            setShowCreateModal(false);
            fetchMyProjects();
          }}
        />
      )}
    </div>
  );
};

export default MyProjects;
