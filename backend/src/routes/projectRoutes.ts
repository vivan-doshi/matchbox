import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  applyToProject,
  getProjectApplicants,
  getMyApplications,
  updateApplicationStatus,
  getProjectRecommendations,
  getMyProjects,
  getJoinedProjects,
  inviteUserToProject,
  removeTeamMember,
} from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(getProjects).post(protect, createProject);
router.get('/my-projects', protect, getMyProjects);
router.get('/joined', protect, getJoinedProjects);

router
  .route('/:id')
  .get(getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);
router.post('/:id/invite', protect, inviteUserToProject);

router.post('/:id/apply', protect, applyToProject);
router.get('/:id/applicants', protect, getProjectApplicants);
router.get('/:id/my-applications', protect, getMyApplications);
router.put('/:id/applicants/:applicationId', protect, updateApplicationStatus);
router.delete('/:id/roles/:roleId/member', protect, removeTeamMember);
router.get('/:id/recommendations', protect, getProjectRecommendations);

export default router;
