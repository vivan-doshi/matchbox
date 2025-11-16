import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LinkedinIcon, GithubIcon, ExternalLinkIcon, EditIcon, FolderIcon, FileTextIcon, UploadIcon, CheckIcon, XIcon, MenuIcon, DownloadIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { apiClient } from '../utils/apiClient';
import { Project, User } from '../types/api';
import { getProfilePictureUrl, getResumeUrl, getResumeFilename } from '../utils/profileHelpers';

type ProfileProjectCard = Project & {
  userRoleLabel: string;
  ownership: 'creator' | 'member';
};

const ProfilePage: React.FC = () => {
  const { user: authUser, updateUserProfile, loading: authLoading, refreshUser } = useAuth();
  const { userId: viewedUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const isOwnProfile = !viewedUserId || viewedUserId === authUser?.id;
  const [externalUser, setExternalUser] = useState<User | null>(null);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState<'active' | 'completed'>('active');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileProjects, setProfileProjects] = useState<ProfileProjectCard[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const canEdit = isOwnProfile;

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (isOwnProfile || !viewedUserId) {
      setExternalUser(null);
      setExternalError(null);
      return;
    }

    const fetchExternalProfile = async () => {
      try {
        setExternalLoading(true);
        setExternalError(null);
        console.log('[ProfilePage] Fetching external profile for userId:', viewedUserId);

        const response = await apiClient.getUserById(viewedUserId);
        console.log('[ProfilePage] API Response:', response);

        if (response.success && response.data) {
          console.log('[ProfilePage] Setting external user:', response.data);
          setExternalUser(response.data);
        } else {
          console.log('[ProfilePage] Response missing data:', response);
          setExternalError('Unable to load this profile.');
        }
      } catch (error: any) {
        console.error('[ProfilePage] Failed to load external profile', error);
        console.error('[ProfilePage] Error details:', error.response?.data);
        const message = error.response?.data?.message || error.message || 'Unable to load this profile.';
        setExternalError(message);
      } finally {
        setExternalLoading(false);
      }
    };

    fetchExternalProfile();
  }, [isOwnProfile, viewedUserId]);

  const activeProfileUser = isOwnProfile ? authUser : externalUser;

  const resumeLink = useMemo(() => {
    const resumeUrl = getResumeUrl(activeProfileUser?.resume);
    return resumeUrl
      ? {
          url: resumeUrl,
          filename: getResumeFilename(activeProfileUser?.resume) || 'Resume',
          uploadedAt: activeProfileUser?.resume?.uploadedAt || '',
        }
      : null;
  }, [activeProfileUser?.resume]);

  // Debugging: Track resume data changes
  useEffect(() => {
    console.log('[ProfilePage] Resume data:', {
      hasActiveUser: !!activeProfileUser,
      hasResume: !!activeProfileUser?.resume,
      resumeUrl: activeProfileUser?.resume?.url,
      resumeDataUrl: activeProfileUser?.resume?.dataUrl,
      resumeFilename: activeProfileUser?.resume?.filename,
      resumeLink: resumeLink,
    });
  }, [activeProfileUser?.resume, resumeLink]);

  const originalUser = useMemo(() => {
    if (!activeProfileUser) {
      return {
        name: 'Loading...',
        university: '',
        major: '',
        graduationYear: '',
        bio: '',
        profilePicture: '',
        links: {
          linkedin: '',
          github: '',
          portfolio: '',
          resume: { url: '', filename: '', uploadedAt: '' },
        },
        skills: [],
        interests: [],
        weeklyAvailability: { hoursPerWeek: 0 },
      };
    }

    return {
      name: activeProfileUser.preferredName || `${activeProfileUser.firstName} ${activeProfileUser.lastName}`,
      university: activeProfileUser.university,
      major: activeProfileUser.major,
      graduationYear: activeProfileUser.graduationYear?.toString() || 'N/A',
      bio: activeProfileUser.bio || '',
      profilePicture:
        getProfilePictureUrl(activeProfileUser.profilePicture) ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          activeProfileUser.firstName + ' ' + activeProfileUser.lastName
        )}&size=300&background=f97316&color=fff`,
      links: {
        linkedin: activeProfileUser.professionalLinks?.linkedin || '',
        github: activeProfileUser.professionalLinks?.github || '',
        portfolio: activeProfileUser.professionalLinks?.portfolio || '',
        resume: resumeLink || { url: '', filename: '', uploadedAt: '' },
      },
      skills: activeProfileUser.skills || [],
      interests: activeProfileUser.interests || [],
      weeklyAvailability: activeProfileUser.weeklyAvailability || { hoursPerWeek: 0 },
    };
  }, [activeProfileUser, resumeLink]);

  const user = originalUser;

  // Editable state
  const [editedName, setEditedName] = useState(originalUser.name);
  const [editedBio, setEditedBio] = useState(originalUser.bio);
  const [editedUniversity, setEditedUniversity] = useState(originalUser.university);
  const [editedMajor, setEditedMajor] = useState(originalUser.major);
  const [editedGradYear, setEditedGradYear] = useState(originalUser.graduationYear);
  const [editedLinkedin, setEditedLinkedin] = useState(originalUser.links.linkedin);
  const [editedGithub, setEditedGithub] = useState(originalUser.links.github);
  const [editedPortfolio, setEditedPortfolio] = useState(originalUser.links.portfolio);
  const [editedInterests, setEditedInterests] = useState<string[]>(originalUser.interests);
  const [editedHoursPerWeek, setEditedHoursPerWeek] = useState<number>(originalUser.weeklyAvailability.hoursPerWeek);
  const [editedSkills, setEditedSkills] = useState<Array<{name: string; proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert'}>>(originalUser.skills);
  const [newInterest, setNewInterest] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'Beginner' | 'Intermediate' | 'Fluent' | 'Expert'>('Beginner');

  // Update editable state when user data changes
  useEffect(() => {
    if (canEdit && activeProfileUser) {
      setEditedName(originalUser.name);
      setEditedBio(originalUser.bio);
      setEditedUniversity(originalUser.university);
      setEditedMajor(originalUser.major);
      setEditedGradYear(originalUser.graduationYear);
      setEditedLinkedin(originalUser.links.linkedin);
      setEditedGithub(originalUser.links.github);
      setEditedPortfolio(originalUser.links.portfolio);
      setEditedInterests(originalUser.interests);
      setEditedHoursPerWeek(originalUser.weeklyAvailability.hoursPerWeek);
      setEditedSkills(originalUser.skills);
    }
  }, [canEdit, activeProfileUser, originalUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login');
    }
  }, [authLoading, authUser, navigate]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('[ProfilePage] State updated:', {
      isOwnProfile,
      viewedUserId,
      authUser: authUser?.email,
      authLoading,
      externalUser: externalUser?.email,
      externalLoading,
      externalError,
      activeProfileUser: activeProfileUser?.email
    });
  }, [isOwnProfile, viewedUserId, authUser, authLoading, externalUser, externalLoading, externalError, activeProfileUser]);

  useEffect(() => {
    if (authUser) {
      console.log('[ProfilePage] User data loaded:', {
        email: authUser.email,
        skillsCount: authUser.skills?.length || 0,
        skills: authUser.skills,
        interests: authUser.interests,
      });
    }
  }, [authUser]);

  const fetchProfileProjects = useCallback(async () => {
    if (!authUser?.id) {
      setProfileProjects([]);
      setProjectsError(null);
      return;
    }

    try {
      setProjectsLoading(true);
      setProjectsError(null);

      const [createdResponse, joinedResponse] = await Promise.all([
        apiClient.getMyProjects(),
        apiClient.getJoinedProjects(),
      ]);

      if (!createdResponse.success || !joinedResponse.success) {
        const message =
          createdResponse.message ||
          joinedResponse.message ||
          'Failed to load some projects.';
        setProjectsError(message);
      } else {
        setProjectsError(null);
      }

      const createdProjects = createdResponse.success && createdResponse.data ? createdResponse.data : [];
      const joinedProjects = joinedResponse.success && joinedResponse.data ? joinedResponse.data : [];

      const normalizedCreated: ProfileProjectCard[] = createdProjects.map((project) => ({
        ...project,
        userRoleLabel: 'Creator',
        ownership: 'creator',
      }));

      const normalizedJoined: ProfileProjectCard[] = joinedProjects.map((project) => {
        const matchingRole = project.roles?.find((role) => {
          if (!role.user) return false;
          if (typeof role.user === 'string') {
            return role.user === authUser.id;
          }
          const populatedUser = role.user;
          return (
            populatedUser.id === authUser.id ||
            (populatedUser as any)._id === authUser.id
          );
        });

        return {
          ...project,
          userRoleLabel: matchingRole?.title || 'Team Member',
          ownership: 'member',
        };
      });

      setProfileProjects([...normalizedCreated, ...normalizedJoined]);
    } catch (error: any) {
      console.error('[ProfilePage] Error fetching profile projects:', error);
      const message =
        error.response?.data?.message || error.message || 'Failed to load projects.';
      setProjectsError(message);
      setProfileProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!isOwnProfile) {
      setProfileProjects([]);
      return;
    }
    if (!authLoading) {
      fetchProfileProjects();
    }
  }, [authLoading, fetchProfileProjects, isOwnProfile]);

  if (!isOwnProfile && externalError) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Unavailable</h2>
          <p className="text-slate-600 mb-4">{externalError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (
    (isOwnProfile && (authLoading || !authUser)) ||
    (!isOwnProfile && (externalLoading || !externalUser))
  ) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle case where external user data is not found
  if (!isOwnProfile && !externalUser && !externalLoading) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">User Not Found</h2>
          <p className="text-slate-600 mb-6">This profile could not be loaded.</p>
          <button
            onClick={() => navigate('/dashboard/discover')}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600"
          >
            Back to Discover People
          </button>
        </div>
      </div>
    );
  }

  const handleEditProfile = async () => {
    if (!canEdit) return;
    if (isEditMode) {
      try {
        setSaving(true);
        console.log('[ProfilePage] Starting profile update...');

        // Parse name into first and last
        const nameParts = editedName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const updateData = {
          firstName,
          lastName,
          bio: editedBio,
          university: editedUniversity,
          major: editedMajor,
          graduationYear: editedGradYear ? parseInt(editedGradYear) : undefined,
          professionalLinks: {
            linkedin: editedLinkedin || undefined,
            github: editedGithub || undefined,
            portfolio: editedPortfolio || undefined,
          },
          interests: editedInterests,
          weeklyAvailability: {
            hoursPerWeek: editedHoursPerWeek
          },
          skills: editedSkills,
        };

        console.log('[ProfilePage] Update data:', updateData);
        console.log('[ProfilePage] User ID:', authUser?.id);

        await updateUserProfile(updateData);

        console.log('[ProfilePage] Profile updated successfully');
        setIsEditMode(false);
      } catch (error: any) {
        console.error('[ProfilePage] Error updating profile:', error);
        console.error('[ProfilePage] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        alert(`Failed to update profile: ${error.message || 'Please try again.'}`);
      } finally {
        setSaving(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleCancel = () => {
    if (!canEdit) return;
    // Reset all edited values to original
    setEditedName(originalUser.name);
    setEditedBio(originalUser.bio);
    setEditedUniversity(originalUser.university);
    setEditedMajor(originalUser.major);
    setEditedGradYear(originalUser.graduationYear);
    setEditedLinkedin(originalUser.links.linkedin);
    setEditedGithub(originalUser.links.github);
    setEditedPortfolio(originalUser.links.portfolio);
    setEditedInterests(originalUser.interests);
    setEditedHoursPerWeek(originalUser.weeklyAvailability.hoursPerWeek);
    setEditedSkills(originalUser.skills);
    setIsEditMode(false);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !editedInterests.includes(newInterest.trim())) {
      setEditedInterests([...editedInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setEditedInterests(editedInterests.filter(i => i !== interest));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Resume must be smaller than 10MB.');
      return;
    }

    try {
      setUploadingResume(true);

      // Upload resume using FormData (like signup flow)
      if (authUser?.id) {
        await apiClient.updateUserResume(authUser.id, file);
        await refreshUser();
        setShowUploadSuccess(true);
        setTimeout(() => setShowUploadSuccess(false), 2500);
      }
    } catch (error: any) {
      console.error('[ProfilePage] Resume upload failed:', error);
      alert(error?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileImageError('Please upload a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileImageError('Profile pictures must be smaller than 5MB.');
      return;
    }

    try {
      setProfileImageUploading(true);
      setProfileImageError(null);

      // Upload profile picture using FormData (like signup flow)
      if (authUser?.id) {
        await apiClient.updateUserProfilePicture(authUser.id, file);
        await refreshUser();
      }
    } catch (error: any) {
      console.error('[ProfilePage] Profile image upload failed:', error);
      setProfileImageError(error?.message || 'Failed to upload profile picture.');
    } finally {
      setProfileImageUploading(false);
    }
  };

  const isCompletedStatus = (status?: string) =>
    (status || '').toLowerCase() === 'completed';

  const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadgeClasses = (status?: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'bg-green-100 text-green-700';
    if (normalized === 'in progress') return 'bg-blue-100 text-blue-700';
    if (normalized === 'planning') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  const activeProjects = profileProjects.filter(project => !isCompletedStatus(project.status));
  const completedProjects = profileProjects.filter(project => isCompletedStatus(project.status));
  return <div className="min-h-screen page-background-gradient">
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
          {canEdit && (
            <div className="flex items-center">
              <Link to="/my-projects" className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all mr-2">
                <FolderIcon className="h-4 w-4 mr-1" />
                My Projects
              </Link>
              <button
                onClick={handleEditProfile}
                className="flex items-center text-sm px-4 py-2 rounded-full font-medium transition-all cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg"
              >
                {isEditMode ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <EditIcon className="h-4 w-4 mr-1" />
                    Edit Profile
                  </>
                )}
              </button>
              {isEditMode && (
                <button
                  onClick={handleCancel}
                  className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all cursor-pointer ml-2"
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0 sm:mr-6">
                <div className="relative">
                <img src={user.profilePicture} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm" />
                {canEdit && (
                  <label className="absolute -bottom-2 -right-2 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-600 shadow hover:text-orange-600 transition-colors cursor-pointer">
                    {profileImageUploading ? 'Uploading...' : 'Change'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={profileImageUploading}
                      className="hidden"
                    />
                  </label>
                )}
                </div>
                {canEdit && profileImageError && (
                  <p className="text-xs text-red-600 mt-2">{profileImageError}</p>
                )}
              </div>
              <div className="flex-1">
                {isEditMode ? (
                  <div className="space-y-3 mb-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full text-2xl font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Name"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={editedMajor}
                        onChange={(e) => setEditedMajor(e.target.value)}
                        className="flex-1 min-w-[150px] text-slate-600 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Major"
                      />
                      <input
                        type="text"
                        value={editedUniversity}
                        onChange={(e) => setEditedUniversity(e.target.value)}
                        className="flex-1 min-w-[200px] text-slate-600 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="University"
                      />
                      <input
                        type="text"
                        value={editedGradYear}
                        onChange={(e) => setEditedGradYear(e.target.value)}
                        className="w-24 text-slate-600 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Year"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                    <p className="text-slate-600 mb-3">
                      {user.major} @ {user.university} • Class of{' '}
                      {user.graduationYear}
                    </p>
                  </>
                )}
                {isEditMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="h-4 w-4 text-blue-700" />
                      <input
                        type="text"
                        value={editedLinkedin}
                        onChange={(e) => setEditedLinkedin(e.target.value)}
                        className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <GithubIcon className="h-4 w-4 text-slate-800" />
                      <input
                        type="text"
                        value={editedGithub}
                        onChange={(e) => setEditedGithub(e.target.value)}
                        className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="GitHub URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLinkIcon className="h-4 w-4 text-purple-700" />
                      <input
                        type="text"
                        value={editedPortfolio}
                        onChange={(e) => setEditedPortfolio(e.target.value)}
                        className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Portfolio URL"
                      />
                    </div>

                    {/* Resume Section in Edit Mode */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        Resume
                      </label>

                      {user.links.resume?.url ? (
                        <div className="space-y-2">
                          {/* Current Resume Display */}
                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <FileTextIcon className="h-4 w-4 text-slate-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                {user.links.resume.filename || 'Resume'}
                              </p>
                              {user.links.resume.uploadedAt && (
                                <p className="text-xs text-slate-500">
                                  Uploaded {new Date(user.links.resume.uploadedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowResumePreview(true)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              View
                            </button>
                          </div>

                          {/* Change Resume Button */}
                          <label className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                            <UploadIcon className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">
                              {uploadingResume ? 'Uploading...' : 'Change Resume'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleResumeUpload}
                              className="hidden"
                              disabled={uploadingResume}
                            />
                          </label>
                        </div>
                      ) : (
                        /* No Resume - Upload Button */
                        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                          <UploadIcon className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {uploadingResume ? 'Uploading...' : 'Upload Resume (PDF, DOC, DOCX - Max 10MB)'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeUpload}
                            className="hidden"
                            disabled={uploadingResume}
                          />
                        </label>
                      )}

                      {/* Success Message */}
                      {showUploadSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckIcon className="h-4 w-4" />
                          Resume uploaded successfully!
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.links.linkedin ? (
                      <a
                        href={user.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <LinkedinIcon className="h-3 w-3 mr-1" />
                        LinkedIn
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full cursor-not-allowed"
                      >
                        <LinkedinIcon className="h-3 w-3 mr-1" />
                        Add LinkedIn
                      </button>
                    )}
                    {user.links.github ? (
                      <a
                        href={user.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-slate-800 text-white px-3 py-1 rounded-full hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <GithubIcon className="h-3 w-3 mr-1" />
                        GitHub
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full cursor-not-allowed"
                      >
                        <GithubIcon className="h-3 w-3 mr-1" />
                        Add GitHub
                      </button>
                    )}
                    {user.links.portfolio ? (
                      <a
                        href={user.links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <ExternalLinkIcon className="h-3 w-3 mr-1" />
                        Portfolio
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full cursor-not-allowed"
                      >
                        <ExternalLinkIcon className="h-3 w-3 mr-1" />
                        Add Portfolio
                      </button>
                    )}
                    {user.links.resume?.url ? (
                      <>
                        <button
                          onClick={() => setShowResumePreview(true)}
                          className="flex items-center text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                          <FileTextIcon className="h-3 w-3 mr-1" />
                          Resume
                        </button>
                        {canEdit && (
                          <label className="flex items-center text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                            <UploadIcon className="h-3 w-3 mr-1" />
                            {uploadingResume ? 'Uploading...' : 'Change Resume'}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleResumeUpload}
                              className="hidden"
                              disabled={uploadingResume}
                            />
                          </label>
                        )}
                      </>
                    ) : canEdit ? (
                      <label className="flex items-center text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                        <UploadIcon className="h-3 w-3 mr-1" />
                        {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeUpload}
                          className="hidden"
                          disabled={uploadingResume}
                        />
                      </label>
                    ) : (
                      <span className="flex items-center text-xs text-slate-400">
                        Resume not uploaded
                      </span>
                    )}
                    {canEdit && showUploadSuccess && (
                      <span className="flex items-center text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Uploaded!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-bold mb-3">About</h3>
              {isEditMode ? (
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full text-slate-700 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-700">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold mb-4">Skills</h3>
              <div
                className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                {isEditMode ? (
                  <div className="space-y-3">
                    {/* Existing Skills with Proficiency Selector */}
                    {editedSkills.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {editedSkills.map((skill, index) => {
                          const proficiencyLevels: ('Beginner' | 'Intermediate' | 'Fluent' | 'Expert')[] = ['Beginner', 'Intermediate', 'Fluent', 'Expert'];
                          const currentLevelIndex = proficiencyLevels.indexOf(skill.proficiency);

                          return (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-sm font-semibold text-slate-800">{skill.name}</h4>
                                  <span className="text-xs text-slate-500">
                                    {currentLevelIndex + 1}/4
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditedSkills(editedSkills.filter((_, i) => i !== index))}
                                  className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="flex gap-2">
                                {proficiencyLevels.map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => {
                                      const newSkills = [...editedSkills];
                                      newSkills[index] = { ...skill, proficiency: level };
                                      setEditedSkills(newSkills);
                                    }}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-all ${
                                      skill.proficiency === level
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add New Skill */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Add New Skill</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Skill name (e.g., JavaScript, Python)"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                        />
                        <div className="flex gap-2">
                          {(['Beginner', 'Intermediate', 'Fluent', 'Expert'] as const).map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setNewSkillProficiency(level)}
                              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-all ${
                                newSkillProficiency === level
                                  ? 'bg-orange-500 text-white border-orange-500'
                                  : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newSkillName.trim()) {
                              setEditedSkills([...editedSkills, { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
                              setNewSkillName('');
                              setNewSkillProficiency('Beginner');
                            }
                          }}
                          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          Add Skill
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {user.skills.length > 0 ? (
                      <div className="space-y-3">
                        {user.skills.map((skill, index) => {
                          const proficiencyLevels: ('Beginner' | 'Intermediate' | 'Fluent' | 'Expert')[] = ['Beginner', 'Intermediate', 'Fluent', 'Expert'];
                          const currentLevelIndex = proficiencyLevels.indexOf(skill.proficiency);

                          return (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-sm font-semibold text-slate-800">{skill.name}</h4>
                                  <span className="text-xs text-slate-500">
                                    {currentLevelIndex + 1}/4
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {proficiencyLevels.map((level) => (
                                  <div
                                    key={level}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border text-center ${
                                      skill.proficiency === level
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white text-slate-400 border-slate-200'
                                    }`}
                                  >
                                    {level}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No skills added yet</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold mb-4">Interests & Availability</h3>
              <div
                className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                {/* Weekly Availability */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-slate-700">Weekly Availability</h4>
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="168"
                          value={editedHoursPerWeek}
                          onChange={(e) => setEditedHoursPerWeek(parseInt(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Hours per week"
                        />
                        <span className="text-sm text-slate-600 font-medium">hours/week</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[5, 10, 15, 20].map(hours => (
                          <button
                            key={hours}
                            type="button"
                            onClick={() => setEditedHoursPerWeek(hours)}
                            className={`px-3 py-1 text-xs rounded-md border transition-all ${
                              editedHoursPerWeek === hours
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            {hours} hrs
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex flex-col items-center justify-center px-4 py-2 bg-white rounded-lg border-2 border-orange-500">
                        <span className="text-3xl font-bold text-orange-500">
                          {user.weeklyAvailability.hoursPerWeek}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">hours/week</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Available for {user.weeklyAvailability.hoursPerWeek} hours of collaboration per week
                      </p>
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-slate-700">Interests</h4>
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editedInterests.map((interest, index) => (
                          <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-2">
                            {interest}
                            <button
                              onClick={() => handleRemoveInterest(interest)}
                              className="text-red-500 hover:text-red-700 font-bold"
                              type="button"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                          className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="Add new interest..."
                        />
                        <button
                          onClick={handleAddInterest}
                          type="button"
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Project Tabs */}
        {isOwnProfile && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">My Projects</h3>
              <Link to="/my-projects" className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
                View all
              </Link>
            </div>

            {projectsError && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{projectsError}</span>
                <button
                  onClick={fetchProfileProjects}
                  className="text-red-700 underline underline-offset-2 hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveProjectTab('active')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                  activeProjectTab === 'active'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Active Projects
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                  {activeProjects.length}
                </span>
              </button>
              <button
                onClick={() => setActiveProjectTab('completed')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
                  activeProjectTab === 'completed'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Completed Projects
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                  {completedProjects.length}
                </span>
              </button>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjectTab === 'active' && (
                  <>
                    {activeProjects.length > 0 ? (
                      activeProjects.map(project => {
                        const projectId = project.id || (project as any)._id;
                        const deadlineLabel = formatDate(project.deadline);
                        return (
                          <Link
                            key={projectId}
                            to={`/project/${projectId}`}
                            className="block border border-slate-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 hover:text-orange-600">
                                {project.title}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeClasses(project.status)}`}>
                                {project.status || 'Active'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs text-slate-500">
                                Role: {project.userRoleLabel}
                              </p>
                              {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {project.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={`${projectId}-active-tag-${idx}`} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {deadlineLabel && (
                              <p className="text-xs text-slate-400 mt-2">
                                Deadline: {deadlineLabel}
                              </p>
                            )}
                          </Link>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <p className="mb-2">No active projects yet</p>
                        <Link
                          to="/dashboard"
                          className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                        >
                          Explore projects to join
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {activeProjectTab === 'completed' && (
                  <>
                    {completedProjects.length > 0 ? (
                      completedProjects.map(project => {
                        const projectId = project.id || (project as any)._id;
                        const updatedLabel = formatDate(project.updatedAt);
                        return (
                          <Link
                            key={projectId}
                            to={`/project/${projectId}`}
                            className="block border border-slate-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 hover:text-orange-600">
                                {project.title}
                              </h4>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Completed
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-slate-500">Role: {project.userRoleLabel}</p>
                                {updatedLabel && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    Updated: {updatedLabel}
                                  </p>
                                )}
                              </div>
                              {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {project.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={`${projectId}-completed-tag-${idx}`} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <p>No completed projects yet</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Resume Preview Modal */}
      {showResumePreview && user.links.resume?.url && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResumePreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Resume Preview</h3>
              <div className="flex items-center gap-2">
                <a
                  href={user.links.resume.url}
                  download={user.links.resume.filename || 'resume.pdf'}
                  className="flex items-center text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Download
                </a>
                <a
                  href={user.links.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-1" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => setShowResumePreview(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XIcon className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Modal Body - PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={user.links.resume.url}
                className="w-full h-full"
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>;
};
export default ProfilePage;
