import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';

const router = Router();

router.get('/', DocumentController.list);
router.post('/', DocumentController.upsert);
router.delete('/:id', DocumentController.delete);

export default router;