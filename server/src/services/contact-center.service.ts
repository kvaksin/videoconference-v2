import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';
import { CallQueue, Call, CallFlow, AgentActivity } from '../models';

export class ContactCenterService {
  // Queue Management
  async createQueue(data: Omit<CallQueue, 'id' | 'createdAt' | 'updatedAt'>): Promise<CallQueue> {
    const queue: CallQueue = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.create('callQueues', queue);
    return queue;
  }

  async getQueue(id: string): Promise<CallQueue | null> {
    return await db.findOne<CallQueue>('callQueues', (q) => q.id === id);
  }

  async getAllQueues(): Promise<CallQueue[]> {
    return await db.read<CallQueue>('callQueues');
  }

  async updateQueue(id: string, updates: Partial<CallQueue>): Promise<CallQueue | null> {
    return await db.update<CallQueue>('callQueues', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteQueue(id: string): Promise<boolean> {
    return await db.delete<CallQueue>('callQueues', id);
  }

  // Call Management
  async createCall(data: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>): Promise<Call> {
    const call: Call = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.create('calls', call);
    return call;
  }

  async getCall(id: string): Promise<Call | null> {
    return await db.findOne<Call>('calls', (c) => c.id === id);
  }

  async getCallsByAgent(agentId: string): Promise<Call[]> {
    return await db.findMany<Call>('calls', (c) => c.assignedAgentId === agentId);
  }

  async getCallsByQueue(queueId: string): Promise<Call[]> {
    return await db.findMany<Call>('calls', (c) => c.queueId === queueId);
  }

  async getActiveCallsInQueue(queueId: string): Promise<Call[]> {
    return await db.findMany<Call>('calls', (c) => 
      c.queueId === queueId && (c.status === 'waiting' || c.status === 'ringing')
    );
  }

  async getAllCalls(): Promise<Call[]> {
    return await db.findMany<Call>('calls', () => true);
  }

  async updateCall(id: string, updates: Partial<Call>): Promise<Call | null> {
    return await db.update<Call>('calls', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async assignCallToAgent(callId: string, agentId: string): Promise<Call | null> {
    return await this.updateCall(callId, {
      assignedAgentId: agentId,
      status: 'ringing',
    });
  }

  async completeCall(callId: string, notes?: string, satisfaction?: number): Promise<Call | null> {
    const call = await this.getCall(callId);
    if (!call) return null;

    const endTime = new Date().toISOString();
    const startTime = new Date(call.startTime);
    const talkTime = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);

    return await this.updateCall(callId, {
      status: 'completed',
      endTime,
      talkTime,
      callNotes: notes,
      satisfaction,
    });
  }

  // Call Flow Management
  async createCallFlow(data: Omit<CallFlow, 'id' | 'createdAt' | 'updatedAt'>): Promise<CallFlow> {
    const flow: CallFlow = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.create('callFlows', flow);
    return flow;
  }

  async getCallFlow(id: string): Promise<CallFlow | null> {
    return await db.findOne<CallFlow>('callFlows', (f) => f.id === id);
  }

  async getAllCallFlows(): Promise<CallFlow[]> {
    return await db.read<CallFlow>('callFlows');
  }

  async updateCallFlow(id: string, updates: Partial<CallFlow>): Promise<CallFlow | null> {
    return await db.update<CallFlow>('callFlows', id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteCallFlow(id: string): Promise<boolean> {
    return await db.delete<CallFlow>('callFlows', id);
  }

  // Agent Activity Tracking
  async logAgentActivity(data: Omit<AgentActivity, 'id' | 'timestamp'>): Promise<AgentActivity> {
    const activity: AgentActivity = {
      id: uuidv4(),
      ...data,
      timestamp: new Date().toISOString(),
    };
    await db.create('agentActivities', activity);
    return activity;
  }

  async getAgentActivities(agentId: string, startDate?: string, endDate?: string): Promise<AgentActivity[]> {
    const activities = await db.findMany<AgentActivity>('agentActivities', (a) => a.agentId === agentId);
    
    if (startDate || endDate) {
      return activities.filter((a) => {
        const activityDate = new Date(a.timestamp);
        if (startDate && activityDate < new Date(startDate)) return false;
        if (endDate && activityDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    return activities;
  }

  // Call Routing Logic
  async routeCall(_call: Call, queue: CallQueue): Promise<string | null> {
    const availableAgents = await this.getAvailableAgents(queue.assignedAgents, queue.requiredSkills);
    
    if (availableAgents.length === 0) {
      return null;
    }

    let selectedAgent: any;

    switch (queue.routingStrategy) {
      case 'round-robin':
        selectedAgent = availableAgents[0];
        break;
      
      case 'longest-idle':
        selectedAgent = await this.getLongestIdleAgent(availableAgents);
        break;
      
      case 'skill-based':
        selectedAgent = await this.getSkillMatchedAgent(availableAgents, queue.requiredSkills || []);
        break;
      
      case 'priority':
        selectedAgent = this.getPriorityAgent(availableAgents);
        break;
      
      default:
        selectedAgent = availableAgents[0];
    }

    return selectedAgent?.id || null;
  }

  private async getAvailableAgents(agentIds: string[], requiredSkills?: string[]): Promise<any[]> {
    const agents = await db.findMany<any>('users', (u) => 
      agentIds.includes(u.id) && 
      u.agentStatus === 'available' &&
      (!requiredSkills || this.hasRequiredSkills(u.skills || [], requiredSkills))
    );
    return agents;
  }

  private hasRequiredSkills(agentSkills: string[], requiredSkills: string[]): boolean {
    return requiredSkills.every(skill => agentSkills.includes(skill));
  }

  private async getLongestIdleAgent(agents: any[]): Promise<any> {
    // Get last activity for each agent
    const agentActivities = await Promise.all(
      agents.map(async (agent) => {
        const activities = await this.getAgentActivities(agent.id);
        const lastActivity = activities[activities.length - 1];
        return { agent, lastActivity };
      })
    );

    // Sort by oldest activity
    agentActivities.sort((a, b) => {
      const timeA = a.lastActivity ? new Date(a.lastActivity.timestamp).getTime() : 0;
      const timeB = b.lastActivity ? new Date(b.lastActivity.timestamp).getTime() : 0;
      return timeA - timeB;
    });

    return agentActivities[0]?.agent;
  }

  private async getSkillMatchedAgent(agents: any[], requiredSkills: string[]): Promise<any> {
    // Find agent with most matching skills
    const scored = agents.map(agent => ({
      agent,
      score: (agent.skills || []).filter((s: string) => requiredSkills.includes(s)).length
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.agent;
  }

  private getPriorityAgent(agents: any[]): any {
    // Could be based on tenure, performance, or other metrics
    return agents[0];
  }

  // Statistics and Reporting
  async getQueueStatistics(queueId: string): Promise<any> {
    const calls = await this.getCallsByQueue(queueId);
    const activeCalls = calls.filter(c => c.status === 'waiting' || c.status === 'ringing');
    const completedCalls = calls.filter(c => c.status === 'completed');
    const missedCalls = calls.filter(c => c.status === 'missed' || c.status === 'abandoned');

    const avgWaitTime = completedCalls.reduce((sum, c) => sum + (c.waitTime || 0), 0) / (completedCalls.length || 1);
    const avgTalkTime = completedCalls.reduce((sum, c) => sum + (c.talkTime || 0), 0) / (completedCalls.length || 1);
    const avgSatisfaction = completedCalls.filter(c => c.satisfaction).reduce((sum, c) => sum + (c.satisfaction || 0), 0) / (completedCalls.filter(c => c.satisfaction).length || 1);

    return {
      queueId,
      totalCalls: calls.length,
      activeCalls: activeCalls.length,
      completedCalls: completedCalls.length,
      missedCalls: missedCalls.length,
      averageWaitTime: Math.round(avgWaitTime),
      averageTalkTime: Math.round(avgTalkTime),
      averageSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      longestWaitTime: Math.max(...calls.map(c => c.waitTime || 0)),
    };
  }

  async getAgentStatistics(agentId: string): Promise<any> {
    const calls = await this.getCallsByAgent(agentId);
    const completedCalls = calls.filter(c => c.status === 'completed');
    const missedCalls = calls.filter(c => c.status === 'missed');

    const totalTalkTime = completedCalls.reduce((sum, c) => sum + (c.talkTime || 0), 0);
    const avgTalkTime = totalTalkTime / (completedCalls.length || 1);
    const avgSatisfaction = completedCalls.filter(c => c.satisfaction).reduce((sum, c) => sum + (c.satisfaction || 0), 0) / (completedCalls.filter(c => c.satisfaction).length || 1);

    return {
      agentId,
      totalCalls: calls.length,
      completedCalls: completedCalls.length,
      missedCalls: missedCalls.length,
      totalTalkTime,
      averageTalkTime: Math.round(avgTalkTime),
      averageSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    };
  }
}

export const contactCenterService = new ContactCenterService();
