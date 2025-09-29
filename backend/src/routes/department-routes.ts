import { Router } from 'express';
import { DepartmentController } from '../controllers/DepartmentController';

const router = Router();

router.get('/', DepartmentController.listDepartments);
router.post('/', DepartmentController.upsertDepartment);
router.delete('/:id', DepartmentController.deleteDepartment);
router.get('/:id/user-count', DepartmentController.getDepartmentUserCount);

export default router;