import { supabase } from '@/config/supabaseClient';
import { getAll, getByFilter, getById, insert, remove, update, upsert } from '@/services/storage';

import { Request, Response } from 'express';

export const UserController = {
   getMe: async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const user = await getById('users', userId);

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    return res.json(user || null);
  },

  listUsers: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    const users = await getByFilter('users', { 'organization_id': organizationId });

    if (!users) return res.status(404).json({ error: 'No users found' });

    return res.json(users);
  },

  upsertUser: async (req: Request, res: Response) => {
    try {

      let payload = {
        organization_id: req.body.organizationId,
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        phone: req.body.phone,
        job_id: req.body.jobId,
        location_name: req.body.locationName || '',
        language: req.body.language || 'pt',
        timezone: req.body.timezone || 'America/Sao_Paulo',
        permissions: req.body.permissions,
        auth_id: req.body.authId,
        status: req.body.status,
        department_id: req.body.departmentId
      }

      if (req.body.id === 0) {
        console.log("Creating auth user");
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: {
            full_name: payload.name + ' ' + payload.surname,
          }
        }});

        if (error) {
          return res.status(400).json({ error: 'Error creating auth user' });
        }
        
        payload['auth_id'] = data.user.id;
      } else {
        console.log("Updating auth user");
        payload['id'] = req.body.id;
      }

      const response = await upsert('users', payload)

      return res.status(201).json(response);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: 'Error upserting user' });
    }
  },

  deleteUser: async (userId: number) => {
    try {
      const user = await getById('users', userId);
      if (!user) {
        return { status: 404, message: 'User not found' };
      }

      await remove('users', userId);
      return { status: 204, message: 'User deleted successfully' };
    } catch (error) {
      return { status: 500, message: 'Error deleting user' };
    }
  },
}