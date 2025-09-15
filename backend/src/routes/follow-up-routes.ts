import { Router } from 'express';
import { FollowUpController } from '@/controllers/FollowUpController';
import { FollowUpMessageController } from '@/controllers/FollowUpMessageController';
import { FollowUpMessageDocumentController } from '@/controllers/FollowUpMessageDocumentController';

const router = Router();

router.post('/', FollowUpController.upsert);
router.get('/', FollowUpController.list);
router.delete('/:id', FollowUpController.delete);
router.post('/messages/', FollowUpMessageController.upsert);
router.get('/:followUpId/messages/', FollowUpMessageController.list);
router.delete('/messages/:id', FollowUpMessageController.delete);
router.post('/messages/documents/', FollowUpMessageDocumentController.upsert);
router.get('/messages/:messageId/documents', FollowUpMessageDocumentController.list);
router.delete('/messages/documents/:id', FollowUpMessageDocumentController.delete);

export default router;