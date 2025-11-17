import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Connection from '../models/Connection';
import Follow from '../models/Follow';
import User from '../models/User';
import Chat from '../models/Chat';

// Send a connection request
export const sendConnectionRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { recipientId, message, context } = req.body;
    const requesterId = req.userId;

    // Validation
    if (!recipientId) {
      res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
      return;
    }

    if (recipientId === requesterId) {
      res.status(400).json({
        success: false,
        message: 'Cannot send connection request to yourself',
      });
      return;
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      res.status(404).json({
        success: false,
        message: 'Recipient user not found',
      });
      return;
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingConnection) {
      res.status(400).json({
        success: false,
        message: `Connection ${existingConnection.status.toLowerCase()} already exists`,
        data: existingConnection,
      });
      return;
    }

    // Calculate connection context
    const requester = await User.findById(requesterId);
    const sharedInterests = requester?.interests.filter((interest) =>
      recipient.interests.includes(interest)
    );
    const sharedSkills = requester?.skills
      .map((s) => s.name)
      .filter((skill) => recipient.skills.some((rs) => rs.name === skill));

    // Get mutual connections count
    const mutualConnections = await (Connection as any).getMutualConnections(
      requesterId!,
      recipientId
    );

    // Create connection request
    const connection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'Pending',
      requestMessage: message,
      connectionContext: {
        sharedInterests,
        sharedSkills,
        mutualConnections: mutualConnections.length,
        fromProject: context?.fromProject,
      },
    });

    // Create a chat for the connection
    const chat = await Chat.create({
      participants: [requesterId, recipientId],
      type: 'direct',
      messages: [],
      relatedConnection: connection._id,
      status: 'Pending',
    });

    // Populate the connection
    await connection.populate([
      {
        path: 'requester',
        select: 'firstName lastName email profilePicture university major',
      },
      {
        path: 'recipient',
        select: 'firstName lastName email profilePicture university major',
      },
    ]);

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: {
        connection,
        chatId: chat._id,
      },
    });
  } catch (error: any) {
    console.error('[sendConnectionRequest] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send connection request',
    });
  }
};

// Get all connections (accepted)
export const getConnections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const connections = await Connection.find({
      $or: [
        { requester: userId, status: 'Accepted' },
        { recipient: userId, status: 'Accepted' },
      ],
    })
      .populate('requester', 'firstName lastName email profilePicture university major bio skills interests')
      .populate('recipient', 'firstName lastName email profilePicture university major bio skills interests')
      .sort('-acceptedAt')
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Connection.countDocuments({
      $or: [
        { requester: userId, status: 'Accepted' },
        { recipient: userId, status: 'Accepted' },
      ],
    });

    // Transform to return the other user
    const transformedConnections = connections.map((conn) => {
      const otherUser =
        conn.requester._id.toString() === userId
          ? conn.recipient
          : conn.requester;
      return {
        connectionId: conn._id,
        user: otherUser,
        connectedAt: conn.acceptedAt,
        context: conn.connectionContext,
      };
    });

    res.json({
      success: true,
      data: transformedConnections,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error('[getConnections] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch connections',
    });
  }
};

// Get pending connection requests received
export const getReceivedRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      recipient: userId,
      status: 'Pending',
    })
      .populate('requester', 'firstName lastName email profilePicture university major bio skills interests network')
      .sort('-createdAt');

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('[getReceivedRequests] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch received requests',
    });
  }
};

// Get pending connection requests sent
export const getSentRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      requester: userId,
      status: 'Pending',
    })
      .populate('recipient', 'firstName lastName email profilePicture university major bio')
      .sort('-createdAt');

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('[getSentRequests] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sent requests',
    });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection request not found',
      });
      return;
    }

    // Verify the current user is the recipient
    if (connection.recipient.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only accept requests sent to you',
      });
      return;
    }

    if (connection.status !== 'Pending') {
      res.status(400).json({
        success: false,
        message: `Connection is already ${connection.status.toLowerCase()}`,
      });
      return;
    }

    // Update connection status
    connection.status = 'Accepted';
    connection.acceptedAt = new Date();
    await connection.save();

    // Update chat status
    await Chat.updateOne(
      { relatedConnection: connectionId },
      { status: 'Accepted' }
    );

    // Increment connection counts for both users
    await User.updateOne(
      { _id: connection.requester },
      { $inc: { 'network.connections.count': 1 } }
    );
    await User.updateOne(
      { _id: connection.recipient },
      { $inc: { 'network.connections.count': 1 } }
    );

    // Auto-follow each other when connected
    try {
      await Follow.create({
        follower: connection.requester,
        following: connection.recipient,
        notificationsEnabled: true,
      });
      await Follow.create({
        follower: connection.recipient,
        following: connection.requester,
        notificationsEnabled: true,
      });

      // Update following/follower counts
      await User.updateOne(
        { _id: connection.requester },
        { $inc: { 'network.following.count': 1, 'network.followers.count': 1 } }
      );
      await User.updateOne(
        { _id: connection.recipient },
        { $inc: { 'network.following.count': 1, 'network.followers.count': 1 } }
      );
    } catch (followError) {
      // Follow might already exist, ignore error
      console.log('[acceptConnectionRequest] Follow already exists or error:', followError);
    }

    await connection.populate([
      {
        path: 'requester',
        select: 'firstName lastName email profilePicture university major',
      },
      {
        path: 'recipient',
        select: 'firstName lastName email profilePicture university major',
      },
    ]);

    res.json({
      success: true,
      message: 'Connection request accepted',
      data: connection,
    });
  } catch (error: any) {
    console.error('[acceptConnectionRequest] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept connection request',
    });
  }
};

// Decline connection request
export const declineConnectionRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection request not found',
      });
      return;
    }

    // Verify the current user is the recipient
    if (connection.recipient.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only decline requests sent to you',
      });
      return;
    }

    if (connection.status !== 'Pending') {
      res.status(400).json({
        success: false,
        message: `Connection is already ${connection.status.toLowerCase()}`,
      });
      return;
    }

    // Update connection status
    connection.status = 'Rejected';
    connection.rejectedAt = new Date();
    connection.declineReason = reason;
    await connection.save();

    // Update chat status
    await Chat.updateOne(
      { relatedConnection: connectionId },
      { status: 'Rejected' }
    );

    res.json({
      success: true,
      message: 'Connection request declined',
      data: connection,
    });
  } catch (error: any) {
    console.error('[declineConnectionRequest] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to decline connection request',
    });
  }
};

// Remove connection
export const removeConnection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { connectionId } = req.params;
    const userId = req.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
      return;
    }

    // Verify the current user is part of the connection
    const isRequester = connection.requester.toString() === userId;
    const isRecipient = connection.recipient.toString() === userId;

    if (!isRequester && !isRecipient) {
      res.status(403).json({
        success: false,
        message: 'You can only remove your own connections',
      });
      return;
    }

    if (connection.status !== 'Accepted') {
      res.status(400).json({
        success: false,
        message: 'Can only remove accepted connections',
      });
      return;
    }

    // Decrement connection counts
    await User.updateOne(
      { _id: connection.requester },
      { $inc: { 'network.connections.count': -1 } }
    );
    await User.updateOne(
      { _id: connection.recipient },
      { $inc: { 'network.connections.count': -1 } }
    );

    // Delete the connection
    await Connection.deleteOne({ _id: connectionId });

    res.json({
      success: true,
      message: 'Connection removed successfully',
    });
  } catch (error: any) {
    console.error('[removeConnection] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove connection',
    });
  }
};

// Get mutual connections between current user and another user
export const getMutualConnections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const mutualConnections = await (Connection as any).getMutualConnections(
      currentUserId!,
      userId
    );

    res.json({
      success: true,
      data: mutualConnections,
      count: mutualConnections.length,
    });
  } catch (error: any) {
    console.error('[getMutualConnections] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch mutual connections',
    });
  }
};

// Get connection status with another user
export const getConnectionStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const connectionStatus = await (Connection as any).getConnectionStatus(
      currentUserId!,
      userId
    );

    const followStatus = await (Follow as any).getFollowStatus(
      currentUserId!,
      userId
    );

    const mutualConnections = connectionStatus.exists && connectionStatus.status === 'Accepted'
      ? await (Connection as any).getMutualConnections(currentUserId!, userId)
      : [];

    res.json({
      success: true,
      data: {
        connection: connectionStatus,
        follow: followStatus,
        mutualConnectionsCount: mutualConnections.length,
      },
    });
  } catch (error: any) {
    console.error('[getConnectionStatus] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch connection status',
    });
  }
};

// Get connection suggestions
export const getConnectionSuggestions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { limit = '10' } = req.query;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get existing connections
    const existingConnections = await Connection.find({
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId },
      ],
    }).select('requester recipient');

    const connectedUserIds = existingConnections.map((conn) =>
      conn.requester.toString() === currentUserId
        ? conn.recipient.toString()
        : conn.requester.toString()
    );

    // Exclude self and already connected users
    const excludeIds = [currentUserId, ...connectedUserIds];

    // Find potential connections
    const allUsers = await User.find({
      _id: { $nin: excludeIds },
    }).limit(100); // Get more users for scoring

    // Score each user
    const scoredUsers = await Promise.all(
      allUsers.map(async (user) => {
        let score = 0;

        // Same university (high weight)
        if (user.university === currentUser.university) {
          score += 40;
        }

        // Same major
        if (user.major === currentUser.major) {
          score += 30;
        }

        // Shared skills
        const sharedSkills = currentUser.skills.filter((s1) =>
          user.skills.some((s2) => s2.name === s1.name)
        );
        score += sharedSkills.length * 15;

        // Shared interests
        const sharedInterests = currentUser.interests.filter((i) =>
          user.interests.includes(i)
        );
        score += sharedInterests.length * 10;

        // Similar graduation year (±1 year)
        if (
          currentUser.graduationYear &&
          user.graduationYear &&
          Math.abs(currentUser.graduationYear - user.graduationYear) <= 1
        ) {
          score += 20;
        }

        // Mutual connections (highest weight)
        const mutualConnections = await (Connection as any).getMutualConnections(
          currentUserId!,
          user._id.toString()
        );
        score += mutualConnections.length * 50;

        return {
          user,
          score,
          matchReasons: {
            sameUniversity: user.university === currentUser.university,
            sameMajor: user.major === currentUser.major,
            sharedSkills: sharedSkills.map((s) => s.name),
            sharedInterests,
            mutualConnectionsCount: mutualConnections.length,
          },
        };
      })
    );

    // Sort by score and take top N
    const suggestions = scoredUsers
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    console.error('[getConnectionSuggestions] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch connection suggestions',
    });
  }
};
