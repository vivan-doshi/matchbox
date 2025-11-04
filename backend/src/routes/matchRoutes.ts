import express from 'express';
import {
  getMatches,
  createOrUpdateMatch,
  getMatch,
  getPendingMatches,
  getBoxedMatches,
  deleteMatch,
  getRecommendations,
} from '../controllers/matchController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getMatches).post(protect, createOrUpdateMatch);

router.get('/pending', protect, getPendingMatches);
router.get('/boxed', protect, getBoxedMatches);
router.get('/recommendations', protect, getRecommendations);

router.route('/:id').get(protect, getMatch).delete(protect, deleteMatch);

export default router;
