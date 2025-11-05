import React, { useState, useEffect } from 'react';
import { SearchIcon, ChevronDownIcon } from 'lucide-react';
import ProjectCard from './ProjectCard';

const SAMPLE_PROJECTS = [{
  id: '1',
  title: 'AI-powered Study Assistant',
  description: 'Building an AI assistant to help students organize notes, schedule study sessions, and provide personalized learning recommendations.',
  tags: ['AI/ML', 'Mobile', 'Education'],
  roles: [{
    title: 'Backend Developer',
    filled: true,
    user: {
      name: 'Alex'
    }
  }, {
    title: 'ML Engineer',
    filled: true,
    user: {
      name: 'Taylor'
    }
  }, {
    title: 'UI/UX Designer',
    filled: false
  }, {
    title: 'Frontend Developer',
    filled: false
  }],
  creator: {
    id: '101',
    name: 'Alex Chen',
    university: 'Stanford',
    profilePic: 'https://i.pravatar.cc/150?img=11'
  }
}, {
  id: '2',
  title: 'Campus Events Platform',
  description: 'Creating a platform for students to discover, organize, and RSVP to campus events. Includes calendar integration and notifications.',
  tags: ['Web', 'Mobile', 'Campus Life'],
  roles: [{
    title: 'Frontend Developer',
    filled: true,
    user: {
      name: 'Jordan'
    }
  }, {
    title: 'Backend Developer',
    filled: false
  }, {
    title: 'UI/UX Designer',
    filled: false
  }],
  creator: {
    id: '102',
    name: 'Jordan Lee',
    university: 'MIT',
    profilePic: 'https://i.pravatar.cc/150?img=12'
  }
}, {
  id: '3',
  title: 'Sustainable Fashion Marketplace',
  description: 'Building a platform for students to buy, sell, and trade second-hand clothing and accessories to promote sustainability on campus.',
  tags: ['E-commerce', 'Sustainability', 'Web'],
  roles: [{
    title: 'Product Manager',
    filled: true,
    user: {
      name: 'Sam'
    }
  }, {
    title: 'Frontend Developer',
    filled: true,
    user: {
      name: 'Riley'
    }
  }, {
    title: 'Backend Developer',
    filled: false
  }, {
    title: 'Marketing Specialist',
    filled: false
  }],
  creator: {
    id: '103',
    name: 'Sam Rivera',
    university: 'NYU',
    profilePic: 'https://i.pravatar.cc/150?img=13'
  }
}];

interface HomePageProps {
  onProjectCreated?: (project: any) => void;
  newProject?: any;
}

const HomePage: React.FC<HomePageProps> = ({ newProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Projects');
  const [sortOption, setSortOption] = useState('Most Recent');
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [newProjectId, setNewProjectId] = useState<string | null>(null);

  // Handle new project addition with animation and persistence
  useEffect(() => {
    if (newProject && newProject.id) {
      // Check if project already exists to prevent duplicates
      setProjects((prevProjects) => {
        const exists = prevProjects.some(p => p.id === newProject.id);
        if (exists) {
          console.log('Project already exists, skipping duplicate:', newProject.id);
          return prevProjects;
        }

        console.log('Adding new project to list:', newProject.id);
        return [newProject, ...prevProjects];
      });

      setNewProjectId(newProject.id);

      // Remove "new" highlight after 3 seconds (but keep the project in the list)
      const timer = setTimeout(() => {
        console.log('Removing NEW badge from project:', newProject.id);
        setNewProjectId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newProject]);

  return (
    <div>
      {/* Enhanced Search Bar with Inline Filter and Sort Dropdowns */}
      <div className="mb-6">
        <div className="flex items-center gap-3 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-50"
              aria-label="Filter projects by category"
            >
              <option value="All Projects">All Projects</option>
              <option value="Tech">Tech</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
              <option value="Case Competitions">Case Competitions</option>
              <option value="Hackathons">Hackathons</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-50"
              aria-label="Sort projects"
            >
              <option value="Most Recent">Most Recent</option>
              <option value="Most Recommended">Most Recommended</option>
              <option value="Short Duration">Short Duration</option>
              <option value="Long Duration">Long Duration</option>
              <option value="Deadline Soon">Deadline Soon</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2-Column Grid Layout for Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isNew={newProjectId === project.id}
          />
        ))}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;