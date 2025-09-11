import { Router } from 'express';
import { SystemParamsController } from '@/controllers/SystemParamsController';

const router = Router();

router.get('/jobs', SystemParamsController.listJobs);
router.get('/conversation-tags', SystemParamsController.listConversationTags);
router.get('/plans', SystemParamsController.listPlans);
router.get('/crm-columns', SystemParamsController.listCrmColumns);
router.get('/crm-permissions', SystemParamsController.listCrmPermissions);
router.get('/service-providers', SystemParamsController.listServiceProviders);
router.get('/conversation-permissions', SystemParamsController.listConversationPermissions);
router.get('/management-permissions', SystemParamsController.listManagementPermissions);
router.get('/agent-permissions', SystemParamsController.listAgentPermissions);
router.get('/follow-up-triggers', SystemParamsController.listFollowUpsTriggers);

export default router;