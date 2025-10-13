import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon } from 'lucide-react';
const COMPLETED_PROJECTS = [{
  id: '1',
  title: 'Campus Navigator App',
  description: 'A mobile app that helps new students navigate campus buildings, find the best routes between classes, and discover campus resources.',
  image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800',
  tags: ['Mobile App', 'UI/UX', 'React Native'],
  team: [{
    name: 'Emma Wilson',
    role: 'Product Manager',
    avatar: 'https://i.pravatar.cc/150?img=1'
  }, {
    name: 'Marcus Johnson',
    role: 'Developer',
    avatar: 'https://i.pravatar.cc/150?img=2'
  }, {
    name: 'Sophia Lee',
    role: 'UI Designer',
    avatar: 'https://i.pravatar.cc/150?img=3'
  }],
  links: {
    github: 'https://github.com',
    article: 'https://medium.com'
  }
}, {
  id: '2',
  title: 'StudyMatch',
  description: 'A platform that connects students for study sessions based on courses, availability, and study preferences.',
  image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800',
  tags: ['Web App', 'React', 'Firebase'],
  team: [{
    name: 'Daniel Brown',
    role: 'Full Stack Developer',
    avatar: 'https://i.pravatar.cc/150?img=4'
  }, {
    name: 'Olivia Martinez',
    role: 'Backend Developer',
    avatar: 'https://i.pravatar.cc/150?img=5'
  }],
  links: {
    github: 'https://github.com',
    article: 'https://medium.com'
  }
}, {
  id: '3',
  title: 'EcoEats',
  description: 'An app that helps students find sustainable food options on and around campus, including carbon footprint information and packaging waste details.',
  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800',
  tags: ['Mobile App', 'Sustainability', 'Flutter'],
  team: [{
    name: 'Noah Garcia',
    role: 'Product Designer',
    avatar: 'https://i.pravatar.cc/150?img=6'
  }, {
    name: 'Ava Thompson',
    role: 'Developer',
    avatar: 'https://i.pravatar.cc/150?img=7'
  }, {
    name: 'Liam Rodriguez',
    role: 'Sustainability Consultant',
    avatar: 'https://i.pravatar.cc/150?img=8'
  }],
  links: {
    github: 'https://github.com',
    article: 'https://medium.com'
  }
}];
const ProjectCard: React.FC<{
  project: (typeof COMPLETED_PROJECTS)[0];
}> = ({
  project
}) => {
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
      <div className="h-48 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">{project.title}</h3>
        <p className="text-slate-700 text-sm mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              {tag}
            </span>)}
        </div>
        <div className="border-t border-slate-100 pt-4 mb-4">
          <h4 className="text-sm font-medium mb-3">Team Members</h4>
          <div className="flex flex-wrap gap-3">
            {project.team.map((member, index) => <div key={index} className="flex items-center">
                <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full mr-2" />
                <div>
                  <p className="text-xs font-medium">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
              </div>)}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-slate-800 text-white text-xs px-3 py-2 rounded-md font-medium hover:bg-slate-900 transition-colors flex-1">
            View Code <ExternalLinkIcon className="ml-1 h-3 w-3" />
          </a>
          <a href={project.links.article} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-white text-slate-800 border border-slate-200 text-xs px-3 py-2 rounded-md font-medium hover:bg-slate-50 transition-colors flex-1">
            Read Article <ExternalLinkIcon className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>;
};
const DiscoverPage: React.FC = () => {
  return <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Discover Completed Projects</h2>
        <p className="text-slate-600">
          Explore projects completed by other students for inspiration.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPLETED_PROJECTS.map(project => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>;
};
export default DiscoverPage;