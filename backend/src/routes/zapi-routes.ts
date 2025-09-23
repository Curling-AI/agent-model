import { Router } from 'express';
import { ZapiController } from '../controllers/ZapiController';

const router = Router();

router.get('/instance', ZapiController.instance);
router.post('/send-message', ZapiController.sendMessage);
router.post('/send-image', ZapiController.sendImage);
router.post('/send-audio', ZapiController.sendAudio);
router.get('/qrcode', ZapiController.generateQrCode);

export default router;