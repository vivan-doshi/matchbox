import express from 'express';
import {
  createTeam,
  getTeamsByCompetition,
  getTeamById,
  inviteToTeam,
  acceptTeamInvitation,
  updateTeamProgress,
  achieveMilestone,
  submitFinalDeliverables,
  verifyMilestone,
  getMyTeams,
} from '../controllers/teamController';
import { protect } from '../middleware/auth';
import { requireUscIdVerification } from '../middleware/uscIdVerification';
import {
  requireCompetitionHost,
  requireTeamLeader,
  requireTeamMember,
} from '../middleware/competitionAuth';
import {
  createTeamValidation,
  inviteTeamMemberValidation,
  updateProgressValidation,
  achieveMilestoneValidation,
  finalSubmissionValidation,
  verifyMilestoneValidation,
  getTeamValidation,
  listTeamsValidation,
} from '../validators/teamValidator';

const router = express.Router();

// User's teams
router.get('/my-teams', protect, getMyTeams);

// Competition-specific team routes
router.post(
  '/competitions/:competitionId/teams',
  protect,
  requireUscIdVerification,
  createTeamValidation,
  createTeam
);

router.get(
  '/competitions/:competitionId/teams',
  listTeamsValidation,
  getTeamsByCompetition
);

router.get(
  '/competitions/:competitionId/teams/:teamId',
  getTeamValidation,
  getTeamById
);

// Team leader routes
router.post(
  '/competitions/:competitionId/teams/:teamId/invite',
  protect,
  requireTeamLeader,
  inviteTeamMemberValidation,
  inviteToTeam
);

router.post(
  '/competitions/:competitionId/teams/:teamId/submit',
  protect,
  requireTeamLeader,
  finalSubmissionValidation,
  submitFinalDeliverables
);

// Team member routes
router.post(
  '/competitions/:competitionId/teams/:teamId/accept-invite',
  protect,
  requireUscIdVerification,
  acceptTeamInvitation
);

router.patch(
  '/competitions/:competitionId/teams/:teamId/progress',
  protect,
  requireTeamMember,
  updateProgressValidation,
  updateTeamProgress
);

router.post(
  '/competitions/:competitionId/teams/:teamId/milestones/:milestoneId/achieve',
  protect,
  requireTeamMember,
  achieveMilestoneValidation,
  achieveMilestone
);

// Host-only routes
router.post(
  '/competitions/:competitionId/teams/:teamId/milestones/:milestoneId/verify',
  protect,
  requireCompetitionHost,
  verifyMilestoneValidation,
  verifyMilestone
);

export default router;
