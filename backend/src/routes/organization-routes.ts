import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';

const router = Router();

router.get('/', OrganizationController.getAll);
router.get('/:id', OrganizationController.getById);
router.post('/', OrganizationController.upsert);
router.delete('/:id', OrganizationController.delete);

export default router;