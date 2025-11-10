import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { Project } from '../types/api';
import ProjectTeamTable from '../components/projects/ProjectTeamTable';
import Navigation from '../components/Navigation';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';

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
  const [projects, setProjects] = useState<FormattedProject[]>([]);
  const [savedProjects, setSavedProjects] = useState<FormattedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentView, setCurrentView] = useState<'posted' | 'saved' | 'joined'>('posted');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchMyProjects();
    fetchSavedProjects();
  }, []);

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
        const formattedProjects: FormattedProject[] = response.data.map((project: any) => {
          const projectId = project.id || project._id;

          console.log('Project data:', { id: projectId, title: project.title });

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
            teamMembers: project.roles
              .filter((role: any) => role.filled && role.user)
              .map((role: any) => {
                const user = typeof role.user === 'object' ? role.user : null;
                return {
                  id: user?.id || '',
                  name: user?.preferredName || `${user?.firstName} ${user?.lastName}` || 'Unknown',
                  role: role.title,
                  university: user?.university || '',
                  profilePic: user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`,
                  status: 'Active',
                  joinedAt: new Date(project.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                };
              }),
            openRoles: project.roles
              .filter((role: any) => !role.filled)
              .map((role: any, index: number) => ({
                id: `role-${index}`,
                title: role.title,
                description: role.description,
                applicants: 0, // Will be populated from applications
              })),
            applicants: 0, // Will be populated from applications endpoint
            recommendations: 0, // Will be populated from recommendations endpoint
          };
        });

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
      // Get saved project IDs from localStorage
      const savedProjectIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');

      if (savedProjectIds.length === 0) {
        setSavedProjects([]);
        return;
      }

      // Fetch all saved projects by their IDs
      const savedProjectsData: FormattedProject[] = [];

      for (const projectId of savedProjectIds) {
        try {
          const response = await apiClient.getProjectById(projectId);

          if (response.success && response.data) {
            const project = response.data;

            const formattedProject: FormattedProject = {
              id: project.id,
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
              teamMembers: project.roles
                .filter((role: any) => role.filled && role.user)
                .map((role: any) => {
                  const user = typeof role.user === 'object' ? role.user : null;
                  return {
                    id: user?.id || '',
                    name: user?.preferredName || `${user?.firstName} ${user?.lastName}` || 'Unknown',
                    role: role.title,
                    university: user?.university || '',
                    profilePic: user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`,
                    status: 'Active',
                    joinedAt: new Date(project.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                  };
                }),
              openRoles: project.roles
                .filter((role: any) => !role.filled)
                .map((role: any, index: number) => ({
                  id: `role-${index}`,
                  title: role.title,
                  description: role.description,
                  applicants: 0,
                })),
              applicants: 0,
              recommendations: 0,
            };

            savedProjectsData.push(formattedProject);
          }
        } catch (error) {
          console.error(`Error fetching saved project ${projectId}:`, error);
          // Continue with other projects even if one fails
        }
      }

      setSavedProjects(savedProjectsData);
    } catch (err: any) {
      console.error('Error fetching saved projects:', err);
    }
  };

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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
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
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background-gradient">
      {/* Fixed Hamburger Menu Button - Always visible */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-6 left-6 z-[100] p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Open navigation menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Spacer for fixed hamburger menu */}
            <div className="w-10 mr-3"></div>

            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold">My Projects</h1>
            <div className="ml-4 flex gap-2">
              <button
                onClick={() => setCurrentView('posted')}
                className={`px-4 py-1 text-sm font-medium ${
                  currentView === 'posted'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Posted Projects ({projects.length})
              </button>
              <button
                onClick={() => setCurrentView('saved')}
                className={`px-4 py-1 text-sm font-medium ${
                  currentView === 'saved'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Saved Projects ({savedProjects.length})
              </button>
              <button
                onClick={() => setCurrentView('joined')}
                className={`px-4 py-1 text-sm font-medium ${
                  currentView === 'joined'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Projects Joined (0)
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Project
          </button>
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
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all"
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
                          <div className="text-xs text-orange-500 font-medium">
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
                              ? 'text-orange-500 border-b-2 border-orange-500'
                              : 'text-slate-600'
                          }`}
                          onClick={() => changeTab(project.id, 'team')}
                        >
                          Team Members ({project.teamMembers.length})
                        </button>
                        <button
                          className={`px-6 py-3 text-sm font-medium ${
                            activeTab[project.id] === 'applicants'
                              ? 'text-orange-500 border-b-2 border-orange-500'
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
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
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
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all">
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
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No joined projects</h3>
            <p className="text-slate-600 mb-6">
              Projects you've joined as a team member will appear here!
            </p>
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
