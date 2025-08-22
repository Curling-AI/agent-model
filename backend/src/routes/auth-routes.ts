import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const authController = new AuthController();
const router = Router();

// Rota de login
router.post('/login', authController.login.bind(authController));

// Rota de logout
router.post('/logout', authController.logout.bind(authController));

// Rota de cadastro
router.post('/register', authController.register.bind(authController));

// Rota para verificação de token expirado
router.post('/token-expired', authController.isTokenExpired.bind(authController));

export default router;