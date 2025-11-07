import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, UserPlusIcon, MessageSquareIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from 'lucide-react';
import ProjectTeamTable from '../components/projects/ProjectTeamTable';
// Sample data - in a real app, this would come from an API
const MY_PROJECTS = [{
  id: '1',
  title: 'AI-powered Study Assistant',
  description: 'Building an AI assistant to help students organize notes, schedule study sessions, and provide personalized learning recommendations.',
  tags: ['AI/ML', 'Mobile', 'Education'],
  status: 'In Progress',
  createdAt: 'Oct 15, 2023',
  deadline: 'Dec 20, 2023',
  teamMembers: [{
    id: '101',
    name: 'Alex Chen',
    role: 'Backend Developer',
    university: 'Stanford',
    profilePic: 'https://i.pravatar.cc/150?img=11',
    status: 'Active',
    joinedAt: 'Oct 16, 2023'
  }, {
    id: '102',
    name: 'Taylor Kim',
    role: 'ML Engineer',
    university: 'MIT',
    profilePic: 'https://i.pravatar.cc/150?img=12',
    status: 'Active',
    joinedAt: 'Oct 17, 2023'
  }],
  openRoles: [{
    id: 'role-1',
    title: 'UI/UX Designer',
    applicants: 2
  }, {
    id: 'role-2',
    title: 'Frontend Developer',
    applicants: 1
  }],
  applicants: [{
    id: '201',
    name: 'Jamie Wong',
    role: 'UI/UX Designer',
    university: 'RISD',
    profilePic: 'https://i.pravatar.cc/150?img=21',
    fit: 'High',
    message: 'I have experience designing educational apps and would love to join your team!'
  }, {
    id: '202',
    name: 'Riley Johnson',
    role: 'Frontend Developer',
    university: 'UC Berkeley',
    profilePic: 'https://i.pravatar.cc/150?img=22',
    fit: 'Medium',
    message: "I've worked with React Native and have built several mobile apps before."
  }],
  recommendations: [{
    id: '301',
    name: 'Morgan Lee',
    role: 'UI/UX Designer',
    university: 'Carnegie Mellon',
    profilePic: 'https://i.pravatar.cc/150?img=31',
    fit: 'High',
    skills: ['Figma', 'UI Design', 'User Research']
  }, {
    id: '302',
    name: 'Casey Taylor',
    role: 'Frontend Developer',
    university: 'Georgia Tech',
    profilePic: 'https://i.pravatar.cc/150?img=32',
    fit: 'High',
    skills: ['React', 'TypeScript', 'Mobile Development']
  }]
}, {
  id: '2',
  title: 'Campus Events Platform',
  description: 'Creating a platform for students to discover, organize, and RSVP to campus events. Includes calendar integration and notifications.',
  tags: ['Web', 'Mobile', 'Campus Life'],
  status: 'Planning',
  createdAt: 'Oct 20, 2023',
  deadline: 'Jan 15, 2024',
  teamMembers: [{
    id: '201',
    name: 'Jordan Lee',
    role: 'Frontend Developer',
    university: 'MIT',
    profilePic: 'https://i.pravatar.cc/150?img=13',
    status: 'Active',
    joinedAt: 'Oct 21, 2023'
  }],
  openRoles: [{
    id: 'role-3',
    title: 'Backend Developer',
    applicants: 3
  }, {
    id: 'role-4',
    title: 'UI/UX Designer',
    applicants: 0
  }],
  applicants: [{
    id: '203',
    name: 'Sam Rivera',
    role: 'Backend Developer',
    university: 'NYU',
    profilePic: 'https://i.pravatar.cc/150?img=23',
    fit: 'High',
    message: "I have experience with Node.js and MongoDB, and I've built several RESTful APIs."
  }, {
    id: '204',
    name: 'Alex Morgan',
    role: 'Backend Developer',
    university: 'Stanford',
    profilePic: 'https://i.pravatar.cc/150?img=24',
    fit: 'Medium',
    message: 'Looking to gain more experience with backend development. I have worked with Express and PostgreSQL before.'
  }, {
    id: '205',
    name: 'Taylor Reed',
    role: 'Backend Developer',
    university: 'MIT',
    profilePic: 'https://i.pravatar.cc/150?img=25',
    fit: 'Low',
    message: 'Interested in learning more about backend development.'
  }],
  recommendations: [{
    id: '303',
    name: 'Jordan Smith',
    role: 'UI/UX Designer',
    university: 'RISD',
    profilePic: 'https://i.pravatar.cc/150?img=33',
    fit: 'High',
    skills: ['Figma', 'UI Design', 'Mobile Design']
  }]
}];
const MyProjectsPage: React.FC = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>(MY_PROJECTS[0].id);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const toggleExpand = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
    // Set default tab when expanding a project
    if (expandedProject !== projectId) {
      setActiveTab({
        ...activeTab,
        [projectId]: 'team'
      });
    }
  };
  const changeTab = (projectId: string, tab: string) => {
    setActiveTab({
      ...activeTab,
      [projectId]: tab
    });
  };
  return <div className="min-h-screen page-background-gradient">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-slate-600 hover:text-orange-500 transition-colors mr-4">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">My Posted Projects</h1>
          </div>
          <Link to="/dashboard" className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">
            <PlusIcon className="h-4 w-4 mr-1" />
            New Project
          </Link>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="space-y-6">
          {MY_PROJECTS.map(project => <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 cursor-pointer flex justify-between items-center" onClick={() => toggleExpand(project.id)}>
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-bold text-lg">{project.title}</h3>
                    <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Created: {project.createdAt} • Deadline: {project.deadline}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
                        {tag}
                      </span>)}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <div className="text-sm font-medium">
                      {project.teamMembers.length} Team Members
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-slate-500">
                        {project.openRoles.length} Open Roles
                      </div>
                      {project.applicants.length > 0 && <div className="text-xs text-orange-500 font-medium">
                          {project.applicants.length} New Applicants
                        </div>}
                    </div>
                  </div>
                  {expandedProject === project.id ? <ChevronUpIcon className="h-5 w-5 text-slate-400" /> : <ChevronDownIcon className="h-5 w-5 text-slate-400" />}
                </div>
              </div>
              {expandedProject === project.id && <div className="border-t border-slate-100">
                  <div className="border-b border-slate-100">
                    <div className="flex">
                      <button className={`px-6 py-3 text-sm font-medium ${!activeTab[project.id] || activeTab[project.id] === 'team' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-600'}`} onClick={() => changeTab(project.id, 'team')}>
                        Team Members ({project.teamMembers.length})
                      </button>
                      <button className={`px-6 py-3 text-sm font-medium ${activeTab[project.id] === 'applicants' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-600'}`} onClick={() => changeTab(project.id, 'applicants')}>
                        Applicants ({project.applicants.length})
                      </button>
                      <button className={`px-6 py-3 text-sm font-medium ${activeTab[project.id] === 'recommendations' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-600'}`} onClick={() => changeTab(project.id, 'recommendations')}>
                        Recommended ({project.recommendations.length})
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Team Members Tab */}
                    {(!activeTab[project.id] || activeTab[project.id] === 'team') && <div>
                        <h4 className="font-medium mb-4">
                          Current Team Members
                        </h4>
                        <ProjectTeamTable teamMembers={project.teamMembers} />
                        <div className="mt-6">
                          <h4 className="font-medium mb-4">Open Roles</h4>
                          <div className="space-y-3">
                            {project.openRoles.map(role => <div key={role.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <span className="font-medium">
                                    {role.title}
                                  </span>
                                  {role.applicants > 0 && <span className="ml-2 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                      {role.applicants} applicant
                                      {role.applicants !== 1 ? 's' : ''}
                                    </span>}
                                </div>
                                <div className="flex space-x-2">
                                  <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
                                    <EditIcon className="h-4 w-4" />
                                  </button>
                                  <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
                                    <UserPlusIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>)}
                          </div>
                        </div>
                      </div>}
                    {/* Applicants Tab */}
                    {activeTab[project.id] === 'applicants' && <div>
                        <h4 className="font-medium mb-4">Applicants</h4>
                        <div className="space-y-4">
                          {project.applicants.map(applicant => <div key={applicant.id} className="border border-slate-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                  <img src={applicant.profilePic} alt={applicant.name} className="w-12 h-12 rounded-full mr-3" />
                                  <div>
                                    <div className="flex items-center mb-1">
                                      <h4 className="font-bold">
                                        {applicant.name}
                                      </h4>
                                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${applicant.fit === 'High' ? 'bg-green-100 text-green-700' : applicant.fit === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {applicant.fit} Match
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">
                                      {applicant.role} • {applicant.university}
                                    </p>
                                    <p className="text-sm italic mb-2">
                                      "{applicant.message}"
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
                                    <MessageSquareIcon className="h-4 w-4" />
                                  </button>
                                  <button className="p-1.5 bg-white border border-red-200 rounded-md text-red-500 hover:bg-red-50 transition-colors">
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                  <button className="p-1.5 bg-white border border-green-200 rounded-md text-green-500 hover:bg-green-50 transition-colors">
                                    <CheckIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>)}
                          {project.applicants.length === 0 && <div className="text-center py-8">
                              <p className="text-slate-500">
                                No applicants yet.
                              </p>
                            </div>}
                        </div>
                      </div>}
                    {/* Recommendations Tab */}
                    {activeTab[project.id] === 'recommendations' && <div>
                        <h4 className="font-medium mb-4">
                          Recommended Candidates
                        </h4>
                        <div className="space-y-4">
                          {project.recommendations.map(candidate => <div key={candidate.id} className="border border-slate-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                  <img src={candidate.profilePic} alt={candidate.name} className="w-12 h-12 rounded-full mr-3" />
                                  <div>
                                    <div className="flex items-center mb-1">
                                      <h4 className="font-bold">
                                        {candidate.name}
                                      </h4>
                                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${candidate.fit === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {candidate.fit} Match
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">
                                      {candidate.role} • {candidate.university}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {candidate.skills.map((skill, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
                                          {skill}
                                        </span>)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="px-3 py-1 bg-white border border-orange-500 text-orange-500 rounded-md text-sm hover:bg-orange-50 transition-colors">
                                    Message
                                  </button>
                                  <button className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md text-sm hover:shadow-sm transition-all">
                                    Invite
                                  </button>
                                </div>
                              </div>
                            </div>)}
                          {project.recommendations.length === 0 && <div className="text-center py-8">
                              <p className="text-slate-500">
                                No recommendations available.
                              </p>
                            </div>}
                        </div>
                      </div>}
                    <div className="mt-6 flex justify-end space-x-3">
                      <Link to={`/project/${project.id}`} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                        View Project
                      </Link>
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all">
                        Manage Team
                      </button>
                    </div>
                  </div>
                </div>}
            </div>)}
        </div>
      </main>
    </div>;
};
export default MyProjectsPage;