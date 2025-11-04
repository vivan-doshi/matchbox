import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LinkedinIcon, GithubIcon, ExternalLinkIcon, EditIcon, FolderIcon, FileTextIcon, UploadIcon, CheckIcon, XIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvailabilityCalendar, { TimeSlot } from '../components/shared/AvailabilityCalendar';

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
  }, [user, authLoading, navigate]);

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
        alert('Profile updated successfully!');
      } catch (error: any) {
        alert(`Failed to update profile: ${error.message}`);
      } finally {
        setSaving(false);
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleCancel = () => {
    // Reset all edited values to current user data
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
      // Simulate upload
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName = user.preferredName || `${user.firstName} ${user.lastName}`;

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
            <button
              onClick={handleEditProfile}
              disabled={saving}
              className={`flex items-center text-sm px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <>Saving...</>
              ) : isEditMode ? (
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
            {isEditMode && !saving && (
              <button
                onClick={handleCancel}
                className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all cursor-pointer ml-2"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f97316&color=fff&size=200`}
                alt={displayName}
                className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6"
              />
              <div className="flex-1">
                {isEditMode ? (
                  <div className="space-y-3 mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editedFirstName}
                        onChange={(e) => setEditedFirstName(e.target.value)}
                        className="flex-1 text-xl font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editedLastName}
                        onChange={(e) => setEditedLastName(e.target.value)}
                        className="flex-1 text-xl font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        placeholder="Last Name"
                      />
                    </div>
                    <input
                      type="text"
                      value={editedPreferredName}
                      onChange={(e) => setEditedPreferredName(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Preferred Name (optional)"
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
                    <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
                    <p className="text-slate-600 mb-3">
                      {user.major} @ {user.university}
                      {user.graduationYear && ` • Class of ${user.graduationYear}`}
                      {user.isAlumni && ' (Alumni)'}
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
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.professionalLinks?.linkedin && (
                      <a
                        href={user.professionalLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <LinkedinIcon className="h-3 w-3 mr-1" />
                        LinkedIn
                      </a>
                    )}
                    {user.professionalLinks?.github && (
                      <a
                        href={user.professionalLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-slate-800 text-white px-3 py-1 rounded-full hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <GithubIcon className="h-3 w-3 mr-1" />
                        GitHub
                      </a>
                    )}
                    {user.professionalLinks?.portfolio && (
                      <a
                        href={user.professionalLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        <ExternalLinkIcon className="h-3 w-3 mr-1" />
                        Portfolio
                      </a>
                    )}
                    {showUploadSuccess && (
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
                <p className="text-slate-700">{user.bio || 'No bio added yet.'}</p>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold mb-4">Skills</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {user.skills && Object.keys(user.skills).length > 0 ? (
                  Object.entries(user.skills).map(([skill, level]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{skill}</span>
                        <span className="text-sm text-slate-500">{level}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${(level / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold mb-4">Interests</h3>
              <div className="max-h-[400px] overflow-y-auto pr-2">
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
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
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
                    {user.interests && user.interests.length > 0 ? (
                      user.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No interests added yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects section - Can be populated later */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">My Projects</h3>
              <Link to="/my-projects" className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
                View all
              </Link>
            </div>
            <div className="text-center py-12 text-slate-500">
              <p className="mb-2">No projects yet</p>
              <Link
                to="/dashboard"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
              >
                Explore projects to join
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
