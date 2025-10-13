import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon } from 'lucide-react';
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
}
const ProjectCard: React.FC<ProjectCardProps> = ({
  project
}) => {
  const filledRoles = project.roles.filter(role => role.filled).length;
  const totalRoles = project.roles.length;
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg mb-1">{project.title}</h3>
            <div className="flex items-center text-sm text-slate-500">
              <img src={project.creator.profilePic} alt={project.creator.name} className="w-5 h-5 rounded-full mr-2" />
              <span>
                {project.creator.name} • {project.creator.university}
              </span>
            </div>
          </div>
          <Link to={`/project/${project.id}`} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-100 transition-colors">
            View
          </Link>
        </div>
        <p className="text-slate-700 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              {tag}
            </span>)}
        </div>
        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Team Roles</h4>
            <span className="text-xs text-slate-500">
              {filledRoles}/{totalRoles} filled
            </span>
          </div>
          <div className="space-y-2">
            {project.roles.map((role, index) => <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{role.title}</span>
                {role.filled ? <div className="flex items-center text-green-600 text-xs">
                    <span className="mr-1">{role.user?.name}</span>
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div> : <Link to={`/project/${project.id}`} className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium hover:shadow-sm transition-all">
                    Apply
                  </Link>}
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default ProjectCard;