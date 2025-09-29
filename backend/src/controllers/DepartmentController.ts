import { supabase } from '@/config/supabaseClient';
import { getByFilter, getById, remove, upsert } from '@/services/storage';

import { Request, Response } from 'express';

export const DepartmentController = {

  listDepartments: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    const departments = await getByFilter('departments', { 'organization_id': organizationId });

    if (!departments) return res.status(404).json({ error: 'No departments found' });

    return res.json(departments);
  },

  upsertDepartment: async (req: Request, res: Response) => {
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

      const response = await upsert('departments', payload);

      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error upserting department' });
    }
  },

  deleteDepartment: async (req: Request, res: Response) => {
    const departmentId = Number(req.params.id);
    try {
      const department = await getById('departments', departmentId);
      if (!department) {
        return { status: 404, message: 'Department not found' };
      }

      await remove('departments', departmentId);
      return res.status(204).json({ message: 'Department deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting department' });
    }
  },

  getDepartmentUserCount: async (req: Request, res: Response) => {
    const departmentId = Number(req.params.id);
    const organizationId = Number(req.query.organizationId);
    try {
      let count;
      if (!departmentId || departmentId <= 0) {
        count = await supabase.from('users')
        .select('*', { count: 'exact', head: true })
        .not('department_id', 'is', null)
        .eq('organization_id', organizationId);
      } else {
        count = await supabase.from('users')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', departmentId)
        .eq('organization_id', organizationId);
      }

      return res.json( count );
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: 'Error fetching user count' });
    }
  }
}