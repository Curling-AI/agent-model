import { Router } from 'express';
import { CrmColumnController } from '../controllers/CrmColumnController';

const router = Router();

router.get('/', CrmColumnController.listCrmColumns);
router.post('/', CrmColumnController.upsertCrmColumn);
router.delete('/:id', CrmColumnController.deleteCrmColumn);

export default router;