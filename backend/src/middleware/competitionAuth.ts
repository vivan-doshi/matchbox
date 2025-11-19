import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Competition from '../models/Competition';
import Team from '../models/Team';
import mongoose from 'mongoose';

/**
 * Middleware to verify that the user is the host of a competition
 */
export const requireCompetitionHost = async (
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

    const competitionId = req.params.competitionId || req.params.id;

    if (!competitionId) {
      res.status(400).json({
        success: false,
        message: 'Competition ID is required',
      });
      return;
    }

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      res.status(404).json({
        success: false,
        message: 'Competition not found',
      });
      return;
    }

    // Check if user is the host
    if (competition.hostId.toString() !== req.userId.toString()) {
      res.status(403).json({
        success: false,
        message: 'Only the competition host can perform this action',
      });
      return;
    }

    // Attach competition to request for downstream use
    req.competition = competition;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying competition host',
      error: error.message,
    });
  }
};

/**
 * Middleware to verify that the user is a team leader
 */
export const requireTeamLeader = async (
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

    const teamId = req.params.teamId || req.params.id;

    if (!teamId) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required',
      });
      return;
    }

    const team = await Team.findById(teamId);

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    // Check if user is the team leader
    if (team.leaderId.toString() !== req.userId.toString()) {
      res.status(403).json({
        success: false,
        message: 'Only the team leader can perform this action',
      });
      return;
    }

    // Attach team to request for downstream use
    req.team = team;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying team leader',
      error: error.message,
    });
  }
};

/**
 * Middleware to verify that the user is a team member (leader or regular member)
 */
export const requireTeamMember = async (
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

    const teamId = req.params.teamId || req.params.id;

    if (!teamId) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required',
      });
      return;
    }

    const team = await Team.findById(teamId);

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    // Check if user is a team member
    const isMember = team.members.some(
      (member) =>
        member.userId.toString() === req.userId!.toString() &&
        member.status === 'active'
    );

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'You must be a team member to perform this action',
      });
      return;
    }

    // Attach team to request for downstream use
    req.team = team;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying team membership',
      error: error.message,
    });
  }
};

// Extend AuthRequest to include competition and team
declare global {
  namespace Express {
    interface Request {
      competition?: any;
      team?: any;
    }
  }
}
