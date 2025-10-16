import { supabase } from '@/config/supabaseClient';
import { getByFilter } from '@/services/storage';
import { Request, Response } from 'express';
import { get } from 'http';

export const AuthController = {

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(error);
        res.status(401).json({ error: 'Credenciais inválidas' });
      } else {
        res.status(200).json({ user: data.user, session: data.session });
      }
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
    } else {
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    }
  },

  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: req.body,
      },
    });

    res.status(201).json({ user: data.user, session: data.session, error });
  },

  getSession: async (_: Request, res: Response) => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ error: 'Erro ao verificar sessão' });
    }

    if (!data.session) {
      res.status(200).json({ expired: true });
    } else {
      res.status(200).json({ expired: false, session: data.session });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'E-mail é obrigatório' });
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.RESET_PASSWORD_REDIRECT_URL
    });
    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso' });
    }
  },

  changePasswordWithCurrentValidation: async(req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' };
    }

    const userId = user.id;

    const { data, error } = await supabase.rpc('update_password_secure', {
      current_plain_password: currentPassword,
      new_plain_password: newPassword,
      current_id: userId
    });

    if (error) {
      console.error('Erro ao chamar RPC para troca de senha:', error);
      return { success: false, message: 'Erro interno ao tentar trocar a senha.' };
    }
    console.log('RPC response:', data);
    if (data === 'success') {
      await supabase.auth.signOut();
      res.json({ success: true, message: 'Senha atualizada com sucesso. Por favor, faça login novamente.' });
    } else if (data === 'incorrect_password') {
      res.json({ success: false, message: 'A senha atual está incorreta.' });
    } else {
      res.json({ success: false, message: 'Erro desconhecido na troca de senha.' });
    }
  },

  getLoggedUser: async (_: Request, res: Response) => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    } else {
      const response = await getByFilter('users', { 'auth_id': data.user.id });
  
      if (!response) {
        res.status(404).json({ error: 'User not found' });
      } else {
        const user = response[0];
        res.status(200).json({ user: user, authUser: data.user });
      }
    }
  }
};