import express from 'express';
import {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  updateCompetition,
  closeCompetition,
  getCompetitionDashboard,
  getCompetitionAnalytics,
  getHostedCompetitions,
} from '../controllers/competitionController';
import { protect } from '../middleware/auth';
import { requireUscIdVerification } from '../middleware/uscIdVerification';
import { requireCompetitionHost } from '../middleware/competitionAuth';
import {
  createCompetitionValidation,
  updateCompetitionValidation,
  getCompetitionByIdValidation,
  listCompetitionsValidation,
} from '../validators/competitionValidator';

const router = express.Router();

// Public routes
router.get('/', listCompetitionsValidation, getCompetitions);
router.get('/:id', getCompetitionByIdValidation, getCompetitionById);

// Protected routes (require authentication + USC ID verification)
router.post(
  '/',
  protect,
  requireUscIdVerification,
  createCompetitionValidation,
  createCompetition
);

// Host-only routes
router.get('/hosted/my-competitions', protect, getHostedCompetitions);

router.put(
  '/:id',
  protect,
  requireCompetitionHost,
  updateCompetitionValidation,
  updateCompetition
);

router.post('/:id/close', protect, requireCompetitionHost, closeCompetition);

router.get(
  '/:id/dashboard',
  protect,
  requireCompetitionHost,
  getCompetitionDashboard
);

router.get(
  '/:id/analytics',
  protect,
  requireCompetitionHost,
  getCompetitionAnalytics
);

export default router;
