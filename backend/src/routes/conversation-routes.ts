import { Router } from 'express';
import {
  listConversations,
  getConversation,
  createConversation,
  createConversationMessage
} from '../controllers/ConversationController';

const router = Router();

router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.post('/conversations', createConversation);
router.post('/conversation-messages', createConversationMessage);

export default router;