import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Listagem de Jobs
export const listJobs = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('job').select('*');
  if (error) {
    return res.status(500).json({ error: 'Erro ao listar jobs.' });
  }
  res.json(data);
};

// Listagem de Departments
export const listDepartments = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('department').select('*');
  if (error) {
    return res.status(500).json({ error: 'Erro ao listar departamentos.' });
  }
  res.json(data);
};

// Listagem de Conversation Tags
export const listConversationTags = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('conversation_tag').select('*');
  if (error) {
    return res.status(500).json({ error: 'Erro ao listar conversation tags.' });
  }
  res.json(data);
};

// Listagem de Lead Tags
export const listLeadTags = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('lead_tag').select('*');
  if (error) {
    return res.status(500).json({ error: 'Erro ao listar lead tags.' });
  }
  res.json(data);
};

// Listagem de Plans
export const listPlans = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('plan').select('*');
  if (error) {
    return res.status(500).json({ error: 'Erro ao listar plans.' });
  }
  res.json(data);
};