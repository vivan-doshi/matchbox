import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon, PlusIcon, Loader2Icon, CheckCircleIcon } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  rawId?: string;
}

interface ProjectOption {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface InviteToProjectModalProps {
  user: User;
  onClose: () => void;
}

const InviteToProjectModal: React.FC<InviteToProjectModalProps> = ({ user, onClose }) => {
  const navigate = useNavigate();
  const [userProjects, setUserProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getMyProjects();
        if (response.success && response.data) {
          const formattedProjects: ProjectOption[] = response.data
            .filter(project => project.status !== 'Completed')
            .map(project => ({
              id: project.id,
              name: project.title,
              description: project.description,
              status: project.status,
            }));

          setUserProjects(formattedProjects);
          if (formattedProjects.length === 1) {
            setSelectedProject(formattedProjects[0].id);
          }
        } else {
          setUserProjects([]);
        }
      } catch (err: any) {
        console.error('Failed to load projects:', err);
        const message = err.response?.data?.message || err.message || 'Failed to load your projects.';
        setError(message);
        setUserProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSendInvite = async () => {
    if (!selectedProject) return;

    try {
      setSending(true);
      setError(null);

      const inviteeId = user.id || user.rawId;
      if (!inviteeId) {
        setError('Unable to determine the user to invite.');
        return;
      }

      await apiClient.inviteUserToProject(selectedProject, {
        inviteeId,
        message: message.trim() || undefined,
      });

      setSuccess(true);

      // Close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      const message =
        (error as any)?.response?.data?.message || (error as Error).message || 'Failed to send invitation. Please try again.';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const handleCreateProject = () => {
    onClose();
    navigate('/dashboard', { state: { openCreateModal: true } });
  };

  // Close on background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invite to Project</h2>
            <p className="text-sm text-slate-600 mt-1">
              Invite {user.firstName} {user.lastName} to collaborate
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={sending}
          >
            <XIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="h-8 w-8 text-cardinal animate-spin" />
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Invitation Sent!
              </h3>
              <p className="text-slate-600 text-center">
                {user.firstName} will be notified of your project invitation.
              </p>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Active Projects
              </h3>
              <p className="text-slate-600 mb-6">
                You don't have any active projects yet. Create one to start inviting collaborators.
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-cardinal to-cardinal-light text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Create a Project
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-4 mb-6">
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-slate-600">Will receive an invitation</p>
                </div>
              </div>

              {/* Project Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-cardinal outline-none transition-all"
                  disabled={sending}
                >
                  <option value="">Choose a project...</option>
                  {userProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {selectedProject && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                      {userProjects.find(p => p.id === selectedProject)?.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${user.firstName}, I think you'd be a great fit for this project! Would love to have you on the team.`}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-cardinal outline-none resize-none transition-all"
                  disabled={sending}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    Add a personal touch to your invitation
                  </p>
                  <p className="text-xs text-slate-500">
                    {message.length}/500
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={!selectedProject || sending}
                  className="flex-1 bg-gradient-to-r from-cardinal to-cardinal-light text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteToProjectModal;
