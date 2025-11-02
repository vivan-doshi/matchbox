import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, LinkedinIcon, GithubIcon, ExternalLinkIcon, EditIcon, FolderIcon, FileTextIcon, UploadIcon, CheckIcon, XIcon } from 'lucide-react';
const ProfilePage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState<'active' | 'completed'>('active');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  // Original user data - This would come from authentication context in a real app
  const originalUser = {
    name: 'Jordan Smith',
    university: 'Stanford University',
    major: 'Computer Science',
    graduationYear: '2024',
    bio: 'Full-stack developer with a passion for building user-friendly applications. Looking to collaborate on innovative projects and expand my skill set.',
    profilePicture: 'https://i.pravatar.cc/300?img=33',
    links: {
      linkedin: 'https://linkedin.com/in/jordansmith',
      github: 'https://github.com/jordansmith',
      portfolio: 'https://jordansmith.dev',
      resume: {
        url: 'https://example.com/resume.pdf',
        filename: 'Jordan_Smith_Resume.pdf',
        uploadedAt: '2024-01-15'
      }
    },
    skills: {
      React: 9,
      'Node.js': 8,
      'UI/UX Design': 7,
      MongoDB: 6,
      TypeScript: 8,
      Python: 7,
      'Machine Learning': 6,
      Docker: 7,
      AWS: 6
    },
    interests: ['Web Development', 'Mobile Apps', 'Machine Learning', 'Hackathons', 'Open Source', 'Cloud Computing'],
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '12:00', available: true },
      { day: 'Monday', startTime: '14:00', endTime: '17:00', available: true },
      { day: 'Tuesday', startTime: '10:00', endTime: '15:00', available: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '12:00', available: true },
      { day: 'Wednesday', startTime: '14:00', endTime: '18:00', available: true },
      { day: 'Thursday', startTime: '13:00', endTime: '17:00', available: true },
      { day: 'Friday', startTime: '09:00', endTime: '13:00', available: true },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00', available: true }
    ],
    projects: [{
      id: '1',
      title: 'Campus Events Platform',
      description: 'A platform for students to discover and RSVP to campus events.',
      role: 'Project Lead',
      status: 'active',
      startDate: '2024-01-01',
      tags: ['React', 'Node.js', 'MongoDB']
    }, {
      id: '2',
      title: 'AI Study Assistant',
      description: 'AI-powered tool that helps students study more effectively.',
      role: 'Full Stack Developer',
      status: 'active',
      startDate: '2024-02-15',
      tags: ['Python', 'TensorFlow', 'React']
    }, {
      id: '3',
      title: 'Study Group Finder',
      description: 'App that helps students find study groups for their courses.',
      role: 'Frontend Developer',
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2023-12-15',
      tags: ['React', 'TypeScript', 'Firebase']
    }, {
      id: '4',
      title: 'Campus Food Delivery',
      description: 'On-demand food delivery service for campus students.',
      role: 'Backend Developer',
      status: 'completed',
      startDate: '2023-06-01',
      endDate: '2023-08-30',
      tags: ['Node.js', 'Express', 'PostgreSQL']
    }]
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
  const [newInterest, setNewInterest] = useState('');

  // Use original data for display
  const user = originalUser;

  const handleEditProfile = () => {
    if (isEditMode) {
      // Save all changes
      console.log('Saving all profile changes:', {
        name: editedName,
        bio: editedBio,
        university: editedUniversity,
        major: editedMajor,
        graduationYear: editedGradYear,
        linkedin: editedLinkedin,
        github: editedGithub,
        portfolio: editedPortfolio,
        interests: editedInterests
      });
      // In a real app, you would make an API call here to save all changes
      alert('Profile updated successfully!');
    }
    setIsEditMode(!isEditMode);
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
                className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                {Object.entries(user.skills).map(([skill, level]) => <div key={skill}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{skill}</span>
                      <span className="text-sm text-slate-500">{level}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{
                    width: `${level / 10 * 100}%`
                  }}></div>
                    </div>
                  </div>)}
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
                {/* Availability Calendar */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-slate-700">Weekly Availability</h4>
                  <div className="bg-slate-50 rounded-lg p-3 overflow-x-auto">
                    <div className="min-w-[500px]">
                      {/* Legend */}
                      <div className="flex items-center gap-4 mb-3 text-xs">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-1.5"></div>
                          <span className="text-slate-600">Available</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded mr-1.5"></div>
                          <span className="text-slate-600">Unavailable</span>
                        </div>
                      </div>

                      {/* Days Header */}
                      <div className="grid grid-cols-8 gap-1 mb-1">
                        <div className="text-xs font-medium text-slate-500 p-2"></div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="text-xs font-medium text-slate-700 text-center p-2 bg-white rounded">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Time Slots */}
                      {['09:00', '12:00', '15:00', '18:00'].map(time => {
                        const getAvailability = (day: string) => {
                          const dayMap: Record<string, string> = {
                            'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
                            'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
                          };
                          const fullDay = dayMap[day];
                          return user.availability.some(slot => {
                            const slotStart = parseInt(slot.startTime.split(':')[0]);
                            const slotEnd = parseInt(slot.endTime.split(':')[0]);
                            const currentHour = parseInt(time.split(':')[0]);
                            return slot.day === fullDay && currentHour >= slotStart && currentHour < slotEnd && slot.available;
                          });
                        };

                        return (
                          <div key={time} className="grid grid-cols-8 gap-1 mb-1">
                            <div className="text-xs text-slate-500 p-2 text-right">{time}</div>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                              const isAvailable = getAvailability(day);
                              return (
                                <div
                                  key={day}
                                  className={`h-8 rounded transition-colors ${
                                    isAvailable
                                      ? 'bg-green-100 border border-green-300 hover:bg-green-200'
                                      : 'bg-slate-200 border border-slate-300'
                                  }`}
                                  title={`${day} ${time} - ${isAvailable ? 'Available' : 'Unavailable'}`}
                                ></div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                          onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
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