import { AuthController } from '@/controllers/AuthController';
import { Router } from 'express';

const router = Router();

// Rota de login
router.post('/login', AuthController.login);

// Rota de logout
router.post('/logout', AuthController.logout);

// Rota de cadastro
router.post('/register', AuthController.register);

// Rota para verificação de sessão
router.get('/session', AuthController.getSession);

export default router;