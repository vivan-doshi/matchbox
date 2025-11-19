import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import competitionService from '../services/competitionService';
import mongoose from 'mongoose';

// @desc    Create a new competition
// @route   POST /api/competitions
// @access  Private (USC ID verified)
export const createCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.userId!;
    const user = req.user!;

    const hostName = user.preferredName || `${user.firstName} ${user.lastName}`;

    const competition = await competitionService.createCompetition(
      userId,
      hostName,
      req.body
    );

    res.status(201).json({
      success: true,
      data: competition,
      message: 'Competition created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating competition',
    });
  }
};

// @desc    Get all competitions with filters
// @route   GET /api/competitions
// @access  Public
export const getCompetitions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await competitionService.getCompetitions(filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching competitions',
    });
  }
};

// @desc    Get competition by ID
// @route   GET /api/competitions/:id
// @access  Public
export const getCompetitionById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const competitionId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.userId;

    const competition = await competitionService.getCompetitionById(
      competitionId,
      userId
    );

    if (!competition) {
      res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: competition,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching competition',
    });
  }
};

// @desc    Update competition
// @route   PUT /api/competitions/:id
// @access  Private (Host only)
export const updateCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const competitionId = new mongoose.Types.ObjectId(req.params.id);

    const competition = await competitionService.updateCompetition(
      competitionId,
      req.body
    );

    if (!competition) {
      res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: competition,
      message: 'Competition updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating competition',
    });
  }
};

// @desc    Close competition
// @route   POST /api/competitions/:id/close
// @access  Private (Host only)
export const closeCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const competitionId = new mongoose.Types.ObjectId(req.params.id);

    const competition = await competitionService.closeCompetition(competitionId);

    if (!competition) {
      res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: competition,
      message: 'Competition closed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error closing competition',
    });
  }
};

// @desc    Get competition dashboard (host only)
// @route   GET /api/competitions/:id/dashboard
// @access  Private (Host only)
export const getCompetitionDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const competitionId = new mongoose.Types.ObjectId(req.params.id);

    const dashboard = await competitionService.getCompetitionDashboard(
      competitionId
    );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching competition dashboard',
    });
  }
};

// @desc    Get competition analytics
// @route   GET /api/competitions/:id/analytics
// @access  Private (Host only)
export const getCompetitionAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const competitionId = new mongoose.Types.ObjectId(req.params.id);

    const analytics = await competitionService.getCompetitionAnalytics(
      competitionId
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching competition analytics',
    });
  }
};

// @desc    Get hosted competitions
// @route   GET /api/competitions/hosted
// @access  Private
export const getHostedCompetitions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const competitions = await competitionService.getHostedCompetitions(userId);

    res.status(200).json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hosted competitions',
    });
  }
};
