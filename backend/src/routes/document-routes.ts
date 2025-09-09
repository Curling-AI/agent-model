import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.get('/', DocumentController.list);
router.post('/', DocumentController.upsert);
router.post('/file', upload.single('file'), DocumentController.insertFromFile);
router.delete('/:id', DocumentController.delete);

export default router;