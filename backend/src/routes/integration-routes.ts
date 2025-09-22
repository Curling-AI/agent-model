import { Router } from 'express';
import { IntegrationController } from '../controllers/IntegrationController';

const router = Router();

router.get('/', IntegrationController.list);
router.post('/', IntegrationController.upsert);
router.delete('/', IntegrationController.delete);

export default router;