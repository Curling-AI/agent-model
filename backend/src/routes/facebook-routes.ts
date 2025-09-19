import { Router } from 'express';
import { FacebookController } from '../controllers/FacebookController';

const router = Router();

router.get('/access-token', FacebookController.getAccessToken);
router.post('/subscribe-app', FacebookController.subscribeApp);
router.post('/register-number', FacebookController.registerNumber);

export default router;