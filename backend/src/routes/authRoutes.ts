import express from 'express';
import { signup, login, getMe, checkEmail } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/check-email', checkEmail);
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
