import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, FilterIcon, CheckIcon, XIcon } from 'lucide-react';
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
const FilterButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({
  label,
  active,
  onClick
}) => <button className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`} onClick={onClick}>
    {label}
  </button>;
const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  return <div>
      <div className="mb-6">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input type="text" placeholder="Search projects..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          <FilterButton label="All Projects" active={activeFilters.length === 0} onClick={() => setActiveFilters([])} />
          <FilterButton label="Tech" active={activeFilters.includes('Tech')} onClick={() => toggleFilter('Tech')} />
          <FilterButton label="Design" active={activeFilters.includes('Design')} onClick={() => toggleFilter('Design')} />
          <FilterButton label="Business" active={activeFilters.includes('Business')} onClick={() => toggleFilter('Business')} />
          <FilterButton label="Case Competitions" active={activeFilters.includes('Case Competitions')} onClick={() => toggleFilter('Case Competitions')} />
        </div>
      </div>
      <div className="space-y-6">
        {SAMPLE_PROJECTS.map(project => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>;
};
export default HomePage;