import { Express } from 'express';
import AuthController from '../controllers/AuthController';
import IndexController from '../controllers';

const authController = new AuthController();
const indexController = new IndexController();

export function setRoutes(app: Express): void {
  app.get('/', indexController.getIndex.bind(indexController));

  // Rota de login
  app.post('/auth/login', authController.login.bind(authController));

  // Rota de logout
  app.post('/auth/logout', authController.logout.bind(authController));

  // Rota de cadastro
  app.post('/auth/register', authController.register.bind(authController));

  // Rota para verificação de token expirado
  app.post('/auth/token-expired', authController.isTokenExpired.bind(authController));
}