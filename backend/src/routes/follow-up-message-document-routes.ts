import { Router } from 'express';
import { FollowUpMessageDocumentController } from '@/controllers/FollowUpMessageDocumentController';

const router = Router();

router.post('documents/', FollowUpMessageDocumentController.upsert);
router.get(':messageId/documents/', FollowUpMessageDocumentController.list);
router.delete('documents/:id', FollowUpMessageDocumentController.delete);

export default router;