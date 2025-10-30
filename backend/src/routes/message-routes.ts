import { MessageController } from '@/controllers/MessageController';
import { Router } from 'express';

const router = Router();

router.post('/register-webhook', MessageController.registerWebhook);
router.post('/create-instance', MessageController.createInstance);
router.delete('/delete-instance', MessageController.deleteInstance);
router.post('/send-message', MessageController.sendMessage);
router.post('/send-media', MessageController.sendMedia);
router.get('/qrcode', MessageController.generateQrCode);
router.get('/status', MessageController.getInstanceStatusNotOfficialApi);
router.get('/media-content', MessageController.getMediaContent);
router.get('/media-content/meta', MessageController.getMetaMediaContent);
router.post('/send-message/meta', MessageController.sendMetaMessage);
router.post('/send-media/meta', MessageController.sendMetaMedia);
export default router;