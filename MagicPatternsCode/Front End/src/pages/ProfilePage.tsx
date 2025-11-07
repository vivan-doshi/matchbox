import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LinkedinIcon, GithubIcon, ExternalLinkIcon, EditIcon, FolderIcon, UploadIcon, CheckIcon, XIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState<'active' | 'completed'>('active');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable state - initialized from user data
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedPreferredName, setEditedPreferredName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedUniversity, setEditedUniversity] = useState('');
  const [editedMajor, setEditedMajor] = useState('');
  const [editedGradYear, setEditedGradYear] = useState('');
  const [editedLinkedin, setEditedLinkedin] = useState('');
  const [editedGithub, setEditedGithub] = useState('');
  const [editedPortfolio, setEditedPortfolio] = useState('');
  const [editedInterests, setEditedInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // Initialize form fields when user data loads
  useEffect(() => {
    if (user) {
      setEditedFirstName(user.firstName || '');
      setEditedLastName(user.lastName || '');
      setEditedPreferredName(user.preferredName || '');
      setEditedBio(user.bio || '');
      setEditedUniversity(user.university || '');
      setEditedMajor(user.major || '');
      setEditedGradYear(user.graduationYear?.toString() || '');
      setEditedLinkedin(user.professionalLinks?.linkedin || '');
      setEditedGithub(user.professionalLinks?.github || '');
      setEditedPortfolio(user.professionalLinks?.portfolio || '');
      setEditedInterests(user.interests || []);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const handleEditProfile = async () => {
    if (isEditMode) {
      // Save all changes
      try {
        setSaving(true);
        await updateUserProfile({
          firstName: editedFirstName,
          lastName: editedLastName,
          preferredName: editedPreferredName || undefined,
          bio: editedBio || undefined,
          university: editedUniversity,
          major: editedMajor,
          graduationYear: editedGradYear ? parseInt(editedGradYear) : undefined,
          professionalLinks: {
            linkedin: editedLinkedin || undefined,
            github: editedGithub || undefined,
            portfolio: editedPortfolio || undefined,
          },
          interests: editedInterests,
        });
        setIsEditMode(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      } finally {
        setSaving(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleCancel = () => {
    // Reset all edited values to original
    if (user) {
      setEditedFirstName(user.firstName || '');
      setEditedLastName(user.lastName || '');
      setEditedPreferredName(user.preferredName || '');
      setEditedBio(user.bio || '');
      setEditedUniversity(user.university || '');
      setEditedMajor(user.major || '');
      setEditedGradYear(user.graduationYear?.toString() || '');
      setEditedLinkedin(user.professionalLinks?.linkedin || '');
      setEditedGithub(user.professionalLinks?.github || '');
      setEditedPortfolio(user.professionalLinks?.portfolio || '');
      setEditedInterests(user.interests || []);
    }
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

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingResume(true);
      // Simulate upload - in real app, upload to server
      setTimeout(() => {
        setUploadingResume(false);
        setShowUploadSuccess(true);
        setTimeout(() => setShowUploadSuccess(false), 3000);
        console.log('Resume uploaded:', file.name);
      }, 1500);
    }
  };

  // Show loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Display name logic
  const displayName = user.preferredName || `${user.firstName} ${user.lastName}`;

  // Convert skills object to proficiency format for display
  const skillsArray = [
    { name: 'Programming', level: user.skills.programming },
    { name: 'Design', level: user.skills.design },
    { name: 'Marketing', level: user.skills.marketing },
    { name: 'Writing', level: user.skills.writing },
    { name: 'Research', level: user.skills.research },
  ].filter(skill => skill.level > 0);

  // Mock projects for now - in real app, fetch from API
  const mockProjects = [
    {
      id: '1',
      title: 'Campus Events Platform',
      description: 'A platform for students to discover and RSVP to campus events.',
      role: 'Project Lead',
      status: 'active',
      startDate: '2024-01-01',
      tags: ['React', 'Node.js', 'MongoDB']
    },
  ];

  const activeProjects = mockProjects.filter(p => p.status === 'active');
  const completedProjects = mockProjects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen page-background-gradient">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-slate-600 hover:text-orange-500 transition-colors mr-4">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <div className="flex items-center">
            <Link to="/my-projects" className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all mr-2">
              <FolderIcon className="h-4 w-4 mr-1" />
              My Projects
            </Link>
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center text-sm text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-100 transition-all mr-2"
                  disabled={saving}
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleEditProfile}
                  className="flex items-center text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditProfile}
                className="flex items-center text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all"
              >
                <EditIcon className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=200&background=f97316&color=fff`}
                    alt={displayName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {isEditMode && (
                    <button className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isEditMode ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editedLastName}
                      onChange={(e) => setEditedLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="Last Name"
                    />
                    <input
                      type="text"
                      value={editedPreferredName}
                      onChange={(e) => setEditedPreferredName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="Preferred Name (optional)"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{displayName}</h2>
                    {user.preferredName && user.preferredName !== `${user.firstName} ${user.lastName}` && (
                      <p className="text-sm text-slate-600 mb-2">
                        ({user.firstName} {user.lastName})
                      </p>
                    )}
                  </>
                )}

                {isEditMode ? (
                  <div className="space-y-2 mt-3">
                    <input
                      type="text"
                      value={editedUniversity}
                      onChange={(e) => setEditedUniversity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="University"
                    />
                    <input
                      type="text"
                      value={editedMajor}
                      onChange={(e) => setEditedMajor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="Major"
                    />
                    <input
                      type="number"
                      value={editedGradYear}
                      onChange={(e) => setEditedGradYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="Graduation Year"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 mb-1">{user.university}</p>
                    <p className="text-slate-600 mb-2">{user.major} • Class of {user.graduationYear || 'N/A'}</p>
                  </>
                )}
              </div>

              {/* Professional Links */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Professional Links</h3>
                <div className="space-y-2">
                  {isEditMode ? (
                    <>
                      <input
                        type="url"
                        value={editedLinkedin}
                        onChange={(e) => setEditedLinkedin(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        placeholder="LinkedIn URL"
                      />
                      <input
                        type="url"
                        value={editedGithub}
                        onChange={(e) => setEditedGithub(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        placeholder="GitHub URL"
                      />
                      <input
                        type="url"
                        value={editedPortfolio}
                        onChange={(e) => setEditedPortfolio(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        placeholder="Portfolio URL"
                      />
                    </>
                  ) : (
                    <>
                      {user.professionalLinks?.linkedin && (
                        <a
                          href={user.professionalLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <LinkedinIcon className="h-4 w-4 mr-2" />
                          LinkedIn
                          <ExternalLinkIcon className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      {user.professionalLinks?.github && (
                        <a
                          href={user.professionalLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-slate-700 hover:text-slate-900 transition-colors"
                        >
                          <GithubIcon className="h-4 w-4 mr-2" />
                          GitHub
                          <ExternalLinkIcon className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      {user.professionalLinks?.portfolio && (
                        <a
                          href={user.professionalLinks.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      )}
                      {!user.professionalLinks?.linkedin && !user.professionalLinks?.github && !user.professionalLinks?.portfolio && (
                        <p className="text-sm text-slate-500 italic">No links added yet</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Resume Section */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Resume</h3>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      uploadingResume
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    {uploadingResume ? (
                      <Loader2Icon className="h-5 w-5 text-orange-500 animate-spin mr-2" />
                    ) : (
                      <UploadIcon className="h-5 w-5 text-slate-500 mr-2" />
                    )}
                    <span className="text-sm text-slate-700">
                      {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                    </span>
                  </label>
                  {showUploadSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-50 bg-opacity-95 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <CheckIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Uploaded!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">About Me</h3>
              {isEditMode ? (
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="Tell us about yourself, your interests, and what you're looking for in a project..."
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {user.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
                </p>
              )}
            </div>

            {/* Skills Section */}
            {skillsArray.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills</h3>
                <div className="space-y-4">
                  {skillsArray.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                        <span className="text-xs text-slate-500">{skill.level}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${(skill.level / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(isEditMode ? editedInterests : user.interests).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center"
                  >
                    {interest}
                    {isEditMode && (
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                {(isEditMode ? editedInterests : user.interests).length === 0 && (
                  <p className="text-sm text-slate-500 italic">No interests added yet</p>
                )}
              </div>
              {isEditMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="Add an interest..."
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
                <Link
                  to="/my-projects"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View All
                </Link>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveProjectTab('active')}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    activeProjectTab === 'active'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({activeProjects.length})
                </button>
                <button
                  onClick={() => setActiveProjectTab('completed')}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    activeProjectTab === 'completed'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed ({completedProjects.length})
                </button>
              </div>

              {/* Project List */}
              <div className="space-y-4">
                {(activeProjectTab === 'active' ? activeProjects : completedProjects).length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-8">
                    No {activeProjectTab} projects yet
                  </p>
                ) : (
                  (activeProjectTab === 'active' ? activeProjects : completedProjects).map((project) => (
                    <div
                      key={project.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">{project.title}</h4>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          {project.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
