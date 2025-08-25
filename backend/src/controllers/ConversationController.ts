import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Listar todas as conversations
export const listConversations = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('conversation').select('*');
  if (error) {
    return res.status(500).json({ error: 'Erro ao listar conversations.' });
  }
  res.json(data);
};

// Detalhar uma conversation por id
export const getConversation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('conversation')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) {
    return res.status(404).json({ error: 'Conversation não encontrada.' });
  }
  res.json(data);
};

// Criar uma nova conversation
export const createConversation = async (req: Request, res: Response) => {
  const { title, description, ...rest } = req.body;
  const { data, error } = await supabase
    .from('conversation')
    .insert([{ title, description, ...rest }])
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: 'Erro ao criar conversation.' });
  }
  res.status(201).json(data);
};

// Criar uma nova conversation message
export const createConversationMessage = async (req: Request, res: Response) => {
  const { conversation_id, sender_id, content, ...rest } = req.body;
  const { data, error } = await supabase
    .from('conversation_message')
    .insert([{ conversation_id, sender_id, content, ...rest }])
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: 'Erro ao criar conversation message.' });
  }
  res.status(201).json(data);
};