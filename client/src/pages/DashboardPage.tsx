import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import type { Meeting } from '../types';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingAdHoc, setCreatingAdHoc] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const navigate = useNavigate();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await apiService.getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createMeeting({
        title,
        description,
        scheduledAt,
        duration: parseInt(duration),
      });
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
      setScheduledAt('');
      setDuration('60');
      loadMeetings();
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await apiService.deleteMeeting(id);
        loadMeetings();
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const copyGuestLink = (meetingId: string) => {
    const guestUrl = `${window.location.origin}/guest/join/${meetingId}`;
    navigator.clipboard.writeText(guestUrl).then(() => {
      alert('Guest link copied to clipboard! Anyone with this link can join without an account.');
    }).catch(() => {
      alert('Failed to copy guest link');
    });
  };

  const handleStartAdHocMeeting = async () => {
    setCreatingAdHoc(true);
    try {
      const currentTime = new Date().toISOString();
      const meeting = await apiService.createMeeting({
        title: `Ad-hoc Meeting - ${new Date().toLocaleString()}`,
        description: 'Quick meeting started instantly',
        scheduledAt: currentTime,
        duration: 60,
      });
      
      // Immediately navigate to the meeting
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Failed to start ad-hoc meeting:', error);
      alert('Failed to start meeting. Please try again.');
    } finally {
      setCreatingAdHoc(false);
    }
  };

  return (
    <div className="page-container-white">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">📹</span>
            <span className="logo-text">VaxCall</span>
          </div>
          <div className="nav-links">
            <span className="user-greeting">Welcome, {user?.name}!</span>
            <Link to="/calendar" className="nav-link">📅 Calendar</Link>
            <Link to="/availability" className="nav-link">⏰ Availability</Link>
            <Link to="/contact-center" className="nav-link">📞 Contact Center</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link">Admin Panel</Link>
            )}
            <button onClick={logout} className="btn btn-secondary btn-small">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="content-section-white">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title-dark">Dashboard</h1>
          </div>

          {/* Action Buttons */}
          <div className="actions mb-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary"
            >
              {showCreateForm ? 'Cancel' : 'Schedule Meeting'}
            </button>
            <button
              onClick={handleStartAdHocMeeting}
              disabled={creatingAdHoc}
              className={`btn ${creatingAdHoc ? 'btn-secondary' : 'btn-success'}`}
              style={{ cursor: creatingAdHoc ? 'not-allowed' : 'pointer' }}
            >
              {creatingAdHoc ? '⏳ Starting...' : '🚀 Start Meeting Now'}
            </button>
            <button
              onClick={loadMeetings}
              className="btn btn-warning"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Create Meeting Form */}
          {showCreateForm && (
            <div className="card mb-4">
              <h2 className="card-title">Schedule New Meeting</h2>
              <form onSubmit={handleCreateMeeting}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="15"
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  Create Meeting
                </button>
              </form>
            </div>
          )}

          {/* Meetings Section */}
          <h2 className="section-title-white">Your Meetings</h2>
          {loading ? (
            <div className="card text-center">
              <p className="card-description">Loading meetings...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="card text-center">
              <p className="card-description">No meetings yet. Create your first meeting!</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="card">
                  <h3 className="card-title">{meeting.title}</h3>
                  {meeting.description && <p className="card-description">{meeting.description}</p>}
                  
                  <div className="mb-2">
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge ${
                      meeting.status === 'active' ? 'status-active' : 
                      meeting.status === 'scheduled' ? 'status-scheduled' : 
                      'status-ended'
                    }`}>
                      {meeting.status === 'active' ? '🟢 ACTIVE' : 
                       meeting.status === 'scheduled' ? '🟡 SCHEDULED' : 
                       '🔴 COMPLETED'}
                    </span>
                  </div>
                  
                  <p className="card-description mb-1">
                    <strong>Scheduled:</strong> {new Date(meeting.scheduledAt).toLocaleString()}
                  </p>
                  <p className="card-description mb-3">
                    <strong>Duration:</strong> {meeting.duration} minutes
                  </p>
                  
                  <div className="actions">
                    {meeting.status === 'scheduled' && (
                      <button
                        onClick={() => navigate(`/meeting/${meeting.id}`)}
                        className="btn btn-primary btn-small"
                      >
                        Start Meeting
                      </button>
                    )}
                    {meeting.status === 'active' && meeting.roomId && (
                      <button
                        onClick={() => navigate(`/meeting/${meeting.id}`)}
                        className="btn btn-success btn-small"
                      >
                        Join Meeting
                      </button>
                    )}
                    <button
                      onClick={() => copyGuestLink(meeting.id)}
                      className="btn btn-success btn-small"
                      title="Copy guest link for external participants"
                    >
                      👥 Guest Link
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
