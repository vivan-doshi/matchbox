import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserProjects,
  searchUsers,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.get('/:id/projects', getUserProjects);

export default router;
