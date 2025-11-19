import React, { useState, useEffect } from 'react';
import { X, Users, Sparkles } from 'lucide-react';
import { connectionService } from '../../services/connectionService';
import { getProfilePictureUrl } from '../../utils/profileHelpers';

interface ConnectionRequestModalProps {
  user: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mutualConnections, setMutualConnections] = useState<any[]>([]);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [sharedSkills, setSharedSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchConnectionContext();
  }, [user]);

  const fetchConnectionContext = async () => {
    try {
      // Fetch mutual connections
      const mutualResponse = await connectionService.getMutualConnections(
        user._id || user.id
      );
      setMutualConnections(mutualResponse.data || []);

      // Calculate shared interests and skills from user data if available
      // This would ideally come from the current user's profile
      // For now, we'll show what's available on the target user
      if (user.interests) {
        setSharedInterests(user.interests.slice(0, 5));
      }
      if (user.skills) {
        setSharedSkills(user.skills.slice(0, 5).map((s: any) => s.name || s));
      }
    } catch (error) {
      console.error('Failed to fetch connection context:', error);
    }
  };

  const handleSend = async () => {
    if (sending) return;

    setSending(true);
    try {
      await connectionService.sendConnectionRequest({
        recipientId: user._id || user.id,
        message: message.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to send connection request:', error);
      alert(
        error?.response?.data?.message || 'Failed to send connection request'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Connect with {user.firstName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={getProfilePictureUrl(user.profilePicture)}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-slate-600">
                {user.major} • {user.university}
              </p>
            </div>
          </div>

          {/* Connection Context */}
          {mutualConnections.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">
                  {mutualConnections.length} mutual connection
                  {mutualConnections.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex -space-x-2">
                {mutualConnections.slice(0, 5).map((conn, index) => (
                  <img
                    key={index}
                    src={getProfilePictureUrl(conn.profilePicture)}
                    alt={`${conn.firstName} ${conn.lastName}`}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    title={`${conn.firstName} ${conn.lastName}`}
                  />
                ))}
                {mutualConnections.length > 5 && (
                  <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">
                      +{mutualConnections.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shared Interests */}
          {sharedInterests.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-cardinal" />
                <p className="text-sm font-semibold text-slate-700">
                  Shared Interests:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sharedInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-cardinal rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared Skills */}
          {sharedSkills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-slate-700">
                  Skills:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sharedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${user.firstName}, I'd like to connect with you on MatchBox!`}
              rows={4}
              maxLength={300}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">
                {message.length}/300 characters
              </p>
              <p className="text-xs text-slate-500">
                Help {user.firstName} remember where you met
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequestModal;
