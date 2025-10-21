import { Router } from 'express';
import {
  ConversationController
} from '../controllers/ConversationController';

const router = Router();

router.get('/', ConversationController.listConversations);
router.post('/process-message', ConversationController.processMessages);
router.post('/', ConversationController.upsertConversation);
router.delete('/:id', ConversationController.deleteConversation);
router.put('/:id/mode', ConversationController.changeConversationMode);

export default router;