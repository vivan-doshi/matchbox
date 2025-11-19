import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';

/**
 * Middleware to verify that the user has a verified USC ID
 * Required for competition-related operations
 */
export const requireUscIdVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Fetch the user to check USC ID verification status
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if USC ID is verified
    if (!user.uscIdVerified) {
      res.status(403).json({
        success: false,
        message: 'USC ID verification required to access competitions. Please verify your USC ID in your profile settings.',
        requiresVerification: true,
      });
      return;
    }

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying USC ID status',
      error: error.message,
    });
  }
};
