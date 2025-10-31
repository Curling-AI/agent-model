import { Router } from 'express';
import { TestController } from '../controllers/TestController';

const router = Router();

router.post('/call', TestController.call);

export default router;
