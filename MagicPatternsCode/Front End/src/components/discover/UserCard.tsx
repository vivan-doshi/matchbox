import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, PlusIcon, EyeIcon, LinkedinIcon, GithubIcon } from 'lucide-react';
import type { DiscoverUser } from '../../types/discover';
import { getProfilePictureUrl } from '../../utils/profileHelpers';

interface UserCardProps {
  user: DiscoverUser;
  viewMode: 'grid' | 'list';
  onInvite: () => void;
  onViewProfile?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, viewMode, onInvite, onViewProfile }) => {
  const navigate = useNavigate();
  const profileId = user.id || user.rawId || user._id;

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
      return;
    }

    if (!profileId) return;
    navigate(`/profile/${profileId}`);
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Expert':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Fluent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Beginner':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
        onClick={handleViewProfile}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleViewProfile();
        }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Profile Picture */}
          <div
            className="md:w-48 h-48 overflow-hidden cursor-pointer flex-shrink-0"
            onClick={handleViewProfile}
          >
            <img
              src={getProfilePictureUrl(user.profilePicture as any)}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3
                  className="text-xl font-bold text-slate-900 hover:text-orange-600 cursor-pointer transition-colors"
                  onClick={handleViewProfile}
                >
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-slate-600">{user.title}</p>
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkedinIcon className="h-4 w-4 text-slate-600" />
                  </a>
                )}
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GithubIcon className="h-4 w-4 text-slate-600" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-slate-600 mb-3">
              <span className="flex items-center gap-1">
                <span className="font-medium">{user.major}</span>
              </span>
              <span>•</span>
              <span>Class of {user.graduationYear}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {user.availability.totalHours} hrs/week
              </span>
            </div>

            <p className="text-sm text-slate-700 mb-4 line-clamp-2">{user.bio}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {user.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getProficiencyColor(skill.proficiency)}`}
                >
                  {skill.name}
                </span>
              ))}
              {user.skills.length > 4 && (
                <span className="px-2.5 py-1 text-xs text-slate-500">
                  +{user.skills.length - 4} more
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Invite to Project
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <EyeIcon className="h-4 w-4" />
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col cursor-pointer"
      onClick={handleViewProfile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleViewProfile();
      }}
    >
      {/* Profile Picture */}
      <div
        className="h-48 overflow-hidden cursor-pointer"
        onClick={handleViewProfile}
      >
        <img
          src={getProfilePictureUrl(user.profilePicture as any)}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3
              className="text-lg font-bold text-slate-900 hover:text-orange-600 cursor-pointer transition-colors"
              onClick={handleViewProfile}
            >
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-slate-600">{user.title}</p>
          </div>

          {/* Social Links */}
          <div className="flex gap-1">
            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkedinIcon className="h-3.5 w-3.5 text-slate-600" />
              </a>
            )}
            {user.github && (
              <a
                href={user.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <GithubIcon className="h-3.5 w-3.5 text-slate-600" />
              </a>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-600 mb-3">
          <div className="mb-1">{user.major}</div>
          <div className="flex items-center justify-between">
            <span>Class of {user.graduationYear}</span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {user.availability.totalHours} hrs/week
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-4 line-clamp-3 flex-1">{user.bio}</p>

        {/* Skills Preview */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {user.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getProficiencyColor(skill.proficiency)}`}
            >
              {skill.name}
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-slate-500">
              +{user.skills.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Invite to Project
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <EyeIcon className="h-4 w-4" />
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
