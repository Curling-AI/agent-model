import { getAll, getByFilter, getById, insert, remove, update, upsert } from '@/services/storage';
import { Request, Response } from 'express';

// Controller
export const OrganizationController = {
  getAll: (req: Request, res: Response) => {
    const { filter } = req.query;
    switch (filter) {
      case 'active':
        getByFilter('organizations', { active: true }, 'company_name').then(data => {
          res.json(data);
        });
        break;
      case 'paused':
        getByFilter('organizations', { active: false }, 'company_name').then(data => {
          res.json(data);
        });
        break;
      default:
        getAll('organizations').then(data => {
          res.json(data);
        });
    }
  },

  getById: (req: Request, res: Response) => {
    const organization = getById('organizations', Number(req.params.id));
    if (!organization) return res.status(404).json({ error: 'Organization not found' });
    res.json(organization);
  },

  upsert: async (req: Request, res: Response) => {
    try {

      const payload = {
        company_name: req.body.companyName,
        cnpj: req.body.cnpj,
        cep: req.body.cep,
        address: req.body.address,
        number: req.body.number,
        city: req.body.city,
        state: req.body.state,
        website: req.body.website,
        segment: req.body.segment,
        language: req.body.language
      }

      if (req.body.id) {
        payload['id'] = req.body.id;
      }

      const organization = await upsert('organizations', payload);
      res.status(201).json(organization);
    } catch (error) {
      res.status(500).json({ error: error});
    }
  },

  delete: (req: Request, res: Response) => {
     const organization = getById('organizations', Number(req.params.id));
    if (!organization) return res.status(404).json({ error: 'Organization not found' });
    remove('organizations', Number(req.params.id));
    res.status(204).send();
  }
};