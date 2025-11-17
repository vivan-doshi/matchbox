import express from 'express';
import { protect } from '../middleware/auth';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  toggleFollowNotifications,
  getNetworkStats,
} from '../controllers/followController';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Follow/unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get followers/following lists
router.get('/followers', getFollowers);
router.get('/following', getFollowing);

// Follow status and utilities
router.get('/status/:userId', getFollowStatus);
router.put('/:userId/notifications', toggleFollowNotifications);

// Network statistics
router.get('/stats/:userId?', getNetworkStats);

export default router;
