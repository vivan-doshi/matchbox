import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MenuIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  BookmarkIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UserPlusIcon,
} from 'lucide-react';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import Navigation from '../components/Navigation';

// Types
interface User {
  id: string;
  name: string;
  university: string;
  profilePic: string;
}

interface TeamMember extends User {
  role: string;
  joinedAt: string;
}

interface OpenRole {
  id: string;
  title: string;
  description: string;
  applicants: number;
}

interface Applicant extends User {
  role: string;
  fit: 'High' | 'Medium' | 'Low';
  message: string;
  appliedRoles: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'In Progress' | 'Planning' | 'Completed';
  createdAt: string;
  deadline: string;
  teamMembers: TeamMember[];
  openRoles: OpenRole[];
  applicants: Applicant[];
  totalRolesNeeded: number;
  creator?: User;
  userRole?: string;
}

// Sample POSTED projects data
const POSTED_PROJECTS_DATA: Project[] = [
  {
    id: '1',
    title: 'AI-powered Study Assistant',
    description:
      'Building an AI assistant to help students organize notes, schedule study sessions, and provide personalized learning recommendations.',
    tags: ['AI/ML', 'Mobile', 'Education'],
    status: 'In Progress',
    createdAt: 'Oct 15, 2023',
    deadline: 'Dec 20, 2023',
    totalRolesNeeded: 4,
    teamMembers: [
      {
        id: '101',
        name: 'Alex Chen',
        role: 'Backend Developer',
        university: 'Stanford',
        profilePic: 'https://i.pravatar.cc/150?img=11',
        joinedAt: 'Oct 16, 2023',
      },
      {
        id: '102',
        name: 'Taylor Kim',
        role: 'ML Engineer',
        university: 'MIT',
        profilePic: 'https://i.pravatar.cc/150?img=12',
        joinedAt: 'Oct 17, 2023',
      },
    ],
    openRoles: [
      {
        id: 'role-1',
        title: 'UI/UX Designer',
        description: 'Design user interfaces and user experiences for the mobile application.',
        applicants: 2,
      },
      {
        id: 'role-2',
        title: 'Frontend Developer',
        description: 'Build the frontend using React Native and TypeScript.',
        applicants: 1,
      },
    ],
    applicants: [
      {
        id: '201',
        name: 'Jamie Wong',
        role: 'UI/UX Designer',
        university: 'RISD',
        profilePic: 'https://i.pravatar.cc/150?img=21',
        fit: 'High',
        message: 'I have experience designing educational apps and would love to join your team!',
        appliedRoles: ['UI/UX Designer'],
      },
      {
        id: '202',
        name: 'Riley Johnson',
        role: 'Frontend Developer',
        university: 'UC Berkeley',
        profilePic: 'https://i.pravatar.cc/150?img=22',
        fit: 'Medium',
        message: "I've worked with React Native and have built several mobile apps before.",
        appliedRoles: ['Frontend Developer'],
      },
      {
        id: '203',
        name: 'Sam Rivera',
        role: 'UI/UX Designer',
        university: 'NYU',
        profilePic: 'https://i.pravatar.cc/150?img=23',
        fit: 'High',
        message: 'Passionate about creating intuitive educational experiences!',
        appliedRoles: ['UI/UX Designer'],
      },
    ],
  },
  {
    id: '2',
    title: 'Campus Events Platform',
    description:
      'Creating a platform for students to discover, organize, and RSVP to campus events. Includes calendar integration and notifications.',
    tags: ['Web', 'Mobile', 'Campus Life'],
    status: 'Planning',
    createdAt: 'Oct 20, 2023',
    deadline: 'Jan 15, 2024',
    totalRolesNeeded: 3,
    teamMembers: [
      {
        id: '201',
        name: 'Jordan Lee',
        role: 'Frontend Developer',
        university: 'MIT',
        profilePic: 'https://i.pravatar.cc/150?img=13',
        joinedAt: 'Oct 21, 2023',
      },
    ],
    openRoles: [
      {
        id: 'role-3',
        title: 'Backend Developer',
        description: 'Build RESTful APIs and manage database architecture.',
        applicants: 3,
      },
      {
        id: 'role-4',
        title: 'UI/UX Designer',
        description: 'Create wireframes and design the user interface.',
        applicants: 0,
      },
    ],
    applicants: [
      {
        id: '203',
        name: 'Sam Rivera',
        role: 'Backend Developer',
        university: 'NYU',
        profilePic: 'https://i.pravatar.cc/150?img=23',
        fit: 'High',
        message: "I have experience with Node.js and MongoDB, and I've built several RESTful APIs.",
        appliedRoles: ['Backend Developer'],
      },
      {
        id: '204',
        name: 'Alex Morgan',
        role: 'Backend Developer',
        university: 'Stanford',
        profilePic: 'https://i.pravatar.cc/150?img=24',
        fit: 'Medium',
        message: 'Looking to gain more experience with backend development.',
        appliedRoles: ['Backend Developer'],
      },
      {
        id: '205',
        name: 'Taylor Reed',
        role: 'Backend Developer',
        university: 'MIT',
        profilePic: 'https://i.pravatar.cc/150?img=25',
        fit: 'Low',
        message: 'Interested in learning more about backend development.',
        appliedRoles: ['Backend Developer'],
      },
    ],
  },
];

// Sample SAVED projects data
const SAVED_PROJECTS_DATA: Project[] = [
  {
    id: '3',
    title: 'Social Impact Marketplace',
    description: 'Building a platform connecting volunteers with local nonprofits and social impact projects.',
    tags: ['Web', 'Social Impact', 'Community'],
    status: 'In Progress',
    createdAt: 'Sep 10, 2023',
    deadline: 'Nov 30, 2023',
    totalRolesNeeded: 5,
    creator: {
      id: '301',
      name: 'Morgan Smith',
      university: 'Stanford',
      profilePic: 'https://i.pravatar.cc/150?img=31',
    },
    teamMembers: [],
    openRoles: [],
    applicants: [],
  },
];

// Sample JOINED projects data
const JOINED_PROJECTS_DATA: Project[] = [
  {
    id: '4',
    title: 'Student Recipe Sharing App',
    description: 'An app where college students can share budget-friendly recipes and meal prep ideas.',
    tags: ['Mobile', 'Food', 'Community'],
    status: 'In Progress',
    createdAt: 'Aug 5, 2023',
    deadline: 'Dec 1, 2023',
    totalRolesNeeded: 4,
    userRole: 'Frontend Developer',
    creator: {
      id: '401',
      name: 'Casey Johnson',
      university: 'UC Berkeley',
      profilePic: 'https://i.pravatar.cc/150?img=41',
    },
    teamMembers: [],
    openRoles: [],
    applicants: [],
  },
];

const MyProjectsPageNew: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get active tab from URL or default to 'posted'
  const activeMainTab = (searchParams.get('tab') as 'posted' | 'saved' | 'joined') || 'posted';

  // State - allow multiple expanded projects
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectTabs, setProjectTabs] = useState<Record<string, string>>({});

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showRemoveRoleModal, setShowRemoveRoleModal] = useState(false);
  const [showRejectApplicantModal, setShowRejectApplicantModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Selected items for modals
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<OpenRole | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Role editing
  const [editingRole, setEditingRole] = useState<OpenRole | null>(null);
  const [editRoleForm, setEditRoleForm] = useState({ title: '', description: '' });

  // Projects data
  const [projects, setProjects] = useState({
    posted: POSTED_PROJECTS_DATA,
    saved: SAVED_PROJECTS_DATA,
    joined: JOINED_PROJECTS_DATA,
  });

  // Restore page state when component mounts (returning from navigation)
  useEffect(() => {
    // Restore expanded projects
    const savedExpandedProjects = sessionStorage.getItem('myProjectsExpandedProjects');
    if (savedExpandedProjects) {
      try {
        const expandedArray = JSON.parse(savedExpandedProjects);
        setExpandedProjects(new Set(expandedArray));
        sessionStorage.removeItem('myProjectsExpandedProjects');
      } catch (e) {
        console.error('Error restoring expanded projects:', e);
      }
    }

    // Restore scroll position
    const savedScroll = sessionStorage.getItem('myProjectsScroll');
    if (savedScroll) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem('myProjectsScroll');
      }, 100);
    }
  }, []);

  // Load saved projects from localStorage on mount and when navigating to this page
  useEffect(() => {
    const loadSavedProjects = () => {
      const savedProjectIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');

      // Filter all available projects to show only saved ones
      // In a real app, this would fetch from API based on saved IDs
      const allProjects = [...POSTED_PROJECTS_DATA, ...SAVED_PROJECTS_DATA, ...JOINED_PROJECTS_DATA];
      const savedProjects = allProjects.filter(project => savedProjectIds.includes(project.id));

      setProjects(prev => ({
        ...prev,
        saved: savedProjects
      }));
    };

    loadSavedProjects();

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedProjects') {
        loadSavedProjects();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event from same tab
    const handleSavedProjectsChange = () => {
      loadSavedProjects();
    };

    window.addEventListener('savedProjectsChanged', handleSavedProjectsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savedProjectsChanged', handleSavedProjectsChange);
    };
  }, []);

  // Handle new project creation
  const handleProjectCreated = (newProject: any) => {
    console.log('New project created:', newProject);
    setProjects((prev) => ({
      ...prev,
      posted: [newProject, ...prev.posted],
    }));
    setShowCreateProjectModal(false);
    // Switch to posted tab to show the new project
    changeMainTab('posted');
  };

  // Change main tab and update URL
  const changeMainTab = (tab: 'posted' | 'saved' | 'joined') => {
    setSearchParams({ tab });
  };

  // Toggle project expansion - allow multiple expanded
  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
        if (!projectTabs[projectId]) {
          setProjectTabs({ ...projectTabs, [projectId]: 'team' });
        }
      }
      return newSet;
    });
  };

  // Change project sub-tab
  const changeProjectTab = (projectId: string, tab: string) => {
    setProjectTabs({ ...projectTabs, [projectId]: tab });
  };

  // Handle profile navigation
  const handleProfileClick = (userId: string) => {
    // Store current page state before navigating
    sessionStorage.setItem('myProjectsReferrer', `/my-projects?tab=${activeMainTab}`);
    sessionStorage.setItem('myProjectsExpandedProjects', JSON.stringify(Array.from(expandedProjects)));
    sessionStorage.setItem('myProjectsScroll', window.scrollY.toString());
    navigate(`/profile/${userId}`);
  };

  // Handle messaging a team member or applicant
  const handleMessageUser = (userId: string, userName: string) => {
    // Store current page state before navigating
    sessionStorage.setItem('myProjectsReferrer', `/my-projects?tab=${activeMainTab}`);
    sessionStorage.setItem('myProjectsExpandedProjects', JSON.stringify(Array.from(expandedProjects)));
    sessionStorage.setItem('myProjectsScroll', window.scrollY.toString());
    // Navigate to chat page or open message modal - for now, navigate to dashboard chat
    navigate(`/dashboard/chat`);
    // In a real app, you might want to:
    // - Open a chat modal/drawer
    // - Navigate to /dashboard/chat with a query param like ?user=userId
    // - Pre-select that user's chat conversation
    console.log(`Opening chat with ${userName} (${userId})`);
  };

  // Handle viewing project details - store state for proper back navigation
  const handleViewProject = (projectId: string) => {
    // Store current page state including tab and expanded projects
    sessionStorage.setItem('projectReferrer', `/my-projects?tab=${activeMainTab}`);
    sessionStorage.setItem('myProjectsExpandedProjects', JSON.stringify(Array.from(expandedProjects)));
    sessionStorage.setItem('myProjectsScroll', window.scrollY.toString());
    navigate(`/project/${projectId}`);
  };

  // Delete project handlers
  const handleDeleteProject = (projectId: string) => {
    setSelectedProject(projectId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    if (selectedProject) {
      setProjects((prev) => ({
        ...prev,
        posted: prev.posted.filter((p) => p.id !== selectedProject),
      }));
      setShowDeleteModal(false);
      setSelectedProject(null);
    }
  };

  // Mark as completed handlers
  const handleMarkCompleted = (projectId: string) => {
    setSelectedProject(projectId);
    setShowCompleteModal(true);
  };

  const confirmMarkCompleted = () => {
    if (selectedProject) {
      setProjects((prev) => ({
        ...prev,
        posted: prev.posted.map((p) =>
          p.id === selectedProject ? { ...p, status: 'Completed' as const } : p
        ),
      }));
      setShowCompleteModal(false);
      setSelectedProject(null);
    }
  };

  // Remove team member handlers
  const handleRemoveMember = (projectId: string, member: TeamMember) => {
    setSelectedProject(projectId);
    setSelectedMember(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = () => {
    if (selectedProject && selectedMember) {
      setProjects((prev) => ({
        ...prev,
        posted: prev.posted.map((p) =>
          p.id === selectedProject
            ? { ...p, teamMembers: p.teamMembers.filter((m) => m.id !== selectedMember.id) }
            : p
        ),
      }));
      setShowRemoveMemberModal(false);
      setSelectedMember(null);
      setSelectedProject(null);
    }
  };

  // Remove role handlers
  const handleRemoveRole = (projectId: string, role: OpenRole) => {
    setSelectedProject(projectId);
    setSelectedRole(role);
    setShowRemoveRoleModal(true);
  };

  const confirmRemoveRole = () => {
    if (selectedProject && selectedRole) {
      setProjects((prev) => ({
        ...prev,
        posted: prev.posted.map((p) =>
          p.id === selectedProject
            ? { ...p, openRoles: p.openRoles.filter((r) => r.id !== selectedRole.id) }
            : p
        ),
      }));
      setShowRemoveRoleModal(false);
      setSelectedRole(null);
      setSelectedProject(null);
    }
  };

  // Edit role handlers
  const handleEditRole = (role: OpenRole) => {
    setEditingRole(role);
    setEditRoleForm({ title: role.title, description: role.description });
  };

  const saveRoleEdit = (projectId: string) => {
    if (editingRole) {
      setProjects((prev) => ({
        ...prev,
        posted: prev.posted.map((p) =>
          p.id === projectId
            ? {
                ...p,
                openRoles: p.openRoles.map((r) =>
                  r.id === editingRole.id
                    ? { ...r, title: editRoleForm.title, description: editRoleForm.description }
                    : r
                ),
              }
            : p
        ),
      }));
      setEditingRole(null);
    }
  };

  const cancelRoleEdit = () => {
    setEditingRole(null);
    setEditRoleForm({ title: '', description: '' });
  };

  // Unsave project handler
  const handleUnsaveProject = (projectId: string) => {
    setProjects((prev) => ({
      ...prev,
      saved: prev.saved.filter((p) => p.id !== projectId),
    }));
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const updated = savedProjects.filter((id: string) => id !== projectId);
    localStorage.setItem('savedProjects', JSON.stringify(updated));

    // Dispatch custom event to notify other components (like ProjectCard on HomePage)
    window.dispatchEvent(new Event('savedProjectsChanged'));
  };

  // Accept applicant handler
  const handleAcceptApplicant = (projectId: string, applicant: Applicant) => {
    console.log('Accepting applicant:', applicant.name, 'for roles:', applicant.appliedRoles);
    setProjects((prev) => ({
      ...prev,
      posted: prev.posted.map((p) =>
        p.id === projectId
          ? { ...p, applicants: p.applicants.filter((a) => a.id !== applicant.id) }
          : p
      ),
    }));
  };

  // Reject applicant handlers
  const handleRejectApplicant = (projectId: string, applicant: Applicant) => {
    setSelectedProject(projectId);
    setSelectedApplicant(applicant);
    setShowRejectApplicantModal(true);
  };

  const confirmRejectApplicant = () => {
    if (selectedProject && selectedApplicant) {
      setProjects((prev) => ({
        ...prev,
        posted: prev.posted.map((p) =>
          p.id === selectedProject
            ? { ...p, applicants: p.applicants.filter((a) => a.id !== selectedApplicant.id) }
            : p
        ),
      }));
      setShowRejectApplicantModal(false);
      setSelectedApplicant(null);
      setSelectedProject(null);
    }
  };

  // Get current projects based on active tab
  const getCurrentProjects = () => {
    switch (activeMainTab) {
      case 'saved':
        return projects.saved;
      case 'joined':
        return projects.joined;
      case 'posted':
      default:
        return projects.posted;
    }
  };

  const currentProjects = getCurrentProjects();

  return (
    <div className="min-h-screen page-background-gradient">
      <Navigation />
      <div>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">My Projects</h1>
            </div>

          {activeMainTab === 'posted' && (
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New Project
            </button>
          )}
        </div>
      </header>

        {/* Main Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeMainTab === 'posted'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => changeMainTab('posted')}
            >
              Posted Projects ({projects.posted.length})
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeMainTab === 'saved'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => changeMainTab('saved')}
            >
              Saved Projects ({projects.saved.length})
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeMainTab === 'joined'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => changeMainTab('joined')}
            >
              Projects Joined ({projects.joined.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* POSTED PROJECTS TAB */}
        {activeMainTab === 'posted' && (
          <div className="space-y-6">
            {currentProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">You haven't created any projects yet.</p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:shadow-lg transition-all"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Link>
              </div>
            ) : (
              currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  {/* Project Header - Collapsible */}
                  <div
                    className="p-6 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors"
                    onClick={() => toggleExpand(project.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-bold text-lg">{project.title}</h3>
                        <span
                          className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                            project.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700'
                              : project.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
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

                    {/* Team Summary - REFORMATTED */}
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <div className="text-base font-semibold text-slate-900">
                          {project.teamMembers.length}/{project.totalRolesNeeded} filled
                        </div>
                        {project.applicants.length > 0 && (
                          <div className="text-sm text-orange-500 font-medium">
                            {project.applicants.length} New Applicant
                            {project.applicants.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      {expandedProjects.has(project.id) ? (
                        <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedProjects.has(project.id) && (
                    <div className="border-t border-slate-100">
                      {/* Project Sub-tabs */}
                      <div className="border-b border-slate-100">
                        <div className="flex">
                          <button
                            className={`px-6 py-3 text-sm font-medium ${
                              !projectTabs[project.id] || projectTabs[project.id] === 'team'
                                ? 'text-orange-500 border-b-2 border-orange-500'
                                : 'text-slate-600'
                            }`}
                            onClick={() => changeProjectTab(project.id, 'team')}
                          >
                            Team Members ({project.teamMembers.length})
                          </button>
                          <button
                            className={`px-6 py-3 text-sm font-medium ${
                              projectTabs[project.id] === 'applicants'
                                ? 'text-orange-500 border-b-2 border-orange-500'
                                : 'text-slate-600'
                            }`}
                            onClick={() => changeProjectTab(project.id, 'applicants')}
                          >
                            Applicants ({project.applicants.length})
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Team Members Tab */}
                        {(!projectTabs[project.id] || projectTabs[project.id] === 'team') && (
                          <div>
                            <h4 className="font-medium mb-4">Current Team Members</h4>
                            {project.teamMembers.length > 0 ? (
                              <div className="overflow-x-auto mb-6">
                                <table className="min-w-full divide-y divide-slate-200 rounded-lg">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Team Member
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Role
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Joined
                                      </th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-slate-100">
                                    {project.teamMembers.map((member) => (
                                      <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <button
                                            onClick={() => handleProfileClick(member.id)}
                                            className="flex items-center hover:bg-slate-50 rounded-lg p-1 -ml-1 transition-colors"
                                          >
                                            <img
                                              className="h-8 w-8 rounded-full"
                                              src={member.profilePic}
                                              alt={member.name}
                                            />
                                            <div className="ml-3 text-left">
                                              <div className="text-sm font-medium text-slate-900 hover:text-orange-500 transition-colors">
                                                {member.name}
                                              </div>
                                              <div className="text-xs text-slate-500">
                                                {member.university}
                                              </div>
                                            </div>
                                          </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm text-slate-900">{member.role}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                          {member.joinedAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                          <div className="flex justify-end space-x-2">
                                            <button
                                              onClick={() => handleMessageUser(member.id, member.name)}
                                              className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300 transition-colors cursor-pointer"
                                              aria-label={`Message ${member.name}`}
                                              title={`Message ${member.name}`}
                                            >
                                              <MessageSquareIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleRemoveMember(project.id, member)}
                                              className="p-1.5 bg-white border border-slate-200 rounded-md text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                              aria-label="Remove team member"
                                            >
                                              <TrashIcon className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-6 mb-6 bg-slate-50 rounded-lg">
                                <p className="text-slate-500 text-sm">No team members yet.</p>
                              </div>
                            )}

                            {/* Open Roles - WITH EDIT/DELETE */}
                            <div className="mt-6">
                              <h4 className="font-medium mb-4">Open Roles</h4>
                              {project.openRoles.length > 0 ? (
                                <div className="space-y-3">
                                  {project.openRoles.map((role) => (
                                    <div key={role.id}>
                                      {editingRole?.id === role.id ? (
                                        // Edit Mode
                                        <div className="p-4 bg-slate-50 rounded-lg border-2 border-orange-300">
                                          <div className="space-y-3">
                                            <div>
                                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Role Title
                                              </label>
                                              <input
                                                type="text"
                                                value={editRoleForm.title}
                                                onChange={(e) =>
                                                  setEditRoleForm({ ...editRoleForm, title: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Role Description
                                              </label>
                                              <textarea
                                                value={editRoleForm.description}
                                                onChange={(e) =>
                                                  setEditRoleForm({
                                                    ...editRoleForm,
                                                    description: e.target.value,
                                                  })
                                                }
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none"
                                                rows={3}
                                              />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                              <button
                                                onClick={cancelRoleEdit}
                                                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-sm hover:bg-slate-50 transition-colors"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => saveRoleEdit(project.id)}
                                                className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md text-sm hover:shadow-md transition-all"
                                              >
                                                Save Changes
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        // View Mode
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                          <div>
                                            <span className="font-medium">{role.title}</span>
                                            <p className="text-xs text-slate-600 mt-1">{role.description}</p>
                                            {role.applicants > 0 && (
                                              <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                                {role.applicants} applicant{role.applicants !== 1 ? 's' : ''}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => handleEditRole(role)}
                                              className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
                                              aria-label="Edit role"
                                            >
                                              <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleRemoveRole(project.id, role)}
                                              className="p-1.5 bg-white border border-slate-200 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                              aria-label="Delete role"
                                            >
                                              <TrashIcon className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 bg-slate-50 rounded-lg">
                                  <p className="text-slate-500 text-sm">No open roles.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Applicants Tab */}
                        {projectTabs[project.id] === 'applicants' && (
                          <div>
                            <h4 className="font-medium mb-4">Applicants</h4>
                            {project.applicants.length > 0 ? (
                              <div className="space-y-4">
                                {project.applicants.map((applicant) => (
                                  <div key={applicant.id} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start flex-1">
                                        <button
                                          onClick={() => handleProfileClick(applicant.id)}
                                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                        >
                                          <img
                                            src={applicant.profilePic}
                                            alt={applicant.name}
                                            className="w-12 h-12 rounded-full ring-2 ring-transparent hover:ring-orange-300 transition-all"
                                          />
                                        </button>
                                        <div className="ml-3 flex-1">
                                          <div className="flex items-center mb-1">
                                            <button
                                              onClick={() => handleProfileClick(applicant.id)}
                                              className="font-bold text-slate-900 hover:text-orange-500 transition-colors"
                                            >
                                              {applicant.name}
                                            </button>
                                            <span
                                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                                applicant.fit === 'High'
                                                  ? 'bg-green-100 text-green-700'
                                                  : applicant.fit === 'Medium'
                                                  ? 'bg-yellow-100 text-yellow-700'
                                                  : 'bg-red-100 text-red-700'
                                              }`}
                                            >
                                              {applicant.fit} Match
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-600 mb-2">
                                            {applicant.appliedRoles.join(', ')} • {applicant.university}
                                          </p>
                                          {applicant.message && (
                                            <div className="bg-slate-50 rounded-lg p-3 mt-2">
                                              <p className="text-sm text-slate-700 italic">
                                                "{applicant.message}"
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex space-x-2 ml-4">
                                        <button
                                          onClick={() => handleMessageUser(applicant.id, applicant.name)}
                                          className="p-2 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-300 transition-colors cursor-pointer"
                                          aria-label={`Message ${applicant.name}`}
                                          title={`Message ${applicant.name}`}
                                        >
                                          <MessageSquareIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleRejectApplicant(project.id, applicant)}
                                          className="p-2 bg-white border border-red-200 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                          aria-label="Reject applicant"
                                        >
                                          <XIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleAcceptApplicant(project.id, applicant)}
                                          className="p-2 bg-white border border-green-200 rounded-md text-green-500 hover:bg-green-50 transition-colors"
                                          aria-label="Accept applicant"
                                        >
                                          <CheckIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-slate-500">No applicants yet.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            onClick={() => handleViewProject(project.id)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            View Project
                          </button>
                          {project.status !== 'Completed' && (
                            <button
                              onClick={() => handleMarkCompleted(project.id)}
                              className="px-4 py-2 bg-white border border-green-500 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              Mark as Completed
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-4 py-2 bg-white border border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete Project
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* SAVED PROJECTS TAB */}
        {activeMainTab === 'saved' && (
          <div className="space-y-4">
            {currentProjects.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No saved projects yet.</p>
                <p className="text-sm text-slate-400 mt-2">
                  Bookmark projects you're interested in to save them here.
                </p>
              </div>
            ) : (
              currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <button
                          onClick={() => handleViewProject(project.id)}
                          className="block hover:text-orange-500 transition-colors text-left cursor-pointer w-full"
                        >
                          <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                        </button>
                        <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
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
                      <button
                        onClick={() => handleUnsaveProject(project.id)}
                        className="ml-4 p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        aria-label="Unsave project"
                      >
                        <BookmarkIcon className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                    {project.creator && (
                      <div className="flex items-center pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleProfileClick(project.creator!.id)}
                          className="flex items-center hover:bg-slate-50 rounded-lg p-2 -ml-2 transition-colors"
                        >
                          <img
                            src={project.creator.profilePic}
                            alt={project.creator.name}
                            className="w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-orange-300 transition-all"
                          />
                          <div className="ml-2 text-left">
                            <p className="text-sm font-medium text-slate-900 hover:text-orange-500 transition-colors">
                              {project.creator.name}
                            </p>
                            <p className="text-xs text-slate-500">{project.creator.university}</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROJECTS JOINED TAB */}
        {activeMainTab === 'joined' && (
          <div className="space-y-4">
            {currentProjects.length === 0 ? (
              <div className="text-center py-12">
                <UserPlusIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">You haven't joined any projects yet.</p>
                <p className="text-sm text-slate-400 mt-2">
                  Apply to projects and get accepted to see them here.
                </p>
              </div>
            ) : (
              currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <button
                          onClick={() => handleViewProject(project.id)}
                          className="block hover:text-orange-500 transition-colors text-left cursor-pointer w-full"
                        >
                          <div className="flex items-center mb-2">
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {project.userRole}
                            </span>
                          </div>
                        </button>
                        <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              project.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-700'
                                : project.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {project.status}
                          </span>
                          <span className="mx-2">•</span>
                          <span>Deadline: {project.deadline}</span>
                        </div>
                      </div>
                    </div>
                    {project.creator && (
                      <div className="flex items-center pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500 mr-2">Created by:</span>
                        <button
                          onClick={() => handleProfileClick(project.creator!.id)}
                          className="flex items-center hover:bg-slate-50 rounded-lg p-2 -ml-2 transition-colors"
                        >
                          <img
                            src={project.creator.profilePic}
                            alt={project.creator.name}
                            className="w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-orange-300 transition-all"
                          />
                          <div className="ml-2 text-left">
                            <p className="text-sm font-medium text-slate-900 hover:text-orange-500 transition-colors">
                              {project.creator.name}
                            </p>
                            <p className="text-xs text-slate-500">{project.creator.university}</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* CONFIRMATION MODALS */}
      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Project</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Completed Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Mark as Completed</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Mark this project as completed? This action <strong>CANNOT be undone.</strong>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkCompleted}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Team Member Modal */}
      {showRemoveMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Team Member</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to remove <strong>{selectedMember.name}</strong> from the team?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRemoveMemberModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Role Modal */}
      {showRemoveRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Role</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Remove the <strong>{selectedRole.title}</strong> role? Applicants for this role will be notified.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRemoveRoleModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveRole}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Remove Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Applicant Modal */}
      {showRejectApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <XIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reject Application</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Reject <strong>{selectedApplicant.name}</strong>'s application?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectApplicantModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectApplicant}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <CreateProjectModal
          onClose={() => setShowCreateProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
      </div>
    </div>
  );
};

export default MyProjectsPageNew;
