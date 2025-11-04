import express from 'express';
import {
  getChats,
  createOrGetChat,
  getChat,
  sendMessage,
  getMessages,
  markAsRead,
  getGroups,
  createGroup,
  getGroup,
  sendGroupMessage,
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Chat routes
router.route('/').get(protect, getChats).post(protect, createOrGetChat);
router.get('/:id', protect, getChat);
router.post('/:id/messages', protect, sendMessage);
router.get('/:id/messages', protect, getMessages);
router.put('/:id/read', protect, markAsRead);

// Group routes
router.route('/groups').get(protect, getGroups).post(protect, createGroup);
router.get('/groups/:id', protect, getGroup);
router.post('/groups/:id/messages', protect, sendGroupMessage);

export default router;
