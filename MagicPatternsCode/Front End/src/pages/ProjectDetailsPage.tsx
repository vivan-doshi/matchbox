import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, UsersIcon, CalendarIcon, TagIcon, CheckIcon, XIcon } from 'lucide-react';
const ProjectDetailsPage: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  // This would come from an API call in a real app
  const project = {
    id: '1',
    title: 'AI-powered Study Assistant',
    description: "We're building an AI assistant to help students organize notes, schedule study sessions, and provide personalized learning recommendations. The app will use natural language processing to analyze notes and machine learning to create personalized study plans.",
    tags: ['AI/ML', 'Mobile', 'Education'],
    roles: [{
      title: 'Backend Developer',
      description: 'Responsible for building the API and database architecture',
      filled: true,
      user: {
        id: '101',
        name: 'Alex Chen',
        university: 'Stanford',
        profilePic: 'https://i.pravatar.cc/150?img=11'
      }
    }, {
      title: 'ML Engineer',
      description: 'Will work on developing and training the machine learning models',
      filled: true,
      user: {
        id: '102',
        name: 'Taylor Kim',
        university: 'MIT',
        profilePic: 'https://i.pravatar.cc/150?img=12'
      }
    }, {
      title: 'UI/UX Designer',
      description: 'Will create user flows, wireframes, and high-fidelity designs',
      filled: false
    }, {
      title: 'Frontend Developer',
      description: 'Will implement the UI designs and integrate with the backend API',
      filled: false
    }],
    creator: {
      id: '101',
      name: 'Alex Chen',
      university: 'Stanford',
      profilePic: 'https://i.pravatar.cc/150?img=11'
    },
    timeline: {
      startDate: 'Oct 15, 2023',
      endDate: 'Dec 20, 2023'
    }
  };
  const filledRoles = project.roles.filter(role => role.filled).length;
  const totalRoles = project.roles.length;
  return <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-slate-600 hover:text-orange-500 transition-colors mr-4">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">Project Details</h1>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-slate-500 mr-2">Created by</span>
            <div className="flex items-center">
              <img src={project.creator.profilePic} alt={project.creator.name} className="w-8 h-8 rounded-full mr-2" />
              <span className="font-medium">{project.creator.name}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-3">{project.title}</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center text-sm text-slate-600">
                <UsersIcon className="h-4 w-4 mr-1" />
                <span>
                  {filledRoles}/{totalRoles} roles filled
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>
                  {project.timeline.startDate} - {project.timeline.endDate}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag, index) => <div key={index} className="flex items-center text-sm">
                  <TagIcon className="h-4 w-4 mr-1 text-slate-500" />
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {tag}
                  </span>
                </div>)}
            </div>
            <div className="mb-8">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-slate-700">{project.description}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Team Roles</h3>
                <span className="text-sm text-slate-500">
                  {filledRoles}/{totalRoles} filled
                </span>
              </div>
              <div className="space-y-4">
                {project.roles.map((role, index) => <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold mb-1">{role.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          {role.description}
                        </p>
                      </div>
                      {role.filled ? <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Filled
                        </div> : <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:shadow-sm transition-all">
                          Apply
                        </button>}
                    </div>
                    {role.filled && role.user && <div className="flex items-center mt-3">
                        <img src={role.user.profilePic} alt={role.user.name} className="w-6 h-6 rounded-full mr-2" />
                        <div>
                          <p className="text-xs font-medium">
                            {role.user.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {role.user.university}
                          </p>
                        </div>
                      </div>}
                  </div>)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default ProjectDetailsPage;