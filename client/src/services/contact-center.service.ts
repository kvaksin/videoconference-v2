const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface CallQueue {
  id: string;
  name: string;
  description?: string;
  routingStrategy: 'round-robin' | 'longest-idle' | 'skill-based' | 'priority';
  maxQueueSize: number;
  maxWaitTime: number;
  assignedAgents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Call {
  id: string;
  callerName: string;
  callerPhone?: string;
  status: 'waiting' | 'active' | 'ended';
  queueId?: string;
  assignedAgentId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
}

interface CallFlow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgentActivity {
  id: string;
  agentId: string;
  activityType: 'login' | 'logout' | 'status-change' | 'call-start' | 'call-end';
  timestamp: string;
  details?: any;
}

interface AgentStatistics {
  agentId: string;
  totalCalls: number;
  activeCalls: number;
  averageCallDuration: number;
  totalCallDuration: number;
  availableTime: number;
  busyTime: number;
}

class ContactCenterService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Queue Management
  async getQueues(): Promise<CallQueue[]> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/queues`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch queues');
    const data = await response.json();
    return data.data;
  }

  async createQueue(queue: Omit<CallQueue, 'id' | 'createdAt' | 'updatedAt'>): Promise<CallQueue> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/queues`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(queue),
    });
    if (!response.ok) throw new Error('Failed to create queue');
    const data = await response.json();
    return data.data;
  }

  async updateQueue(id: string, queue: Partial<CallQueue>): Promise<CallQueue> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/queues/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(queue),
    });
    if (!response.ok) throw new Error('Failed to update queue');
    const data = await response.json();
    return data.data;
  }

  async deleteQueue(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/queues/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete queue');
  }

  // Call Management
  async getCalls(): Promise<Call[]> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/calls`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch calls');
    const data = await response.json();
    return data.data;
  }

  async createCall(call: Omit<Call, 'id' | 'startTime'>): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/calls`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(call),
    });
    if (!response.ok) throw new Error('Failed to create call');
    const data = await response.json();
    return data.data;
  }

  async updateCall(id: string, call: Partial<Call>): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/calls/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(call),
    });
    if (!response.ok) throw new Error('Failed to update call');
    const data = await response.json();
    return data.data;
  }

  async endCall(id: string): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/calls/${id}/end`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to end call');
    const data = await response.json();
    return data.data;
  }

  // Call Flow Management
  async getCallFlows(): Promise<CallFlow[]> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/call-flows`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch call flows');
    const data = await response.json();
    return data.data;
  }

  async createCallFlow(flow: Omit<CallFlow, 'id' | 'createdAt' | 'updatedAt'>): Promise<CallFlow> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/call-flows`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(flow),
    });
    if (!response.ok) throw new Error('Failed to create call flow');
    const data = await response.json();
    return data.data;
  }

  async updateCallFlow(id: string, flow: Partial<CallFlow>): Promise<CallFlow> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/call-flows/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(flow),
    });
    if (!response.ok) throw new Error('Failed to update call flow');
    const data = await response.json();
    return data.data;
  }

  async deleteCallFlow(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/call-flows/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete call flow');
  }

  // Agent Management
  async getAgentActivities(agentId?: string): Promise<AgentActivity[]> {
    const url = agentId 
      ? `${API_BASE_URL}/api/contact-center/agent-activities?agentId=${agentId}`
      : `${API_BASE_URL}/api/contact-center/agent-activities`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch agent activities');
    const data = await response.json();
    return data.data;
  }

  async logAgentActivity(activity: Omit<AgentActivity, 'id' | 'timestamp'>): Promise<AgentActivity> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/agent-activities`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(activity),
    });
    if (!response.ok) throw new Error('Failed to log agent activity');
    const data = await response.json();
    return data.data;
  }

  async getAgentStatistics(agentId: string): Promise<AgentStatistics> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/agents/${agentId}/statistics`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch agent statistics');
    const data = await response.json();
    return data.data;
  }

  async getQueueStatistics(queueId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/contact-center/queues/${queueId}/statistics`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch queue statistics');
    const data = await response.json();
    return data.data;
  }
}

export const contactCenterService = new ContactCenterService();
export type { CallQueue, Call, CallFlow, AgentActivity, AgentStatistics };
