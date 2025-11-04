import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import type { Availability, MeetingRequest } from '../types';

export default function AvailabilityPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MeetingRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const timeZones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Tallinn', label: 'Tallinn (EET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [availabilityForm, setAvailabilityForm] = useState(() => {
    const defaultAvailability = dayNames.map((_, index) => ({
      dayOfWeek: index,
      startTime: '09:00',
      endTime: '17:00',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isActive: index >= 1 && index <= 5, // Monday to Friday by default
    }));
    return defaultAvailability;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availabilityData, requestsData, countData] = await Promise.all([
        apiService.getMyAvailability(),
        apiService.getMyMeetingRequests(),
        apiService.getPendingRequestsCount(),
      ]);

      if (availabilityData.length > 0) {
        // Convert existing availability to form format
        const formData = dayNames.map((_, index) => {
          const existingDay = availabilityData.find(a => a.dayOfWeek === index);
          return existingDay ? {
            dayOfWeek: index,
            startTime: existingDay.startTime,
            endTime: existingDay.endTime,
            timeZone: existingDay.timeZone,
            isActive: existingDay.isActive,
          } : {
            dayOfWeek: index,
            startTime: '09:00',
            endTime: '17:00',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isActive: false,
          };
        });
        setAvailabilityForm(formData);
      }

      setAvailability(availabilityData);
      setPendingRequests(requestsData.filter(r => r.status === 'pending'));
      setPendingCount(countData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      const activeAvailability = availabilityForm
        .filter(day => day.isActive)
        .map(day => ({
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          timeZone: day.timeZone,
          isActive: true,
        }));

      const savedAvailability = await apiService.setAvailability(activeAvailability);
      setAvailability(savedAvailability);
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Failed to save availability:', error);
      alert('Failed to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateDayAvailability = (dayIndex: number, field: string, value: any) => {
    setAvailabilityForm(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await apiService.approveMeetingRequest(requestId);
      alert('Meeting request approved!');
      loadData(); // Reload to update the lists
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await apiService.rejectMeetingRequest(requestId);
      alert('Meeting request rejected.');
      loadData(); // Reload to update the lists
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const formatRequestTime = (requestedAt: string, timeZone?: string) => {
    const date = new Date(requestedAt);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const getBookingLink = () => {
    return `${window.location.origin}/book/${user?.id}`;
  };

  const copyBookingLink = () => {
    const bookingUrl = getBookingLink();
    navigator.clipboard.writeText(bookingUrl).then(() => {
      alert('Booking link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy booking link');
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <p className="card-description-white">Loading availability settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-white">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">📅</span>
            <span className="logo-text">Availability</span>
          </div>
          <div className="nav-links">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary btn-small"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="btn btn-primary btn-small"
            >
              📅 Calendar
            </button>
            <button
              onClick={logout}
              className="btn btn-danger btn-small"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Header with Pending Requests Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Availability Management</h1>
            <p className="page-subtitle">Set your available hours and manage meeting requests</p>
          </div>
          {pendingCount > 0 && (
            <div className="status-badge status-pending" style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}>
              🔔 {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Booking Link Section */}
        <div className="card mb-4">
          <h2 className="card-title">Your Booking Link</h2>
          <p className="card-description">Share this link with others so they can request meetings with you:</p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            padding: '0.75rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '0.5rem',
            border: '1px solid #e9ecef',
            flexWrap: 'wrap'
          }}>
            <code style={{
              flex: 1,
              fontSize: '0.9rem',
              color: '#495057',
              backgroundColor: 'transparent',
              minWidth: '200px',
              wordBreak: 'break-all'
            }}>
              {getBookingLink()}
            </code>
            <button
              onClick={copyBookingLink}
              className="btn btn-primary btn-small"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        <div className="grid grid-2">
          {/* Availability Settings */}
          <div className="card">
            <h2 className="card-title">Weekly Availability</h2>
            <p className="card-description">Set the hours when you're available for meetings</p>

            <div style={{ marginBottom: '1.5rem' }}>
              {availabilityForm.map((day, index) => (
                <div key={index} style={{ 
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: '1px solid #e9ecef',
                  borderRadius: '0.5rem',
                  backgroundColor: day.isActive ? '#f8f9fa' : '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={(e) => updateDayAvailability(index, 'isActive', e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label style={{ fontWeight: '600', minWidth: '100px' }}>
                      {dayNames[index]}
                    </label>
                  </div>

                  {day.isActive && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '0.5rem',
                      marginLeft: '1.5rem'
                    }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>From:</label>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateDayAvailability(index, 'startTime', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>To:</label>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateDayAvailability(index, 'endTime', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Timezone:</label>
                        <select
                          value={day.timeZone}
                          onChange={(e) => updateDayAvailability(index, 'timeZone', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {timeZones.map(tz => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAvailability}
              disabled={saving}
              className={`btn ${saving ? 'btn-secondary' : 'btn-success'}`}
              style={{ width: '100%' }}
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>

          {/* Pending Meeting Requests */}
          <div className="card">
            <h2 className="card-title">
              Pending Meeting Requests 
              {pendingCount > 0 && (
                <span className="status-badge status-pending ml-2">
                  {pendingCount}
                </span>
              )}
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="text-center" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📭</div>
                <p className="card-description">No pending meeting requests</p>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {pendingRequests.map((request) => (
                  <div key={request.id} className="card-glass" style={{ marginBottom: '1rem', padding: '1rem' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
                        {request.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: '#666',
                          fontWeight: '600'
                        }}>
                          {request.requesterName}
                        </span>
                        {request.isGuestRequest && (
                          <span className="status-badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                            Guest
                          </span>
                        )}
                      </div>
                    </div>

                    {request.description && (
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.75rem' }}>
                        {request.description}
                      </p>
                    )}

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.9rem', color: '#333', marginBottom: '0.25rem' }}>
                        <strong>📅 {formatRequestTime(request.requestedAt)}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        Duration: {request.duration} minutes
                      </div>
                      {request.requesterEmail && (
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          Email: {request.requesterEmail}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="btn btn-success btn-small"
                        style={{ flex: 1 }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="btn btn-danger btn-small"
                        style={{ flex: 1 }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="card mt-4">
          <h3 className="card-title">How It Works</h3>
          <div className="grid grid-2">
            <div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>📋 Step 1: Set Your Availability</h4>
              <p className="card-description" style={{ fontSize: '0.9rem' }}>
                Configure your weekly availability by selecting the days and times when you're available for meetings. 
                You can set different hours for each day and specify your timezone.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>🔗 Step 2: Share Your Link</h4>
              <p className="card-description" style={{ fontSize: '0.9rem' }}>
                Copy your personal booking link and share it with anyone who needs to schedule a meeting with you. 
                They can request 30-minute or 1-hour meetings within your available hours.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>✅ Step 3: Approve Requests</h4>
              <p className="card-description" style={{ fontSize: '0.9rem' }}>
                Review incoming meeting requests and approve or reject them. Approved meetings will automatically 
                be added to your calendar and a meeting room will be created.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>🎥 Step 4: Join Meetings</h4>
              <p className="card-description" style={{ fontSize: '0.9rem' }}>
                When it's time for the meeting, both you and your guest will receive access to the video conference room. 
                Guest participants don't need to create an account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}