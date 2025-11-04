import React, { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import ProjectCard from './ProjectCard';
import apiClient from '../../utils/apiClient';
import type { Project } from '../../types/api';

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

interface HomePageProps {
  newProject?: Project | null;
}

const HomePage: React.FC<HomePageProps> = ({ newProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjects({
        search: searchTerm || undefined,
        tags: activeFilters.length > 0 ? activeFilters : undefined,
      });

      // Transform backend data to match the UI format
      const transformedProjects = response.data.map((project: any) => ({
        id: project._id || project.id,
        title: project.title,
        description: project.description,
        tags: project.tags,
        roles: project.roles,
        creator: {
          id: project.creator._id || project.creator.id || project.creator,
          name: typeof project.creator === 'object'
            ? `${project.creator.firstName} ${project.creator.lastName}`
            : 'Unknown',
          university: typeof project.creator === 'object' ? project.creator.university : '',
          profilePic: typeof project.creator === 'object' ? project.creator.profilePicture : undefined,
        }
      }));

      setProjects(transformedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, activeFilters]);

  // Add newly created project to the list
  useEffect(() => {
    if (newProject) {
      console.log('HomePage: New project received', newProject);
      const projectData = newProject as any; // API returns _id
      const transformedProject = {
        id: projectData._id || newProject.id,
        title: newProject.title,
        description: newProject.description,
        tags: newProject.tags,
        roles: newProject.roles,
        creator: {
          id: typeof newProject.creator === 'object' ? (newProject.creator as any)._id || newProject.creator.id : newProject.creator,
          name: typeof newProject.creator === 'object'
            ? `${newProject.creator.firstName} ${newProject.creator.lastName}`
            : 'Unknown',
          university: typeof newProject.creator === 'object' ? newProject.creator.university : '',
          profilePic: typeof newProject.creator === 'object' ? newProject.creator.profilePicture : undefined,
        }
      };
      setProjects(prev => [transformedProject, ...prev]);
    }
  }, [newProject]);

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

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-slate-600">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No projects found. Create your first project!</p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="space-y-6">
          {projects.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>;
};
export default HomePage;