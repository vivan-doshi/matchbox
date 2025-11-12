import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon, LinkedinIcon, GithubIcon, ClockIcon, EyeIcon, PlusIcon } from 'lucide-react';
import type { DiscoverUser } from '../../types/discover';

interface UserProfileModalProps {
  user: DiscoverUser;
  onClose: () => void;
  onInvite: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onInvite }) => {
  const navigate = useNavigate();
  const profileId = user.id || user.rawId || user._id;

  const handleViewFullProfile = () => {
    if (!profileId) return;
    onClose();
    navigate(`/profile/${profileId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Profile Preview
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close profile preview"
          >
            <XIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={user.profilePicture || '/default-avatar.png'}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-32 h-32 rounded-2xl object-cover shadow-sm"
              />
              <p className="mt-3 text-sm text-slate-600">{user.title}</p>
              <p className="text-sm text-slate-500">{user.school}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <ClockIcon className="h-4 w-4" />
                {user.availability.totalHours} hrs/week
              </div>
              <div className="mt-4 flex gap-2">
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <LinkedinIcon className="h-4 w-4 text-slate-600" />
                  </a>
                )}
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <GithubIcon className="h-4 w-4 text-slate-600" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  About
                </p>
                <p className="mt-2 text-slate-700 leading-relaxed">{user.bio}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={`${skill.name}-${index}`}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill.name} • {skill.proficiency}
                    </span>
                  ))}
                </div>
              </div>

              {user.interests.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={`${interest}-${index}`}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onInvite}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              Invite to Project
            </button>
            <button
              onClick={handleViewFullProfile}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              <EyeIcon className="h-4 w-4" />
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
