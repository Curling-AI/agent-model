import { Router } from 'express';
import agentRoutes from './agent-routes';
import healthRoutes from './health-routes';
import authRoutes from './auth-routes';
import conversationRoutes from './conversation-routes';
import chunkRoutes from './chunk-routes';
import documentRoutes from './document-routes';
import knowledgeRoutes from './knowledge-routes';
import systemRoutes from './system-param-routes';
import followUpRoutes from './follow-up-routes';

const router = Router();

router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);
router.use('/conversations', conversationRoutes);
router.use('/auth', authRoutes);
router.use('/chunks', chunkRoutes);
router.use('/documents', documentRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/system-params', systemRoutes);

export default router;