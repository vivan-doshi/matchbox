import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import teamService from '../services/teamService';
import mongoose from 'mongoose';

// @desc    Create a new team
// @route   POST /api/competitions/:competitionId/teams
// @access  Private (USC ID verified)
export const createTeam = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const competitionId = new mongoose.Types.ObjectId(req.params.competitionId);
    const userId = req.userId!;
    const user = req.user!;

    const leaderName = user.preferredName || `${user.firstName} ${user.lastName}`;
    const leaderEmail = user.email;

    const team = await teamService.createTeam(
      competitionId,
      userId,
      leaderName,
      leaderEmail,
      {
        name: req.body.name,
        description: req.body.description,
      }
    );

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating team',
    });
  }
};

// @desc    Get all teams in a competition
// @route   GET /api/competitions/:competitionId/teams
// @access  Public
export const getTeamsByCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const competitionId = new mongoose.Types.ObjectId(req.params.competitionId);

    const teams = await teamService.getTeamsByCompetition(competitionId);

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching teams',
    });
  }
};

// @desc    Get team by ID
// @route   GET /api/competitions/:competitionId/teams/:teamId
// @access  Public
export const getTeamById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const teamId = new mongoose.Types.ObjectId(req.params.teamId);

    const team = await teamService.getTeamById(teamId);

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team',
    });
  }
};

// @desc    Invite member to team
// @route   POST /api/competitions/:competitionId/teams/:teamId/invite
// @access  Private (Team leader only)
export const inviteToTeam = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const teamId = new mongoose.Types.ObjectId(req.params.teamId);
    const userId = req.userId!;

    await teamService.inviteToTeam(teamId, req.body.email, userId);

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${req.body.email}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending invitation',
    });
  }
};

// @desc    Accept team invitation
// @route   POST /api/competitions/:competitionId/teams/:teamId/accept-invite
// @access  Private
export const acceptTeamInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const teamId = new mongoose.Types.ObjectId(req.params.teamId);
    const userId = req.userId!;
    const user = req.user!;

    const userName = user.preferredName || `${user.firstName} ${user.lastName}`;
    const userEmail = user.email;

    const team = await teamService.acceptTeamInvitation(
      teamId,
      userId,
      userName,
      userEmail
    );

    res.status(200).json({
      success: true,
      data: team,
      message: 'Successfully joined team',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error accepting invitation',
    });
  }
};

// @desc    Update team progress
// @route   PATCH /api/competitions/:competitionId/teams/:teamId/progress
// @access  Private (Team member)
export const updateTeamProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const teamId = new mongoose.Types.ObjectId(req.params.teamId);
    const userId = req.userId!;
    const user = req.user!;

    const updatedByName = user.preferredName || `${user.firstName} ${user.lastName}`;

    const team = await teamService.updateProgress(
      teamId,
      req.body.progressPercentage,
      req.body.comment,
      userId,
      updatedByName
    );

    res.status(200).json({
      success: true,
      data: team,
      message: 'Team progress updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating progress',
    });
  }
};

// @desc    Achieve milestone
// @route   POST /api/competitions/:competitionId/teams/:teamId/milestones/:milestoneId/achieve
// @access  Private (Team member)
export const achieveMilestone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const teamId = new mongoose.Types.ObjectId(req.params.teamId);
    const milestoneId = new mongoose.Types.ObjectId(req.params.milestoneId);

    const team = await teamService.achieveMilestone(
      teamId,
      milestoneId,
      req.body.comment,
      req.body.deliverables || []
    );

    res.status(200).json({
      success: true,
      data: team,
      message: 'Milestone achieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error achieving milestone',
    });
  }
};

// @desc    Submit final deliverables
// @route   POST /api/competitions/:competitionId/teams/:teamId/submit
// @access  Private (Team leader)
export const submitFinalDeliverables = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const teamId = new mongoose.Types.ObjectId(req.params.teamId);

    const team = await teamService.submitFinal(
      teamId,
      req.body.deliverables,
      req.body.teamSummary,
      req.body.contributionBreakdown
    );

    res.status(200).json({
      success: true,
      data: team,
      message: 'Final submission completed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting final deliverables',
    });
  }
};

// @desc    Verify milestone (host only)
// @route   POST /api/competitions/:competitionId/teams/:teamId/milestones/:milestoneId/verify
// @access  Private (Host only)
export const verifyMilestone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const teamId = new mongoose.Types.ObjectId(req.params.teamId);
    const milestoneId = new mongoose.Types.ObjectId(req.params.milestoneId);

    const team = await teamService.verifyMilestone(
      teamId,
      milestoneId,
      req.body.verified,
      req.body.feedback
    );

    res.status(200).json({
      success: true,
      data: team,
      message: 'Milestone verification updated',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying milestone',
    });
  }
};

// @desc    Get user's teams
// @route   GET /api/teams/my-teams
// @access  Private
export const getMyTeams = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const teams = await teamService.getTeamsByUser(userId);

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching teams',
    });
  }
};
