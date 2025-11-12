import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserProjects,
  searchUsers,
  saveProject,
  unsaveProject,
  getSavedProjects,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.get('/:id/projects', getUserProjects);
router.post('/:id/saved-projects/:projectId', protect, saveProject);
router.delete('/:id/saved-projects/:projectId', protect, unsaveProject);
router.get('/:id/saved-projects', protect, getSavedProjects);

export default router;
