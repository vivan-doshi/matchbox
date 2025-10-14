import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, LinkedinIcon, GithubIcon, ExternalLinkIcon, EditIcon, FolderIcon } from 'lucide-react';
const ProfilePage: React.FC = () => {
  // This would come from authentication context in a real app
  const user = {
    name: 'Jordan Smith',
    university: 'Stanford University',
    major: 'Computer Science',
    graduationYear: '2024',
    bio: 'Full-stack developer with a passion for building user-friendly applications. Looking to collaborate on innovative projects and expand my skill set.',
    profilePicture: 'https://i.pravatar.cc/300?img=33',
    links: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      portfolio: 'https://portfolio.com'
    },
    skills: {
      React: 9,
      'Node.js': 8,
      'UI/UX Design': 7,
      MongoDB: 6,
      TypeScript: 8
    },
    interests: ['Web Development', 'Mobile Apps', 'Machine Learning', 'Hackathons'],
    projects: [{
      id: '1',
      title: 'Campus Events Platform',
      description: 'A platform for students to discover and RSVP to campus events.',
      role: 'Project Lead',
      status: 'In Progress'
    }, {
      id: '2',
      title: 'Study Group Finder',
      description: 'App that helps students find study groups for their courses.',
      role: 'Frontend Developer',
      status: 'Completed'
    }]
  };
  return <div className="min-h-screen bg-slate-50">
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
            <button className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all">
              <EditIcon className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <img src={user.profilePicture} alt={user.name} className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6" />
              <div>
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-slate-600 mb-3">
                  {user.major} @ {user.university} • Class of{' '}
                  {user.graduationYear}
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.links.linkedin && <a href={user.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                      <LinkedinIcon className="h-3 w-3 mr-1" />
                      LinkedIn
                    </a>}
                  {user.links.github && <a href={user.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-slate-800 text-white px-3 py-1 rounded-full hover:bg-slate-900 transition-colors">
                      <GithubIcon className="h-3 w-3 mr-1" />
                      GitHub
                    </a>}
                  {user.links.portfolio && <a href={user.links.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
                      <ExternalLinkIcon className="h-3 w-3 mr-1" />
                      Portfolio
                    </a>}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-bold mb-3">About</h3>
              <p className="text-slate-700">{user.bio}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold mb-4">Skills</h3>
              <div className="space-y-4">
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
              <h3 className="font-bold mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {interest}
                  </span>)}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">My Projects</h3>
              <Link to="/my-projects" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {user.projects.map(project => <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{project.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    {project.description}
                  </p>
                  <p className="text-xs text-slate-500">Role: {project.role}</p>
                </div>)}
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default ProfilePage;