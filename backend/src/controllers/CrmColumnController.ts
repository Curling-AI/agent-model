import { supabase } from '@/config/supabaseClient';
import { getByFilter, getById, remove, upsert } from '@/services/storage';

import { Request, Response } from 'express';

export const CrmColumnController = {

  listCrmColumns: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    const crmcolumns = await getByFilter('crm_columns', { 'organization_id': organizationId });

    if (!crmcolumns) return res.status(404).json({ error: 'No crm columns found' });

    return res.json(crmcolumns);
  },

  upsertCrmColumn: async (req: Request, res: Response) => {
    try {
      const payload = {
        organization_id: req.body.organizationId,
        name: req.body.name,
        description: req.body.description,
        manager_name: req.body.managerName,
      }

      if (req.body.id && req.body.id > 0) {
        payload['id'] = req.body.id;
      }

      const response = await upsert('crm_columns', payload);

      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error upserting crm column' });
    }
  },

  deleteCrmColumn: async (req: Request, res: Response) => {
    const crmColumnId = Number(req.params.id);
    try {
      const crmColumn = await getById('crm_columns', crmColumnId);
      if (!crmColumn) {
        return { status: 404, message: 'CRM Column not found' };
      }

      await remove('crm_columns', crmColumnId);
      return res.status(204).json({ message: 'CRM Column deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting CRM Column' });
    }
  }
}