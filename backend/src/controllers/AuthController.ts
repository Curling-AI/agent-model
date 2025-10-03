import { supabase } from '@/config/supabaseClient';
import { Request, Response } from 'express';

export const AuthController = {

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      res.status(200).json({ user: data.user, session: data.session });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  },

  // Logout
  logout: async (_: Request, res: Response) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      res.status(500).json({ error: 'Erro ao realizar logout' });
      return;
    }
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  },

  // Criação de conta
  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Opcional: Você pode adicionar 'options' aqui para dados de usuário, redirecionamento, etc.
    });

    res.status(201).json({ user: data.user, session: data.session, error });
  },

  getSession: async (_: Request, res: Response) => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ error: 'Erro ao verificar sessão' });
      return;
    }
    if (!data.session) {
      res.status(200).json({ expired: true });
      return;
    }
    res.status(200).json({ expired: false, session: data.session } );
  }
};