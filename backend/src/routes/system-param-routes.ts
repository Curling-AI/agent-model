import { Router } from 'express';
import { SystemParamsController } from '@/controllers/SystemParamsController';

const router = Router();

router.get('/jobs', SystemParamsController.listJobs);
router.get('/conversation-tags', SystemParamsController.listConversationTags);
router.get('/plans', SystemParamsController.listPlans);
router.get('/permissions', SystemParamsController.listPermissions);
router.get('/service-providers', SystemParamsController.listServiceProviders);
router.get('/follow-up-triggers', SystemParamsController.listFollowUpsTriggers);

export default router;