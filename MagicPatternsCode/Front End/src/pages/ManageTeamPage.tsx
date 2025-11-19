import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  XIcon,
  UserPlusIcon,
  UserMinusIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  SearchIcon,
} from 'lucide-react';
import apiClient from '../utils/apiClient';
import { Project } from '../types/api';
import Navigation from '../components/Navigation';
import { getProfilePictureUrl } from '../utils/profileHelpers';

interface TeamMember {
  id: string;
  roleId: string;
  name: string;
  email?: string;
  university: string;
  profilePic: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface Application {
  id: string;
  user: {
    id: string;
    name: string;
    email?: string;
    university: string;
    profilePic: string;
    bio?: string;
  };
  role: string;
  message: string;
  fitScore?: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}

const ManageTeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'team' | 'applications'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingApp, setProcessingApp] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProject();
    fetchApplications();
  }, [id]);

  const fetchProject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const projectResponse = await apiClient.getProjectById(id);

      if (projectResponse.success && projectResponse.data) {
        const proj = projectResponse.data;
        setProject(proj);

        const members: TeamMember[] = (proj.roles || [])
          .filter((role: any) => role.filled && role.user)
          .map((role: any) => {
            const user = typeof role.user === 'object' ? role.user : null;
            return {
              id: user?.id || user?._id || '',
              roleId: role._id || '',
              name: user?.preferredName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown',
              email: user?.email,
              university: user?.university || '',
              profilePic:
                getProfilePictureUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`,
              role: role.title,
              status: 'Active',
              joinedAt: new Date(proj.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            };
          });

        setTeamMembers(members);
      }
    } catch (error: any) {
      console.error('Error fetching project data:', error);
      alert('Failed to load project data');
      navigate('/my-projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!id) return;

    try {
      const response = await apiClient.getProjectApplicants(id);

      if (response.success && Array.isArray(response.data)) {
        const formatted = response.data.map((app: any) => {
          const user = typeof app.user === 'object' ? app.user : null;
          return {
            id: app.id || app._id,
            user: {
              id: user?.id || user?._id || '',
              name: user?.preferredName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown',
              email: user?.email,
              university: user?.university || 'Unknown University',
              profilePic:
                user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`,
              bio: user?.bio,
            },
            role: app.role,
            message: app.message || '',
            status: app.status,
            fitScore: app.fitScore,
            createdAt: app.createdAt,
          } as Application;
        });
        setApplications(formatted);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!project?.id) return;
    if (!window.confirm('Accept this application and add the member to your team?')) {
      return;
    }

    try {
      setProcessingApp(applicationId);
      await apiClient.updateApplicationStatus(project.id, applicationId, 'Accepted');
      await fetchApplications();
      await fetchProject();
      alert('Application accepted successfully!');
    } catch (error: any) {
      console.error('Error accepting application:', error);
      alert(error.response?.data?.message || 'Failed to accept application');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    if (!project?.id) return;
    if (!window.confirm('Reject this application?')) {
      return;
    }

    try {
      setProcessingApp(applicationId);
      await apiClient.updateApplicationStatus(project.id, applicationId, 'Rejected');
      await fetchApplications();
      alert('Application rejected.');
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      alert(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!project?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from the team?\n\nThis will:\n- Remove them from their assigned role\n- Make the role available for new applicants\n- Notify the member about the removal`
    );

    if (!confirmed) return;

    try {
      await apiClient.removeTeamMember(project.id, member.roleId);
      await fetchProject();
      alert(`${member.name} has been removed from the team.`);
    } catch (error: any) {
      console.error('Error removing team member:', error);
      alert(error.response?.data?.message || 'Failed to remove team member');
    }
  };

  const handleMessageMember = async (memberId: string) => {
    try {
      const response = await apiClient.createChat(memberId);
      const chat = response.data;
      const chatId = (chat as any)?.id || (chat as any)?._id;

      if (!chatId) {
        throw new Error('Unable to determine chat ID');
      }

      navigate(`/dashboard/chat?chatId=${chatId}`);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      alert(error.response?.data?.message || 'Failed to start conversation');
    }
  };

  const filteredTeamMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApplications = applications.filter((app) => app.status === 'Pending');
  const processedApplications = applications.filter((app) => app.status !== 'Pending');

  if (loading) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cardinal border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/my-projects')}
            className="px-4 py-2 bg-cardinal text-white rounded-lg hover:bg-cardinal"
          >
            Back to My Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background-gradient">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/project/${id}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Manage Team</h1>
                <p className="text-sm text-slate-600 mt-1">{project.title}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="text-slate-500 hover:text-slate-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Team Members</p>
                  <p className="text-2xl font-bold text-slate-900">{teamMembers.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <UserPlusIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Open Roles</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {project.roles.filter((r) => !r.filled).length}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <AlertCircleIcon className="h-6 w-6 text-cardinal" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingApplications.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MailIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'team'
                      ? 'text-cardinal border-b-2 border-cardinal'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Team Members ({teamMembers.length})
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'applications'
                      ? 'text-cardinal border-b-2 border-cardinal'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Applications ({applications.length})
                  {pendingApplications.length > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingApplications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Team Members Tab */}
            {activeTab === 'team' && (
              <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search team members..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Team Members List */}
                {filteredTeamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={member.profilePic}
                            alt={member.name}
                            className="w-12 h-12 rounded-full ring-2 ring-slate-200"
                          />
                          <div>
                            <h3 className="font-semibold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-600">{member.role}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {member.university} • Joined {member.joinedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMessageMember(member.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                          >
                            <MailIcon className="h-4 w-4" />
                            Message
                          </button>
                          <button
                              onClick={() => handleRemoveMember(member)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
                          >
                            <UserMinusIcon className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlusIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">
                      {searchQuery ? 'No team members found matching your search' : 'No team members yet'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="p-6">
                {pendingApplications.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4">Pending Applications</h3>
                      <div className="space-y-4">
                        {pendingApplications.map((app) => (
                          <div
                            key={app.id}
                            className="border border-slate-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={app.user.profilePic}
                                  alt={app.user.name}
                                  className="w-10 h-10 rounded-full ring-2 ring-slate-200"
                                />
                                <div>
                                  <h4 className="font-semibold text-slate-900">{app.user.name}</h4>
                                  <p className="text-sm text-slate-600">{app.user.university}</p>
                                </div>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {app.role}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded">
                              {app.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-500">
                                Applied {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRejectApplication(app.id)}
                                  disabled={processingApp === app.id}
                                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleAcceptApplication(app.id)}
                                  disabled={processingApp === app.id}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Accept
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {processedApplications.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Processed Applications</h3>
                        <div className="space-y-4">
                          {processedApplications.map((app) => (
                            <div
                              key={app.id}
                              className="border border-slate-200 rounded-lg p-4 opacity-60"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.user.profilePic}
                                    alt={app.user.name}
                                    className="w-10 h-10 rounded-full ring-2 ring-slate-200"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-slate-900">{app.user.name}</h4>
                                    <p className="text-sm text-slate-600">{app.role}</p>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    app.status === 'Accepted'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MailIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No applications yet</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Applications will appear here when users apply to your project roles
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTeamPage;
