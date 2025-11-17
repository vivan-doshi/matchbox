import express from 'express';
import { protect } from '../middleware/auth';
import {
  sendConnectionRequest,
  getConnections,
  getReceivedRequests,
  getSentRequests,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  getMutualConnections,
  getConnectionStatus,
  getConnectionSuggestions,
} from '../controllers/connectionController';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Connection request routes
router.post('/request', sendConnectionRequest);
router.get('/', getConnections);
router.get('/requests/received', getReceivedRequests);
router.get('/requests/sent', getSentRequests);
router.put('/:connectionId/accept', acceptConnectionRequest);
router.put('/:connectionId/decline', declineConnectionRequest);
router.delete('/:connectionId', removeConnection);

// Connection utility routes
router.get('/mutual/:userId', getMutualConnections);
router.get('/status/:userId', getConnectionStatus);
router.get('/suggestions', getConnectionSuggestions);

export default router;
