import { supabase } from '../config/supabaseClient';

// Consulta todos os registros de uma tabela
export async function getAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').order('name', { ascending: true });
  if (error) throw error;
  return data as T[];
}

// Consulta todos os registros de uma tabela
export async function getByFilter<T>(table: string, filter: Partial<T>, sortField: string = 'id'): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').match(filter).order(sortField, { ascending: true });
  if (error) throw error;
  return data as T[];
}

// Consulta um registro pelo id
export async function getById<T>(table: string, id: number): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data as T;
}

// Consulta um registro pelo id
export async function getByAgentId<T>(table: string, id: number): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').eq('agent_id', id).single();
  if (error) throw error;
  return data as T;
}

// Consulta um registro pelo id
export async function getByOrganizationId<T>(table: string, id: number): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').eq('organization_id', id).single();
  if (error) throw error;
  return data as T;
}

// Insere um novo registro
export async function insert<T>(table: string, payload: T): Promise<T> {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data as T;
}

// Atualiza um registro
export async function update<T>(table: string, id: number, payload: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as T;
}

// Remove um registro
export async function remove(table: string, id: number): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function removeWithAgentId(table: string, agentId: number): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('agent_id', agentId);
  if (error) throw error;
}

export async function removeWithFilter<T>(table: string, filter: Partial<T>): Promise<void> {
  const { error } = await supabase.from(table).delete().match(filter);
  if (error) throw error;
}

// Upsert (criar ou atualizar) um registro
export async function upsert<T>(table: string, payload: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).upsert([payload]).select().single();
  if (error) throw error;
  return data as T;
}

export async function upsertArray<T>(table: string, payload: Partial<T>[]): Promise<T[]> {
  const { data, error } = await supabase.from(table).upsert(payload).select();
  if (error) throw error;
  return data as T[];
}

