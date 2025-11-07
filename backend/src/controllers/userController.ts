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
    // Check if user is updating their own profile
    if (req.params.id !== req.userId) {
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
    } = req.body;

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
        weeklyAvailability,
      },
      {
        new: true,
        runValidators: true,
      }
    );

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
      .select('-password')
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
