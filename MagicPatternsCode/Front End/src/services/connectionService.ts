import apiClient from '../utils/apiClient';

export interface Connection {
  _id: string;
  requester: any;
  recipient: any;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Blocked';
  requestMessage?: string;
  declineReason?: string;
  connectionContext?: {
    sharedInterests?: string[];
    sharedSkills?: string[];
    mutualConnections?: number;
    fromProject?: string;
  };
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface ConnectionStatus {
  exists: boolean;
  status: string | null;
  isSent: boolean;
  isReceived: boolean;
  connection?: Connection;
}

export interface FollowStatus {
  isFollowing: boolean;
  isFollower: boolean;
  isMutual: boolean;
}

export interface NetworkStatus {
  connection: ConnectionStatus;
  follow: FollowStatus;
  mutualConnectionsCount: number;
}

export interface ConnectionSuggestion {
  user: any;
  score: number;
  matchReasons: {
    sameUniversity: boolean;
    sameMajor: boolean;
    sharedSkills: string[];
    sharedInterests: string[];
    mutualConnectionsCount: number;
  };
}

// Connection API functions
export const connectionService = {
  // Send connection request
  sendConnectionRequest: async (data: {
    recipientId: string;
    message?: string;
    context?: {
      fromProject?: string;
    };
  }) => {
    const response = await apiClient.post('/connections/request', data);
    return response.data;
  },

  // Get all connections
  getConnections: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/connections', { params });
    return response.data;
  },

  // Get received connection requests
  getReceivedRequests: async () => {
    const response = await apiClient.get('/connections/requests/received');
    return response.data;
  },

  // Get sent connection requests
  getSentRequests: async () => {
    const response = await apiClient.get('/connections/requests/sent');
    return response.data;
  },

  // Accept connection request
  acceptConnectionRequest: async (connectionId: string) => {
    const response = await apiClient.put(`/connections/${connectionId}/accept`);
    return response.data;
  },

  // Decline connection request
  declineConnectionRequest: async (connectionId: string, reason?: string) => {
    const response = await apiClient.put(`/connections/${connectionId}/decline`, {
      reason,
    });
    return response.data;
  },

  // Remove connection
  removeConnection: async (connectionId: string) => {
    const response = await apiClient.delete(`/connections/${connectionId}`);
    return response.data;
  },

  // Get mutual connections
  getMutualConnections: async (userId: string) => {
    const response = await apiClient.get(`/connections/mutual/${userId}`);
    return response.data;
  },

  // Get connection status with another user
  getConnectionStatus: async (userId: string): Promise<{ success: boolean; data: NetworkStatus }> => {
    const response = await apiClient.get(`/connections/status/${userId}`);
    return response.data;
  },

  // Get connection suggestions
  getConnectionSuggestions: async (limit: number = 10) => {
    const response = await apiClient.get('/connections/suggestions', {
      params: { limit },
    });
    return response.data;
  },
};

// Follow API functions
export const followService = {
  // Follow a user
  followUser: async (userId: string) => {
    const response = await apiClient.post(`/follows/${userId}`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId: string) => {
    const response = await apiClient.delete(`/follows/${userId}`);
    return response.data;
  },

  // Get followers
  getFollowers: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/follows/followers', { params });
    return response.data;
  },

  // Get following
  getFollowing: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/follows/following', { params });
    return response.data;
  },

  // Get follow status with another user
  getFollowStatus: async (userId: string) => {
    const response = await apiClient.get(`/follows/status/${userId}`);
    return response.data;
  },

  // Toggle notifications for a followed user
  toggleFollowNotifications: async (userId: string, enabled: boolean) => {
    const response = await apiClient.put(`/follows/${userId}/notifications`, {
      enabled,
    });
    return response.data;
  },

  // Get network statistics
  getNetworkStats: async (userId?: string) => {
    const endpoint = userId ? `/follows/stats/${userId}` : '/follows/stats';
    const response = await apiClient.get(endpoint);
    return response.data;
  },
};
