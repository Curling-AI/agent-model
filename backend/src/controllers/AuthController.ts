import { Request, Response } from 'express';

export default class AuthController {
  // Login
  async login(req: Request, res: Response): Promise<void> {
    // Exemplo: validação simples
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
      // Simula token JWT
      res.status(200).json({ token: 'fake-jwt-token', expiresIn: 3600 });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  }

  // Logout
  async logout(req: Request, res: Response): Promise<void> {
    // Simulação de logout
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  }

  // Criação de conta
  async register(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    // Simulação de criação de usuário
    res.status(201).json({ message: `Usuário ${username} criado com sucesso` });
  }

  // Verificação de token expirado
  async isTokenExpired(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    // Simulação: sempre retorna não expirado
    res.status(200).json({ expired: false });
  }
}