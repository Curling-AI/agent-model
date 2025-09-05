import { Router } from 'express';
import agentRoutes from './agent-routes';
import healthRoutes from './health-routes';
import authRoutes from './auth-routes';
import systemRoutes from './system-routes';
import conversationRoutes from './conversation-routes';
import chunkRoutes from './chunk-routes';
import documentRoutes from './document-routes';

const router = Router();

router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);
router.use('/system', systemRoutes);
router.use('/conversations', conversationRoutes);
router.use('/auth', authRoutes);
router.use('/chunks', chunkRoutes);
router.use('/documents', documentRoutes);

export default router;