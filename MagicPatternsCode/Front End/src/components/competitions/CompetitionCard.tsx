import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { Competition } from '../../types/api';

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition }) => {
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return 'bg-purple-100 text-purple-700';
      case 'case-competition':
        return 'bg-blue-100 text-blue-700';
      case 'group-project':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Open</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">In Progress</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Closed</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const start = new Date(competition.startDate);
    const end = new Date(competition.endDate);

    if (now < start) {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Starts in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (now >= start && now <= end) {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else {
      return 'Ended';
    }
  };

  return (
    <div
      onClick={() => navigate(`/competitions/${competition.id || competition._id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer border border-gray-100 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(competition.type)}`}>
              {competition.type === 'hackathon' ? 'Hackathon' : competition.type === 'case-competition' ? 'Case Competition' : 'Group Project'}
            </span>
            {getStatusBadge(competition.status)}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{competition.title}</h3>
          <p className="text-sm text-gray-500">Hosted by {competition.hostName}</p>
        </div>
        <Trophy className="h-8 w-8 text-cardinal flex-shrink-0" />
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{competition.description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {competition.registeredTeamCount} {competition.registeredTeamCount === 1 ? 'team' : 'teams'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {competition.totalParticipants} participants
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatDate(competition.startDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {getDaysRemaining()}
          </span>
        </div>
      </div>

      {/* Team Size */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          Team size: {competition.minTeamSize}-{competition.maxTeamSize} members
        </div>
        {competition.prize && (
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">Prize available</span>
          </div>
        )}
      </div>

      {/* Progress Bar (if in progress) */}
      {competition.status === 'in-progress' && competition.averageProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Average Progress</span>
            <span className="text-xs font-semibold text-gray-700">{competition.averageProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cardinal to-cardinal-light h-2 rounded-full transition-all duration-300"
              style={{ width: `${competition.averageProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionCard;
