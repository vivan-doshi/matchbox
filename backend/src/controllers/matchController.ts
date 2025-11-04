import { Response } from 'express';
import Match from '../models/Match';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all matches for user
// @route   GET /api/matches
// @access  Private
export const getMatches = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.userId }, { user2: req.userId }],
    })
      .populate('user1', 'firstName lastName preferredName university profilePicture skills')
      .populate('user2', 'firstName lastName preferredName university profilePicture skills')
      .populate('project', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create or update match (approve)
// @route   POST /api/matches
// @access  Private
export const createOrUpdateMatch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { otherUserId, project } = req.body;

    if (!otherUserId) {
      res.status(400).json({
        success: false,
        message: 'Other user ID is required',
      });
      return;
    }

    // Ensure consistent ordering of user IDs
    const [user1, user2] = [req.userId!, otherUserId].sort();

    // Check if match already exists
    let match = await Match.findOne({
      user1,
      user2,
    });

    if (match) {
      // Update approval status
      if (user1 === req.userId) {
        match.approvedByUser1 = true;
      } else {
        match.approvedByUser2 = true;
      }

      // Auto-update isBoxed when both approve
      if (match.approvedByUser1 && match.approvedByUser2) {
        match.isBoxed = true;
      }

      await match.save();
    } else {
      // Create new match
      const matchData: any = {
        user1,
        user2,
        approvedByUser1: user1 === req.userId,
        approvedByUser2: user2 === req.userId,
      };

      if (project) {
        matchData.project = project;
      }

      match = await Match.create(matchData);
    }

    const populatedMatch = await Match.findById(match._id)
      .populate('user1', 'firstName lastName preferredName university profilePicture')
      .populate('user2', 'firstName lastName preferredName university profilePicture')
      .populate('project', 'title');

    res.status(200).json({
      success: true,
      data: populatedMatch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
export const getMatch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('user1', 'firstName lastName preferredName university profilePicture skills bio')
      .populate('user2', 'firstName lastName preferredName university profilePicture skills bio')
      .populate('project', 'title description');

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    // Check if user is part of this match
    const isParticipant =
      match.user1._id.toString() === req.userId ||
      match.user2._id.toString() === req.userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this match',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get pending matches (waiting for approval)
// @route   GET /api/matches/pending
// @access  Private
export const getPendingMatches = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const matches = await Match.find({
      $or: [
        { user1: req.userId, approvedByUser1: true, approvedByUser2: false },
        { user2: req.userId, approvedByUser2: true, approvedByUser1: false },
      ],
    })
      .populate('user1', 'firstName lastName preferredName university profilePicture')
      .populate('user2', 'firstName lastName preferredName university profilePicture')
      .populate('project', 'title');

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get boxed matches (both approved)
// @route   GET /api/matches/boxed
// @access  Private
export const getBoxedMatches = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.userId }, { user2: req.userId }],
      isBoxed: true,
    })
      .populate('user1', 'firstName lastName preferredName university profilePicture skills')
      .populate('user2', 'firstName lastName preferredName university profilePicture skills')
      .populate('project', 'title');

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private
export const deleteMatch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    // Check if user is part of this match
    const isParticipant =
      match.user1.toString() === req.userId ||
      match.user2.toString() === req.userId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this match',
      });
      return;
    }

    await match.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get recommended matches based on skills and interests
// @route   GET /api/matches/recommendations
// @access  Private
export const getRecommendations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Find users with similar interests or complementary skills
    const recommendations = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { interests: { $in: currentUser.interests } },
        { university: currentUser.university },
      ],
    })
      .select('firstName lastName preferredName university profilePicture skills interests bio')
      .limit(20);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
