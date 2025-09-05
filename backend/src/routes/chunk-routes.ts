import { ChunkController } from '@/controllers/ChunkController';
import { Router } from 'express';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/generate-from-file', upload.single('file'), ChunkController.generateChunksFromFile);
router.post('/generate-from-url', ChunkController.generateChunksFromUrl);
router.post('/generate-from-faq', ChunkController.generateChunksFromFaq);

export default router;