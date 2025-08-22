import { Router } from 'express';
import { AgentController } from '../controllers/AgentController';

const router = Router();

router.get('/agents', AgentController.getAll);
router.get('/agents/:id', AgentController.getById);
router.post('/agents', AgentController.create);
router.put('/agents/:id', AgentController.update);
router.delete('/agents/:id', AgentController.delete);

export default router;