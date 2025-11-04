import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import type { User, Meeting } from '../types';

export default function AdminPage() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
    license: 'basic'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, meetingsData, statsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllMeetings(),
        apiService.getStats(),
      ]);
      setUsers(usersData);
      setMeetings(meetingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await apiService.deleteMeeting(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete meeting:', error);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createUser(createFormData);
      setCreateFormData({
        email: '',
        password: '',
        name: '',
        role: 'user',
        license: 'basic'
      });
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please check the details and try again.');
    }
  };

  const handleUpdateLicense = async (userId: string, newLicense: string) => {
    try {
      await apiService.updateUserLicense(userId, newLicense);
      loadData();
    } catch (error) {
      console.error('Failed to update user license:', error);
      alert('Failed to update license. Please try again.');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      loadData();
    } catch (error: any) {
      console.error('Failed to update user role:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update role. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Admin Panel</h1>
        <div>
          <Link to="/dashboard" style={{ marginRight: '20px' }}>Dashboard</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Total Users</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Basic License</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6c757d' }}>{stats.basicUsers}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Full License</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{stats.fullUsers}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Active</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{stats.activeMeetings}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Scheduled</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{stats.scheduledMeetings}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Completed</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6c757d' }}>{stats.completedMeetings}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>User Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {showCreateForm ? 'Cancel' : '+ Create User'}
            </button>
          </div>

          {showCreateForm && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #ddd'
            }}>
              <h3>Create New User</h3>
              <form onSubmit={handleCreateUser} style={{ marginTop: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                    <input
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
                    <input
                      type="text"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                    <input
                      type="password"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role</label>
                    <select
                      value={createFormData.role}
                      onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>License</label>
                    <select
                      value={createFormData.license}
                      onChange={(e) => setCreateFormData({ ...createFormData, license: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="basic">Basic</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  Create User
                </button>
              </form>
            </div>
          )}

          <h2>Users</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>License</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderTop: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>
                      {user.email === 'admin@ex.com' ? (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}>
                          admin (protected)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            backgroundColor: user.role === 'admin' ? '#e3f2fd' : '#f8f9fa',
                            fontSize: '12px',
                            color: user.role === 'admin' ? '#0d47a1' : '#495057'
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={user.license}
                        onChange={(e) => handleUpdateLicense(user.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          backgroundColor: user.license === 'full' ? '#e3f2fd' : '#f5f5f5',
                          fontSize: '12px'
                        }}
                      >
                        <option value="basic">Basic</option>
                        <option value="full">Full</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      {user.email !== 'admin@ex.com' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '14px',
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>All Meetings</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Scheduled</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Participants</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id} style={{ borderTop: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{meeting.title}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: 
                          meeting.status === 'active' ? '#28a745' :
                          meeting.status === 'scheduled' ? '#ffc107' :
                          meeting.status === 'completed' ? '#6c757d' : '#dc3545',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        {meeting.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(meeting.scheduledAt).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{meeting.duration} min</td>
                    <td style={{ padding: '12px' }}>{meeting.participants.length}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '14px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
