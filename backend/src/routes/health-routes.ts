import { Router } from 'express';
import IndexController from '../controllers';

const indexController = new IndexController();

const router = Router();

router.get('/check', indexController.getIndex.bind(indexController));

export default router;