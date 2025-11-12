import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, ChevronDownIcon } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { apiClient } from '../../utils/apiClient';
import { Project } from '../../types/api';

interface HomePageProps {
  onProjectCreated?: (project: any) => void;
  newProject?: any;
}

const HomePage: React.FC<HomePageProps> = ({ newProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Projects');
  const [sortOption, setSortOption] = useState('Most Recent');
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectId, setNewProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const normalize = (value?: string) => (value ? value.toLowerCase() : '');

    const matchesQuery = (project: Project) => {
      if (!query) return true;
      const title = normalize(project.title);
      const description = normalize(project.description);
      const category = normalize(project.category);
      const tags = (project.tags || []).map(tag => tag.toLowerCase());
      return (
        title.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        tags.some(tag => tag.includes(query))
      );
    };

    const matchesCategory =
      filterCategory === 'All Projects'
        ? () => true
        : (project: Project) => project.category === filterCategory;

    const getDurationValue = (project: Project) =>
      typeof project.duration === 'number' ? project.duration : Number.MAX_SAFE_INTEGER;

    const getDeadlineValue = (project: Project) =>
      project.deadline ? new Date(project.deadline).getTime() : Number.MAX_SAFE_INTEGER;

    const getRecommendationScore = (project: any) =>
      project.recommendations ??
      project.matchScore ??
      (Array.isArray(project.roles)
        ? project.roles.filter((role: any) => role.filled).length
        : 0);

    const parseDate = (value?: string) => (value ? new Date(value).getTime() : 0);

    const sorted = projects
      .filter(matchesQuery)
      .filter(matchesCategory)
      .slice();

    sorted.sort((a: Project, b: Project) => {
      switch (sortOption) {
        case 'Most Recommended':
          return getRecommendationScore(b) - getRecommendationScore(a);
        case 'Short Duration':
          return getDurationValue(a) - getDurationValue(b);
        case 'Long Duration':
          return getDurationValue(b) - getDurationValue(a);
        case 'Deadline Soon':
          return getDeadlineValue(a) - getDeadlineValue(b);
        case 'Most Recent':
        default:
          return parseDate(b.createdAt) - parseDate(a.createdAt);
      }
    });

    return sorted;
  }, [projects, searchTerm, filterCategory, sortOption]);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects();

      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

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
        return [newProject as Project, ...prevProjects];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
        <span>
          Showing <span className="font-semibold text-slate-700">{filteredProjects.length}</span> of{' '}
          {projects.length} projects
        </span>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">
            {projects.length === 0
              ? 'No projects found. Create one to get started!'
              : 'No projects match your search. Try adjusting the filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isNew={newProjectId === project.id}
            />
          ))}
        </div>
      )}

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
