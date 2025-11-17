import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Bell, Check, X, MenuIcon } from 'lucide-react';
import { connectionService, followService } from '../services/connectionService';
import { getProfilePictureUrl } from '../utils/profileHelpers';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

type TabType = 'connections' | 'followers' | 'following' | 'requests';

const NetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections, setConnections] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    connections: 0,
    followers: 0,
    following: 0,
    requests: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Fetch data when tab changes
    switch (activeTab) {
      case 'connections':
        fetchConnections();
        break;
      case 'followers':
        fetchFollowers();
        break;
      case 'following':
        fetchFollowing();
        break;
      case 'requests':
        fetchRequests();
        break;
    }
  }, [activeTab]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchConnections(),
      fetchRequests(),
      fetchSuggestions(),
    ]);
  };

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await connectionService.getConnections();
      setConnections(response.data || []);
      setStats((prev) => ({ ...prev, connections: response.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const response = await followService.getFollowers();
      setFollowers(response.data || []);
      setStats((prev) => ({ ...prev, followers: response.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to fetch followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const response = await followService.getFollowing();
      setFollowing(response.data || []);
      setStats((prev) => ({ ...prev, following: response.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to fetch following:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await connectionService.getReceivedRequests();
      setRequests(response.data || []);
      setStats((prev) => ({ ...prev, requests: response.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await connectionService.getConnectionSuggestions(10);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      await connectionService.acceptConnectionRequest(connectionId);
      await fetchRequests();
      await fetchConnections();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (connectionId: string) => {
    try {
      await connectionService.declineConnectionRequest(connectionId);
      await fetchRequests();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to decline request');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await followService.unfollowUser(userId);
      await fetchFollowing();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to unfollow');
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      await connectionService.removeConnection(connectionId);
      await fetchConnections();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to remove connection');
    }
  };

  return (
    <div className="min-h-screen page-background-gradient flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-6 w-6 text-slate-700" />
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold">My Network</h1>
          </div>
        </div>
      </header>

      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 mb-0">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            My Network
          </h1>
          <p className="text-slate-600">
            Manage your connections and grow your professional network
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { id: 'connections', label: 'Connections', count: stats.connections, icon: Users },
            { id: 'followers', label: 'Followers', count: stats.followers, icon: UserPlus },
            { id: 'following', label: 'Following', count: stats.following, icon: UserCheck },
            { id: 'requests', label: 'Pending Requests', count: stats.requests, icon: Bell },
          ].map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-slate-400" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-8">
            {[
              { id: 'connections', label: 'Connections', count: stats.connections },
              { id: 'followers', label: 'Followers', count: stats.followers },
              { id: 'following', label: 'Following', count: stats.following },
              { id: 'requests', label: 'Requests', count: stats.requests },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="text-slate-600 mt-4">Loading...</p>
            </div>
          ) : (
            <>
              {/* Connections Tab */}
              {activeTab === 'connections' && (
                <div>
                  {connections.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No connections yet</p>
                      <p className="text-sm text-slate-500">
                        Start connecting with people to grow your network
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {connections.map((conn) => (
                        <div
                          key={conn.connectionId}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <img
                              src={getProfilePictureUrl(conn.user.profilePicture)}
                              alt={`${conn.user.firstName} ${conn.user.lastName}`}
                              className="w-14 h-14 rounded-full object-cover cursor-pointer"
                              onClick={() => navigate(`/profile/${conn.user._id}`)}
                            />
                            <div className="flex-1">
                              <h3
                                className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/profile/${conn.user._id}`)}
                              >
                                {conn.user.firstName} {conn.user.lastName}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {conn.user.major} • {conn.user.university}
                              </p>
                              {conn.connectedAt && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Connected {new Date(conn.connectedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/profile/${conn.user._id}`)}
                              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleRemoveConnection(conn.connectionId)}
                              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div>
                  {requests.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No pending requests</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {requests.map((request) => (
                        <div
                          key={request._id}
                          className="p-4 border border-blue-200 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4 flex-1">
                              <img
                                src={getProfilePictureUrl(request.requester.profilePicture)}
                                alt={`${request.requester.firstName} ${request.requester.lastName}`}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {request.requester.firstName} {request.requester.lastName}
                                </h3>
                                <p className="text-sm text-slate-600">
                                  {request.requester.major} • {request.requester.university}
                                </p>
                                {request.connectionContext?.mutualConnections > 0 && (
                                  <p className="text-xs text-blue-700 mt-1">
                                    {request.connectionContext.mutualConnections} mutual{' '}
                                    {request.connectionContext.mutualConnections === 1
                                      ? 'connection'
                                      : 'connections'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {request.requestMessage && (
                            <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
                              <p className="text-sm text-slate-700 italic">
                                "{request.requestMessage}"
                              </p>
                            </div>
                          )}

                          {request.connectionContext?.sharedInterests?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-slate-700 mb-2">
                                Shared Interests:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {request.connectionContext.sharedInterests.map(
                                  (interest: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                                    >
                                      {interest}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(request._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm"
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Followers Tab */}
              {activeTab === 'followers' && (
                <div>
                  {followers.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No followers yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {followers.map((follower) => (
                        <div
                          key={follower.user._id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={getProfilePictureUrl(follower.user.profilePicture)}
                              alt={`${follower.user.firstName} ${follower.user.lastName}`}
                              className="w-14 h-14 rounded-full object-cover cursor-pointer"
                              onClick={() => navigate(`/profile/${follower.user._id}`)}
                            />
                            <div>
                              <h3
                                className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/profile/${follower.user._id}`)}
                              >
                                {follower.user.firstName} {follower.user.lastName}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {follower.user.major} • {follower.user.university}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/profile/${follower.user._id}`)}
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium"
                          >
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Following Tab */}
              {activeTab === 'following' && (
                <div>
                  {following.length === 0 ? (
                    <div className="text-center py-12">
                      <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">Not following anyone yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {following.map((follow) => (
                        <div
                          key={follow.user._id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={getProfilePictureUrl(follow.user.profilePicture)}
                              alt={`${follow.user.firstName} ${follow.user.lastName}`}
                              className="w-14 h-14 rounded-full object-cover cursor-pointer"
                              onClick={() => navigate(`/profile/${follow.user._id}`)}
                            />
                            <div>
                              <h3
                                className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/profile/${follow.user._id}`)}
                              >
                                {follow.user.firstName} {follow.user.lastName}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {follow.user.major} • {follow.user.university}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/profile/${follow.user._id}`)}
                              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleUnfollow(follow.user._id)}
                              className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 text-sm font-medium"
                            >
                              Unfollow
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              People You May Know
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.slice(0, 6).map((suggestion) => (
                <div
                  key={suggestion.user._id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={getProfilePictureUrl(suggestion.user.profilePicture)}
                      alt={`${suggestion.user.firstName} ${suggestion.user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${suggestion.user._id}`)}
                    />
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => navigate(`/profile/${suggestion.user._id}`)}
                      >
                        {suggestion.user.firstName} {suggestion.user.lastName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {suggestion.user.major}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {suggestion.matchReasons.mutualConnectionsCount > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {suggestion.matchReasons.mutualConnectionsCount} mutual
                      </span>
                    )}
                    {suggestion.matchReasons.sameMajor && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Same major
                      </span>
                    )}
                    {suggestion.matchReasons.sharedSkills.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {suggestion.matchReasons.sharedSkills.length} shared skills
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/profile/${suggestion.user._id}`)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NetworkPage;
