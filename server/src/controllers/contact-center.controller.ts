import { Response } from 'express';
import { contactCenterService } from '../services/contact-center.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../types';

export class ContactCenterController {
  // Queue Management
  async createQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'supervisor')) {
        res.status(403).json({
          success: false,
          error: 'Only admins and supervisors can create queues',
        } as ApiResponse);
        return;
      }

      const queue = await contactCenterService.createQueue(req.body);
      res.status(201).json({
        success: true,
        data: queue,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getQueues(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const queues = await contactCenterService.getAllQueues();
      res.json({
        success: true,
        data: queues,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const queue = await contactCenterService.getQueue(id);

      if (!queue) {
        res.status(404).json({
          success: false,
          error: 'Queue not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: queue,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async updateQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'supervisor')) {
        res.status(403).json({
          success: false,
          error: 'Only admins and supervisors can update queues',
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const queue = await contactCenterService.updateQueue(id, req.body);

      if (!queue) {
        res.status(404).json({
          success: false,
          error: 'Queue not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: queue,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async deleteQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Only admins can delete queues',
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const deleted = await contactCenterService.deleteQueue(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Queue not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Queue deleted successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Call Management
  async createCall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const call = await contactCenterService.createCall(req.body);
      res.status(201).json({
        success: true,
        data: call,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getCalls(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { agentId, queueId } = req.query;

      let calls;
      if (agentId) {
        calls = await contactCenterService.getCallsByAgent(agentId as string);
      } else if (queueId) {
        calls = await contactCenterService.getCallsByQueue(queueId as string);
      } else {
        // Return all calls if no filter specified
        calls = await contactCenterService.getAllCalls();
      }

      res.json({
        success: true,
        data: calls,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getCall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const call = await contactCenterService.getCall(id);

      if (!call) {
        res.status(404).json({
          success: false,
          error: 'Call not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: call,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async assignCall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { agentId } = req.body;

      const call = await contactCenterService.assignCallToAgent(id, agentId);

      if (!call) {
        res.status(404).json({
          success: false,
          error: 'Call not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: call,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async completeCall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes, satisfaction } = req.body;

      const call = await contactCenterService.completeCall(id, notes, satisfaction);

      if (!call) {
        res.status(404).json({
          success: false,
          error: 'Call not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: call,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Call Flow Management
  async createCallFlow(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'supervisor')) {
        res.status(403).json({
          success: false,
          error: 'Only admins and supervisors can create call flows',
        } as ApiResponse);
        return;
      }

      const flow = await contactCenterService.createCallFlow({
        ...req.body,
        createdBy: req.user.userId,
      });

      res.status(201).json({
        success: true,
        data: flow,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getCallFlows(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const flows = await contactCenterService.getAllCallFlows();
      res.json({
        success: true,
        data: flows,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getCallFlow(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const flow = await contactCenterService.getCallFlow(id);

      if (!flow) {
        res.status(404).json({
          success: false,
          error: 'Call flow not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: flow,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async updateCallFlow(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'supervisor')) {
        res.status(403).json({
          success: false,
          error: 'Only admins and supervisors can update call flows',
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const flow = await contactCenterService.updateCallFlow(id, req.body);

      if (!flow) {
        res.status(404).json({
          success: false,
          error: 'Call flow not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: flow,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async deleteCallFlow(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Only admins can delete call flows',
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const deleted = await contactCenterService.deleteCallFlow(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Call flow not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Call flow deleted successfully',
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Statistics
  async getQueueStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await contactCenterService.getQueueStatistics(id);

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getAgentStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await contactCenterService.getAgentStatistics(id);

      res.json({
        success: true,
        data: stats,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  // Agent Activity
  async logAgentActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const activity = await contactCenterService.logAgentActivity(req.body);

      res.status(201).json({
        success: true,
        data: activity,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }

  async getAgentActivities(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const activities = await contactCenterService.getAgentActivities(
        id,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: activities,
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      } as ApiResponse);
    }
  }
}

export const contactCenterController = new ContactCenterController();
