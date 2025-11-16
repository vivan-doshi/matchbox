import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserProfilePicture,
  updateUserResume,
  getUserProjects,
  searchUsers,
  saveProject,
  unsaveProject,
  getSavedProjects,
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { uploadUserFiles } from '../middleware/upload';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.put('/:id/profile-picture', protect, uploadUserFiles, updateUserProfilePicture);
router.put('/:id/resume', protect, uploadUserFiles, updateUserResume);
router.get('/:id/projects', getUserProjects);
router.post('/:id/saved-projects/:projectId', protect, saveProject);
router.delete('/:id/saved-projects/:projectId', protect, unsaveProject);
router.get('/:id/saved-projects', protect, getSavedProjects);

export default router;
