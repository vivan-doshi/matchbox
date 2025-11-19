import express from 'express';
import { signup, login, getMe, checkEmail, verifyEmail, resendVerificationEmail } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { uploadUserFiles } from '../middleware/upload';

const router = express.Router();

router.post('/check-email', checkEmail);
router.post('/signup', uploadUserFiles, signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

export default router;
