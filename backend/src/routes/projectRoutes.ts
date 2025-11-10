import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  applyToProject,
  getProjectApplicants,
  updateApplicationStatus,
  getProjectRecommendations,
  getMyProjects,
} from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(getProjects).post(protect, createProject);
router.get('/my-projects', protect, getMyProjects);

router
  .route('/:id')
  .get(getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/apply', protect, applyToProject);
router.get('/:id/applicants', protect, getProjectApplicants);
router.put('/:id/applicants/:applicationId', protect, updateApplicationStatus);
router.get('/:id/recommendations', protect, getProjectRecommendations);

export default router;
