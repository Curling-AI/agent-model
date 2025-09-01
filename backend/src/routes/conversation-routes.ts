import { Router } from 'express';
import {
  listConversations,
  getConversation,
  createConversation,
  createConversationMessage
} from '../controllers/ConversationController';

const router = Router();

router.get('/', listConversations);
router.get('/:id', getConversation);
router.post('/', createConversation);
router.post('/conversation-messages', createConversationMessage);

export default router;