import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

router.get('/', UserController.listUsers);
router.post('/', UserController.upsertUser);
router.delete('/:id', UserController.deleteUser);

export default router;