import { Router } from 'express';
import { FollowUpMessageController } from '@/controllers/FollowUpMessageController';
import followUpMessageDocumentRoutes from './follow-up-message-document-routes';

const router = Router();

router.post('messages/', FollowUpMessageController.upsert);
router.get(':followUpId/messages/', FollowUpMessageController.list);
router.delete('messages/:id', FollowUpMessageController.delete);
router.use('/', followUpMessageDocumentRoutes);

export default router;