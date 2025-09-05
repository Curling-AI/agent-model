import { Router } from 'express';
import { AgentController } from '../controllers/AgentController';

const router = Router();

router.get('/', AgentController.getAll);
router.get('/:id', AgentController.getById);
router.post('/', AgentController.upsert);
router.delete('/:id', AgentController.delete);

export default router;