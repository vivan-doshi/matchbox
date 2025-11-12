import { Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log('[updateUserProfile] Starting profile update');
    console.log('[updateUserProfile] User ID from params:', req.params.id);
    console.log('[updateUserProfile] Authenticated user ID:', req.userId);
    console.log('[updateUserProfile] Update data:', req.body);

    // Check if user is updating their own profile
    if (req.params.id !== req.userId) {
      console.log('[updateUserProfile] Authorization failed - user mismatch');
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
      return;
    }

    const {
      firstName,
      lastName,
      preferredName,
      university,
      major,
      graduationYear,
      isAlumni,
      bio,
      skills,
      professionalLinks,
      interests,
      profilePicture,
      weeklyAvailability,
      resume,
    } = req.body;

    console.log('[updateUserProfile] Finding and updating user...');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        preferredName,
        university,
        major,
        graduationYear,
        isAlumni,
        bio,
        skills,
      professionalLinks,
      interests,
      profilePicture,
      resume,
      weeklyAvailability,
    },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      console.log('[updateUserProfile] User not found');
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    console.log('[updateUserProfile] Profile updated successfully');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('[updateUserProfile] Error:', error);
    console.error('[updateUserProfile] Error message:', error.message);
    console.error('[updateUserProfile] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's projects
// @route   GET /api/users/:id/projects
// @access  Public
export const getUserProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.find({ creator: req.params.id })
      .populate('creator', 'firstName lastName preferredName university profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Save a project for the current user
// @route   POST /api/users/:id/saved-projects/:projectId
// @access  Private
export const saveProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: userId, projectId } = req.params as { id: string; projectId: string };

    if (!req.userId || req.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to save projects for this user',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const alreadySaved = user.savedProjects?.some(
      (savedProject) => savedProject.toString() === projectId
    );

    if (alreadySaved) {
      res.status(400).json({
        success: false,
        message: 'Project already saved',
      });
      return;
    }

    user.savedProjects = [...(user.savedProjects || []), projectId as any];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Project saved',
      data: user.savedProjects,
    });
  } catch (error: any) {
    console.error('Error saving project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Remove a saved project for the current user
// @route   DELETE /api/users/:id/saved-projects/:projectId
// @access  Private
export const unsaveProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: userId, projectId } = req.params as { id: string; projectId: string };

    if (!req.userId || req.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to remove saved projects for this user',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.savedProjects = (user.savedProjects || []).filter(
      (savedProject) => savedProject.toString() !== projectId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Project removed from saved list',
      data: user.savedProjects,
    });
  } catch (error: any) {
    console.error('Error removing saved project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get saved projects for a user
// @route   GET /api/users/:id/saved-projects
// @access  Private
export const getSavedProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.params as { id: string };

    if (!req.userId || req.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view saved projects for this user',
      });
      return;
    }

    const user = await User.findById(userId).populate({
      path: 'savedProjects',
      populate: { path: 'creator', select: 'firstName lastName preferredName university profilePicture' },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.savedProjects || [],
    });
  } catch (error: any) {
    console.error('Error fetching saved projects:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (for development/admin)
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query
// @access  Private
export const searchUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q, university, skills } = req.query;

    let query: any = {};

    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password -resume.dataUrl')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
