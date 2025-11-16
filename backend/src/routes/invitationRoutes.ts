import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getReceivedInvitations,
  acceptInvitation,
  rejectInvitation,
} from '../controllers/invitationController';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/received', getReceivedInvitations);
router.put('/:id/accept', acceptInvitation);
router.put('/:id/reject', rejectInvitation);

export default router;
