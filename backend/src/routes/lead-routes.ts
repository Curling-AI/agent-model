import { Router } from 'express';
import { LeadController } from '../controllers/LeadController';

const router = Router();

router.get('/', LeadController.listLeads);
router.post('/', LeadController.upsertLead);
router.delete('/:id', LeadController.deleteLead);
router.patch('/:id/status', LeadController.updateLeadStatus);


export default router;