import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();

router.post('/meta', WebhookController.upsertMeta);
router.post('/zapi', WebhookController.upsertZapi);
router.post('/uazapi', WebhookController.upsertUazapi);

export default router;