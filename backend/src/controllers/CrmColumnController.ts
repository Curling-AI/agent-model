import { supabase } from '@/config/supabaseClient';
import { getByFilter, getById, remove, upsert } from '@/services/storage';

import { Request, Response } from 'express';

export const CrmColumnController = {

  listCrmColumns: async (req: Request, res: Response) => {
    try {
    const organizationId = Number(req.query.organizationId);
    const { data, error } = await supabase.from('crm_columns')
        .select('*')
        .or(`organization_id.is.null,organization_id.eq.${organizationId}`)
        .order('order', { ascending: true });

    if (error) return res.status(404).json({ error: 'No crm columns found' });

    return res.json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error listing crm columns' });
    }
  },

  upsertCrmColumn: async (req: Request, res: Response) => {
    try {
      const payload = {
        organization_id: req.body.organizationId,
        title_pt: req.body.titlePt,
        title_en: req.body.titleEn,
        color: req.body.color,
        is_system: req.body.isSystem || false,
        order: req.body.order || 0,
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