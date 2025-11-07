import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon, CheckCircleIcon, CircleIcon } from 'lucide-react';

type Role = {
  title: string;
  filled: boolean;
  user?: {
    name: string;
  };
};

type Creator = {
  id: string;
  name: string;
  university: string;
  profilePic: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  roles: Role[];
  creator: Creator;
};

interface ProjectCardProps {
  project: Project;
  isNew?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isNew = false }) => {
  const [isSaved, setIsSaved] = useState(false);

  const filledRoles = project.roles.filter((role) => role.filled).length;
  const totalRoles = project.roles.length;

  // Check if description is long (more than 150 characters for truncation)
  const isDescriptionLong = project.description.length > 150;
  const displayDescription = project.description.substring(0, 150);

  // Load saved state from localStorage
  useEffect(() => {
    const loadSavedState = () => {
      const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      setIsSaved(savedProjects.includes(project.id));
    };

    loadSavedState();

    // Listen for changes from My Projects page
    const handleSavedProjectsChange = () => {
      loadSavedState();
    };

    window.addEventListener('savedProjectsChanged', handleSavedProjectsChange);

    return () => {
      window.removeEventListener('savedProjectsChanged', handleSavedProjectsChange);
    };
  }, [project.id]);

  // Toggle bookmark/save state
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    let updated;
    if (isSaved) {
      updated = savedProjects.filter((pid: string) => pid !== project.id);
    } else {
      updated = [...savedProjects, project.id];
    }
    localStorage.setItem('savedProjects', JSON.stringify(updated));
    setIsSaved(!isSaved);

    // Dispatch custom event to notify My Projects page
    window.dispatchEvent(new Event('savedProjectsChanged'));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all relative h-full flex flex-col">
      {/* Header section with badges */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4 z-10 pointer-events-none">
        {/* "New" Badge for Recently Created Projects */}
        {isNew && (
          <div className="pointer-events-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse">
              NEW
            </span>
          </div>
        )}

        {/* Spacer to push bookmark to the right if no badge */}
        {!isNew && <div></div>}

        {/* Bookmark Icon in Top-Right Corner */}
        <button
          onClick={handleBookmarkToggle}
          className="pointer-events-auto p-2 rounded-full hover:bg-slate-100 transition-colors bg-white bg-opacity-80"
          aria-label={isSaved ? 'Remove bookmark' : 'Bookmark project'}
        >
          <BookmarkIcon
            className={`h-5 w-5 transition-colors ${
              isSaved
                ? 'fill-orange-500 text-orange-500'
                : 'text-slate-400 hover:text-orange-500'
            }`}
          />
        </button>
      </div>

      <div className="p-6 pt-16 flex-grow flex flex-col">
        {/* Project Title - Clickable */}
        <div className="mb-3">
          <Link to={`/project/${project.id}`}>
            <h3 className="font-bold text-lg mb-1 hover:text-orange-500 transition-colors cursor-pointer">
              {project.title}
            </h3>
          </Link>
          <div className="flex items-center text-sm text-slate-500">
            <img
              src={project.creator.profilePic}
              alt={project.creator.name}
              className="w-5 h-5 rounded-full mr-2"
            />
            <span>
              {project.creator.name} • {project.creator.university}
            </span>
          </div>
        </div>

        {/* Project Description with "See More" functionality */}
        <p className="text-slate-700 text-sm mb-4">
          {displayDescription}
          {isDescriptionLong && '...'}
          {isDescriptionLong && (
            <Link
              to={`/project/${project.id}`}
              className="ml-1 text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              See More
            </Link>
          )}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Team Roles Section with Icon-Based System */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">Team Roles</h4>
            <span className="text-xs text-slate-500">
              {filledRoles}/{totalRoles} filled
            </span>
          </div>

          {/* Icon-Based Role Display */}
          <div className="flex flex-wrap gap-3">
            {project.roles.map((role, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Role Icon Badge */}
                {role.filled ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-green-50 border border-green-200">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      {role.title}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={`/project/${project.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm cursor-pointer transform hover:scale-105"
                  >
                    <CircleIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">
                      {role.title}
                    </span>
                  </Link>
                )}

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {role.filled ? (
                    <>Position Filled</>
                  ) : (
                    <>Position Open - Click to Apply</>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
