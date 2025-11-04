import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import type { AvailabilitySlot, MeetingRequest } from '../types';

export default function RequestMeetingPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [userRequests, setUserRequests] = useState<MeetingRequest[]>([]);
  const [showCalendarView, setShowCalendarView] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    requesterName: user?.name || '',
    requesterEmail: user?.email || '',
  });

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

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

  const [selectedTimeZone, setSelectedTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }

    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const slots = await apiService.getAvailableSlots(userId!, startDate, endDate);
      setAvailableSlots(slots);
      
      // Load user's meeting requests if logged in
      if (user) {
        try {
          const requests = await apiService.getMyRequestsMade();
          setUserRequests(requests || []);
        } catch (err) {
          console.log('No requests found');
        }
      }
      
      setError('');
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError('Failed to load availability. The user might not have set up their availability yet.');
    } finally {
      setLoading(false);
    }
  };

  // Calendar helper functions
  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const currentDateObj = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDateObj));
        currentDateObj.setDate(currentDateObj.getDate() + 1);
      }
      calendar.push(weekDays);
      if (currentDateObj.getMonth() !== month && weekDays.some(d => d.getMonth() === month)) {
        break;
      }
    }
    
    return calendar;
  };

  const getAvailableSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.filter(slot => slot.date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowCalendarView(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const cancelMeetingRequest = async (requestId: string) => {
    try {
      await apiService.cancelMeetingRequest(requestId);
      setUserRequests(prev => prev.filter(req => req.id !== requestId));
      alert('Meeting request cancelled successfully.');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel meeting request.');
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a meeting title');
      return;
    }

    if (!formData.requesterName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Construct the requested date/time
      const requestedDateTime = new Date(`${selectedSlot.date}T${selectedSlot.startTime}`);

      const requestData = {
        hostId: userId!,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requestedAt: requestedDateTime.toISOString(),
        duration: formData.duration,
        requesterName: formData.requesterName.trim(),
        requesterEmail: formData.requesterEmail.trim() || undefined,
        isGuestRequest: !user,
      };

      await apiService.createMeetingRequest(requestData);
      
      alert('Meeting request submitted successfully! The host will be notified and you\'ll receive confirmation once approved.');
      
      // Clear form
      setFormData({
        title: '',
        description: '',
        duration: 30,
        requesterName: user?.name || '',
        requesterEmail: user?.email || '',
      });
      setSelectedSlot(null);
      
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      setError('Failed to submit meeting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlotTime = (slot: AvailabilitySlot) => {
    const startDate = new Date(`${slot.date}T${slot.startTime}`);
    const endDate = new Date(`${slot.date}T${slot.endTime}`);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  };

  const formatSlotDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⏳</div>
            <h2 className="card-title-white">Loading Availability...</h2>
            <p className="card-description-white">Please wait while we fetch available time slots.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && availableSlots.length === 0) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>❌</div>
            <h2 className="card-title-white">Availability Not Found</h2>
            <p className="card-description-white">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
          {/* Header */}
          <div className="card-glass text-center" style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📅</div>
            <h1 className="card-title-white">Request a Meeting</h1>
            <p className="card-description-white">
              {showCalendarView ? 'Select a date to see available time slots' : 'Choose a time slot and provide meeting details'}
            </p>
          </div>

          {showCalendarView ? (
            <>
              {/* Calendar View */}
              <div className="card-glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="btn btn-secondary"
                  >
                    ← Previous
                  </button>
                  <h2 className="card-title-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="btn btn-secondary"
                  >
                    Next →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden'
                }}>
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{
                      padding: '1rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {generateCalendarGrid().flat().map((date, index) => {
                    const availableSlots = getAvailableSlotsForDate(date);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isPast = isPastDate(date);
                    const todayClass = isToday(date);

                    return (
                      <div
                        key={index}
                        onClick={() => !isPast && isCurrentMonth && availableSlots.length > 0 && handleDayClick(date)}
                        style={{
                          padding: '1rem',
                          backgroundColor: todayClass 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : isCurrentMonth 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.1)',
                          color: isCurrentMonth ? 'white' : 'rgba(255, 255, 255, 0.4)',
                          cursor: !isPast && isCurrentMonth && availableSlots.length > 0 ? 'pointer' : 'default',
                          textAlign: 'center',
                          border: availableSlots.length > 0 && !isPast && isCurrentMonth 
                            ? '2px solid rgba(34, 197, 94, 0.5)' 
                            : '1px solid transparent',
                          position: 'relative',
                          minHeight: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ 
                          fontWeight: todayClass ? 'bold' : 'normal',
                          opacity: isPast ? 0.5 : 1
                        }}>
                          {date.getDate()}
                        </div>
                        
                        {isCurrentMonth && !isPast && (
                          <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                            {availableSlots.length > 0 ? (
                              <span style={{ color: '#22c55e' }}>
                                {availableSlots.length} slot{availableSlots.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Blocked
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '1rem', height: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.5)', borderRadius: '2px' }}></div>
                      <span className="card-description-white">Available</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '1rem', height: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px' }}></div>
                      <span className="card-description-white">Blocked (confidential)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '1rem', height: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '2px' }}></div>
                      <span className="card-description-white">Today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User's Meeting Requests */}
              {user && userRequests.length > 0 && (
                <div className="card-glass mt-4">
                  <h3 className="card-title-white" style={{ marginBottom: '1rem' }}>Your Meeting Requests</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {userRequests.map(request => (
                      <div key={request.id} style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h4 className="card-title-white" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                            {request.title}
                          </h4>
                          <p className="card-description-white" style={{ fontSize: '0.9rem', margin: 0 }}>
                            {new Date(request.requestedAt).toLocaleDateString()} at {new Date(request.requestedAt).toLocaleTimeString()} 
                            - Status: <span style={{ 
                              color: request.status === 'approved' ? '#22c55e' : 
                                     request.status === 'rejected' ? '#ef4444' : '#f59e0b' 
                            }}>
                              {request.status}
                            </span>
                          </p>
                        </div>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => cancelMeetingRequest(request.id)}
                            className="btn btn-danger btn-small"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected Date View */}
              <div className="grid grid-2">
                {/* Back to Calendar and Time Slots */}
                <div className="card-glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className="card-title-white">
                      {formatSlotDate(selectedDate)}
                    </h2>
                    <button
                      onClick={() => setShowCalendarView(true)}
                      className="btn btn-secondary btn-small"
                    >
                      ← Back to Calendar
                    </button>
                  </div>

                  {/* Timezone Selector */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      View times in:
                    </label>
                    <select
                      value={selectedTimeZone}
                      onChange={(e) => setSelectedTimeZone(e.target.value)}
                      className="form-input"
                      style={{ width: '100%' }}
                    >
                      {timeZones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Available Time Slots for Selected Date */}
                  <div>
                    <h4 className="card-title-white" style={{ marginBottom: '1rem' }}>Available Time Slots</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                      {getAvailableSlotsForDate(new Date(selectedDate)).map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`btn ${selectedSlot?.id === slot.id ? 'btn-success' : 'btn-secondary'} btn-small`}
                          style={{ 
                            padding: '0.75rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        >
                          {formatSlotTime(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Meeting Request Form */}
                <div className="card-glass">
                  <h2 className="card-title-white" style={{ marginBottom: '1.5rem' }}>
                    Meeting Details
                  </h2>

                  <form onSubmit={handleSubmitRequest}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Meeting Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Project Discussion"
                        className="form-input"
                        required
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Description (optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of what you'd like to discuss..."
                        className="form-input"
                        rows={3}
                        style={{ width: '100%', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Duration
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="form-input"
                        style={{ width: '100%' }}
                      >
                        {durations.map(duration => (
                          <option key={duration.value} value={duration.value}>{duration.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.requesterName}
                        onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                        placeholder="Your full name"
                        className="form-input"
                        required
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={formData.requesterEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="form-input"
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Selected Slot Display */}
                    {selectedSlot && (
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <h4 className="card-title-white" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                          Selected Time Slot:
                        </h4>
                        <p className="card-description-white" style={{ margin: 0, fontSize: '0.9rem' }}>
                          📅 {formatSlotDate(selectedSlot.date)}<br />
                          🕒 {formatSlotTime(selectedSlot)} ({formData.duration} minutes)
                        </p>
                      </div>
                    )}

                    {error && (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>
                          {error}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className={`btn ${submitting || !selectedSlot ? 'btn-secondary' : 'btn-success'}`}
                      style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        fontSize: '1.1rem',
                        cursor: submitting || !selectedSlot ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submitting ? 'Submitting...' : '📤 Submit Request'}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* Info Section */}
          <div className="card-glass mt-4">
            <h3 className="card-title-white" style={{ marginBottom: '1rem' }}>What Happens Next?</h3>
            <div className="grid grid-2">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📨</span>
                  <strong className="card-description-white">Request Sent</strong>
                </div>
                <p className="card-description-white" style={{ fontSize: '0.9rem', marginLeft: '1.7rem' }}>
                  Your meeting request will be sent to the host for review.
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <strong className="card-description-white">Approval</strong>
                </div>
                <p className="card-description-white" style={{ fontSize: '0.9rem', marginLeft: '1.7rem' }}>
                  Once approved, a meeting room will be created automatically.
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔗</span>
                  <strong className="card-description-white">Meeting Link</strong>
                </div>
                <p className="card-description-white" style={{ fontSize: '0.9rem', marginLeft: '1.7rem' }}>
                  You'll receive a meeting link to join at the scheduled time.
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎥</span>
                  <strong className="card-description-white">No Account Needed</strong>
                </div>
                <p className="card-description-white" style={{ fontSize: '0.9rem', marginLeft: '1.7rem' }}>
                  You can join the meeting as a guest without creating an account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}