import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LinkedinIcon, GithubIcon, ExternalLinkIcon, EditIcon, FolderIcon, FileTextIcon, UploadIcon, CheckIcon, XIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user: authUser, updateUserProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState<'active' | 'completed'>('active');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Transform auth user data to match original structure
  const originalUser = authUser ? {
    name: authUser.preferredName || `${authUser.firstName} ${authUser.lastName}`,
    university: authUser.university,
    major: authUser.major,
    graduationYear: authUser.graduationYear?.toString() || 'N/A',
    bio: authUser.bio || '',
    profilePicture: authUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.firstName + ' ' + authUser.lastName)}&size=300&background=f97316&color=fff`,
    links: {
      linkedin: authUser.professionalLinks?.linkedin || '',
      github: authUser.professionalLinks?.github || '',
      portfolio: authUser.professionalLinks?.portfolio || '',
      resume: {
        url: '',
        filename: '',
        uploadedAt: ''
      }
    },
    skills: authUser.skills || [],
    interests: authUser.interests || [],
    weeklyAvailability: authUser.weeklyAvailability || { hoursPerWeek: 0 },
    projects: [] as any[] // Mock empty projects for now - TODO: Fetch user's actual projects
  } : {
    name: 'Loading...',
    university: '',
    major: '',
    graduationYear: '',
    bio: '',
    profilePicture: '',
    links: { linkedin: '', github: '', portfolio: '', resume: { url: '', filename: '', uploadedAt: '' } },
    skills: [],
    interests: [],
    weeklyAvailability: { hoursPerWeek: 0 },
    projects: [] as any[]
  };

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
    if (authUser) {
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
  }, [authUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login');
    }
  }, [authLoading, authUser, navigate]);

  // Use original data for display
  const user = originalUser;

  // Show loading if still fetching auth
  if (authLoading || !authUser) {
    return <div className="min-h-screen page-background-gradient flex items-center justify-center">
      <div className="text-slate-600">Loading profile...</div>
    </div>;
  }

  const handleEditProfile = async () => {
    if (isEditMode) {
      try {
        setSaving(true);
        // Parse name into first and last
        const nameParts = editedName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await updateUserProfile({
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

  const activeProjects = user.projects.filter(p => p.status === 'active');
  const completedProjects = user.projects.filter(p => p.status === 'completed');
  return <div className="min-h-screen page-background-gradient">
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
              className={`flex items-center text-sm px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                isEditMode
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
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
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <img src={user.profilePicture} alt={user.name} className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6" />
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
                    {user.links.resume ? (
                      <a
                        href={user.links.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors cursor-pointer"
                      >
                        <FileTextIcon className="h-3 w-3 mr-1" />
                        Resume
                      </a>
                    ) : (
                      <label className="flex items-center text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                        <UploadIcon className="h-3 w-3 mr-1" />
                        {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                          disabled={uploadingResume}
                        />
                      </label>
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
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">My Projects</h3>
              <Link to="/my-projects" className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer">
                View all
              </Link>
            </div>

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

            {/* Tab Content */}
            <div className="space-y-4">
              {activeProjectTab === 'active' && (
                <>
                  {activeProjects.length > 0 ? (
                    activeProjects.map(project => (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        className="block border border-slate-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 hover:text-orange-600">
                            {project.title}
                          </h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            In Progress
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">Role: {project.role}</p>
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))
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
                    completedProjects.map(project => (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}`}
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
                        <p className="text-sm text-slate-700 mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500">Role: {project.role}</p>
                            {project.endDate && (
                              <p className="text-xs text-slate-400 mt-1">
                                Completed: {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <p>No completed projects yet</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default ProfilePage;