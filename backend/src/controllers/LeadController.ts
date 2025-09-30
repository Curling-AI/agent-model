import { supabase } from '@/config/supabaseClient';
import { getByFilter, getById, remove, upsert } from '@/services/storage';

import { Request, Response } from 'express';

export const LeadController = {

  listLeads: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    const leads = await getByFilter('leads', { 'organization_id': organizationId });

    if (!leads) return res.status(404).json({ error: 'No leads found' });

    return res.json(leads);
  },

  upsertLead: async (req: Request, res: Response) => {
    try {
      const payload = {
        organization_id: req.body.organizationId,
        name: req.body.name,
        company: req.body.company,
        email: req.body.email,
        phone: req.body.phone,
        value: req.body.value,
        source: req.body.source,
        priority: req.body.priority,
        observation: req.body.observation,
        tags : req.body.tags,
        status: req.body.status,
      }

      if (req.body.id && req.body.id > 0) {
        payload['id'] = req.body.id;
      }

      const response = await upsert('leads', payload);

      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error upserting lead' });
    }
  },

  deleteLead: async (req: Request, res: Response) => {
    const leadId = Number(req.params.id);
    try {
      const lead = await getById('leads', leadId);
      if (!lead) {
        return { status: 404, message: 'Lead not found' };
      }

      await remove('leads', leadId);
      return res.status(204).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting lead' });
    }
  },
}