import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contactCenterService, type CallQueue, type Call } from '../services/contact-center.service';
import { apiService } from '../services/api.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ContactCenterPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues] = useState<CallQueue[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'queues' | 'agents' | 'calls' | 'flows'>('dashboard');
  
  // Queue form state
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [editingQueue, setEditingQueue] = useState<CallQueue | null>(null);
  const [queueForm, setQueueForm] = useState({
    name: '',
    description: '',
    routingStrategy: 'round-robin' as 'round-robin' | 'longest-idle' | 'skill-based' | 'priority',
    maxQueueSize: 50,
    maxWaitTime: 300,
    assignedAgents: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [queuesData, callsData, usersData, flowsData] = await Promise.all([
        contactCenterService.getQueues(),
        contactCenterService.getCalls(),
        apiService.getUsers().catch(() => []),
        contactCenterService.getCallFlows().catch(() => []),
      ]);
      setQueues(queuesData);
      setCalls(callsData);
      setUsers(usersData);
      setFlows(flowsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load contact center data:', error);
      setLoading(false);
    }
  };

  const handleCreateQueue = async () => {
    try {
      await contactCenterService.createQueue(queueForm);
      setShowQueueModal(false);
      resetQueueForm();
      loadData();
    } catch (error) {
      console.error('Failed to create queue:', error);
      alert('Failed to create queue');
    }
  };

  const handleUpdateQueue = async () => {
    if (!editingQueue) return;
    try {
      await contactCenterService.updateQueue(editingQueue.id, queueForm);
      setShowQueueModal(false);
      setEditingQueue(null);
      resetQueueForm();
      loadData();
    } catch (error) {
      console.error('Failed to update queue:', error);
      alert('Failed to update queue');
    }
  };

  const handleDeleteQueue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this queue?')) return;
    try {
      await contactCenterService.deleteQueue(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete queue:', error);
      alert('Failed to delete queue');
    }
  };

  const openEditQueue = (queue: CallQueue) => {
    setEditingQueue(queue);
    setQueueForm({
      name: queue.name,
      description: queue.description || '',
      routingStrategy: queue.routingStrategy,
      maxQueueSize: queue.maxQueueSize,
      maxWaitTime: queue.maxWaitTime,
      assignedAgents: queue.assignedAgents,
      isActive: queue.isActive,
    });
    setShowQueueModal(true);
  };

  const resetQueueForm = () => {
    setQueueForm({
      name: '',
      description: '',
      routingStrategy: 'round-robin',
      maxQueueSize: 50,
      maxWaitTime: 300,
      assignedAgents: [],
      isActive: true,
    });
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      loadData();
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const toggleAgentInQueue = (agentId: string) => {
    setQueueForm(prev => ({
      ...prev,
      assignedAgents: prev.assignedAgents.includes(agentId)
        ? prev.assignedAgents.filter(id => id !== agentId)
        : [...prev.assignedAgents, agentId]
    }));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#667eea', fontWeight: 'bold', fontSize: '20px' }}>
              📞 VaxCall Contact Center
            </Link>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['dashboard', 'queues', 'agents', 'calls', 'flows'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeTab === tab ? '#667eea' : 'transparent',
                    color: activeTab === tab ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: activeTab === tab ? '600' : '400',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#6b7280' }}>
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
              Contact Center Dashboard
            </h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Active Calls</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
                  {calls.filter(c => c.status === 'active').length}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Waiting in Queue</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {calls.filter(c => c.status === 'waiting').length}
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Active Queues</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
                  {queues.filter(q => q.isActive).length}
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Available Agents</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6' }}>0</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Quick Actions</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('queues')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  ➕ Create Queue
                </button>
                <button
                  onClick={() => navigate('/contact-center/call-flow-builder')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  🎯 Create Call Flow
                </button>
                <button
                  onClick={() => setActiveTab('agents')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  👤 Manage Agents
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queues' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Call Queues</h1>
              <button
                onClick={() => {
                  setEditingQueue(null);
                  resetQueueForm();
                  setShowQueueModal(true);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                ➕ Create Queue
              </button>
            </div>

            {queues.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '48px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No queues yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Create your first call queue to start routing customer calls
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {queues.map((queue) => (
                  <div
                    key={queue.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                          {queue.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                          {queue.description || 'No description'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                          <span>👥 {queue.assignedAgents.length} agents</span>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: queue.isActive ? '#d1fae5' : '#fee2e2',
                            color: queue.isActive ? '#065f46' : '#991b1b',
                            borderRadius: '12px',
                          }}>
                            {queue.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditQueue(queue)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQueue(queue.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'flows' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Call Flows</h1>
              <button
                onClick={() => navigate('/contact-center/call-flow-builder')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                ➕ Create Call Flow
              </button>
            </div>

            {flows.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '48px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Call Flows Yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Create visual call flows with drag-and-drop nodes for IVR menus, queues, agent routing, and more
                </p>
                <button
                  onClick={() => navigate('/contact-center/call-flow-builder')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  🎨 Create Your First Flow
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {flows.map((flow) => (
                  <div
                    key={flow.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                          🎯 {flow.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                          {flow.description || 'No description'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                          <span>📊 {flow.nodes?.length || 0} nodes</span>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: flow.isActive ? '#d1fae5' : '#fee2e2',
                            color: flow.isActive ? '#065f46' : '#991b1b',
                            borderRadius: '12px',
                          }}>
                            {flow.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this call flow?')) {
                            try {
                              await contactCenterService.deleteCallFlow(flow.id);
                              loadData();
                            } catch (error) {
                              alert('Failed to delete flow');
                            }
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Agent Management</h1>
            
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Current Role</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>{u.name}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: u.role === 'admin' ? '#dbeafe' : u.role === 'supervisor' ? '#fef3c7' : u.role === 'agent' ? '#d1fae5' : '#f3f4f6',
                          color: u.role === 'admin' ? '#1e40af' : u.role === 'supervisor' ? '#92400e' : u.role === 'agent' ? '#065f46' : '#374151',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Call History</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '48px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Call History & Analytics</h3>
              <p style={{ color: '#6b7280' }}>
                View detailed call records, analytics, and performance metrics
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Queue Modal */}
      {showQueueModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
              {editingQueue ? 'Edit Queue' : 'Create New Queue'}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Queue Name *
              </label>
              <input
                type="text"
                value={queueForm.name}
                onChange={(e) => setQueueForm({ ...queueForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                placeholder="e.g., Support Queue"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={queueForm.description}
                onChange={(e) => setQueueForm({ ...queueForm, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                }}
                placeholder="Queue description"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Routing Strategy *
              </label>
              <select
                value={queueForm.routingStrategy}
                onChange={(e) => setQueueForm({ ...queueForm, routingStrategy: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                <option value="round-robin">Round Robin</option>
                <option value="longest-idle">Longest Idle</option>
                <option value="skill-based">Skill Based</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Max Queue Size
                </label>
                <input
                  type="number"
                  value={queueForm.maxQueueSize}
                  onChange={(e) => setQueueForm({ ...queueForm, maxQueueSize: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Max Wait Time (seconds)
                </label>
                <input
                  type="number"
                  value={queueForm.maxWaitTime}
                  onChange={(e) => setQueueForm({ ...queueForm, maxWaitTime: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Assign Agents
              </label>
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '12px',
                maxHeight: '200px',
                overflow: 'auto',
              }}>
                {users.filter(u => u.role === 'agent' || u.role === 'supervisor').map((agent) => (
                  <label key={agent.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={queueForm.assignedAgents.includes(agent.id)}
                      onChange={() => toggleAgentInQueue(agent.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <span>{agent.name} ({agent.email})</span>
                  </label>
                ))}
                {users.filter(u => u.role === 'agent' || u.role === 'supervisor').length === 0 && (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No agents available. Assign agent role to users first.
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={queueForm.isActive}
                  onChange={(e) => setQueueForm({ ...queueForm, isActive: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: '500' }}>Active</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowQueueModal(false);
                  setEditingQueue(null);
                  resetQueueForm();
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingQueue ? handleUpdateQueue : handleCreateQueue}
                disabled={!queueForm.name}
                style={{
                  padding: '10px 20px',
                  backgroundColor: queueForm.name ? '#667eea' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: queueForm.name ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                }}
              >
                {editingQueue ? 'Update' : 'Create'} Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
