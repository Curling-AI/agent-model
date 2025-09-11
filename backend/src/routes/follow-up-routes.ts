import { Router } from 'express';
import { FollowUpController } from '@/controllers/FollowUpController';
import followUpMessageRoutes from './follow-up-message-routes';

const router = Router();

router.post('/', FollowUpController.upsert);
router.get('/', FollowUpController.list);
router.delete('/:id', FollowUpController.delete);
router.use('/', followUpMessageRoutes);

export default router;