import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Follow from '../models/Follow';
import User from '../models/User';

// Follow a user
export const followUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    // Validation
    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    if (userId === followerId) {
      res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      });
      return;
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingFollow) {
      res.status(400).json({
        success: false,
        message: 'Already following this user',
        data: existingFollow,
      });
      return;
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: followerId,
      following: userId,
      notificationsEnabled: true,
    });

    // Increment counts
    await User.updateOne(
      { _id: followerId },
      { $inc: { 'network.following.count': 1 } }
    );
    await User.updateOne(
      { _id: userId },
      { $inc: { 'network.followers.count': 1 } }
    );

    await follow.populate('following', 'firstName lastName email profilePicture university major');

    res.status(201).json({
      success: true,
      message: 'Successfully followed user',
      data: follow,
    });
  } catch (error: any) {
    console.error('[followUser] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to follow user',
    });
  }
};

// Unfollow a user
export const unfollowUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    // Find and delete the follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!follow) {
      res.status(404).json({
        success: false,
        message: 'Follow relationship not found',
      });
      return;
    }

    // Decrement counts
    await User.updateOne(
      { _id: followerId },
      { $inc: { 'network.following.count': -1 } }
    );
    await User.updateOne(
      { _id: userId },
      { $inc: { 'network.followers.count': -1 } }
    );

    res.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error: any) {
    console.error('[unfollowUser] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unfollow user',
    });
  }
};

// Get followers of the current user
export const getFollowers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'firstName lastName email profilePicture university major bio skills interests network')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Follow.countDocuments({ following: userId });

    const transformedFollowers = followers.map((f) => ({
      user: f.follower,
      followedAt: f.createdAt,
    }));

    res.json({
      success: true,
      data: transformedFollowers,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error('[getFollowers] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch followers',
    });
  }
};

// Get users the current user is following
export const getFollowing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const following = await Follow.find({ follower: userId })
      .populate('following', 'firstName lastName email profilePicture university major bio skills interests network')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Follow.countDocuments({ follower: userId });

    const transformedFollowing = following.map((f) => ({
      user: f.following,
      followedAt: f.createdAt,
      notificationsEnabled: f.notificationsEnabled,
    }));

    res.json({
      success: true,
      data: transformedFollowing,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    console.error('[getFollowing] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch following',
    });
  }
};

// Get follow status between current user and another user
export const getFollowStatus = async (
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

    const status = await (Follow as any).getFollowStatus(currentUserId!, userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('[getFollowStatus] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch follow status',
    });
  }
};

// Toggle notifications for a followed user
export const toggleFollowNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { enabled } = req.body;
    const followerId = req.userId;

    if (typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'enabled field must be a boolean',
      });
      return;
    }

    const follow = await Follow.findOneAndUpdate(
      {
        follower: followerId,
        following: userId,
      },
      {
        notificationsEnabled: enabled,
      },
      { new: true }
    );

    if (!follow) {
      res.status(404).json({
        success: false,
        message: 'Follow relationship not found',
      });
      return;
    }

    res.json({
      success: true,
      message: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
      data: follow,
    });
  } catch (error: any) {
    console.error('[toggleFollowNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle notifications',
    });
  }
};

// Get network statistics for a user
export const getNetworkStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params || { userId: req.userId };
    const targetUserId = userId || req.userId;

    const user = await User.findById(targetUserId).select('network');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const followCounts = await (Follow as any).getCounts(targetUserId);

    res.json({
      success: true,
      data: {
        connections: user.network?.connections.count || 0,
        followers: followCounts.followers,
        following: followCounts.following,
        mutualFollows: followCounts.mutualFollows,
      },
    });
  } catch (error: any) {
    console.error('[getNetworkStats] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch network stats',
    });
  }
};
