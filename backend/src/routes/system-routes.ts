import { Router } from 'express';
import { listJobs, listDepartments, listConversationTags, listLeadTags, listPlans } from '../controllers/SystemController';

const router = Router();

router.get('/jobs', listJobs);
router.get('/departments', listDepartments);
router.get('/conversation-tags', listConversationTags);
router.get('/lead-tags', listLeadTags);
router.get('/plans', listPlans);

export default router;