import { Router } from 'express';
import { contactCenterController } from '../controllers/contact-center.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Queue Management
router.post('/queues', contactCenterController.createQueue.bind(contactCenterController));
router.get('/queues', contactCenterController.getQueues.bind(contactCenterController));
router.get('/queues/:id', contactCenterController.getQueue.bind(contactCenterController));
router.put('/queues/:id', contactCenterController.updateQueue.bind(contactCenterController));
router.delete('/queues/:id', contactCenterController.deleteQueue.bind(contactCenterController));
router.get('/queues/:id/statistics', contactCenterController.getQueueStatistics.bind(contactCenterController));

// Call Management
router.post('/calls', contactCenterController.createCall.bind(contactCenterController));
router.get('/calls', contactCenterController.getCalls.bind(contactCenterController));
router.get('/calls/:id', contactCenterController.getCall.bind(contactCenterController));
router.post('/calls/:id/assign', contactCenterController.assignCall.bind(contactCenterController));
router.post('/calls/:id/complete', contactCenterController.completeCall.bind(contactCenterController));

// Call Flow Management
router.post('/call-flows', contactCenterController.createCallFlow.bind(contactCenterController));
router.get('/call-flows', contactCenterController.getCallFlows.bind(contactCenterController));
router.get('/call-flows/:id', contactCenterController.getCallFlow.bind(contactCenterController));
router.put('/call-flows/:id', contactCenterController.updateCallFlow.bind(contactCenterController));
router.delete('/call-flows/:id', contactCenterController.deleteCallFlow.bind(contactCenterController));

// Agent Activity
router.post('/agent-activities', contactCenterController.logAgentActivity.bind(contactCenterController));
router.get('/agents/:id/activities', contactCenterController.getAgentActivities.bind(contactCenterController));
router.get('/agents/:id/statistics', contactCenterController.getAgentStatistics.bind(contactCenterController));

export default router;
