import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import type { Meeting } from '../types';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

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

  useEffect(() => {
    if (!id) {
      setError('No meeting ID provided');
      setLoading(false);
      return;
    }

    loadMeetingInfo();
  }, [id]);

  const loadMeetingInfo = async () => {
    try {
      setLoading(true);
      
      // First try to load as a meeting
      try {
        const meetingData = await apiService.getMeeting(id!);
        setMeeting(meetingData);
        setError('');
      } catch (meetingError: any) {
        // If meeting not found, check if it's a user ID and redirect to request page
        if (meetingError.response?.status === 404) {
          console.log('Meeting not found, redirecting to request meeting page');
          navigate(`/request/${id}`);
          return;
        } else {
          throw meetingError;
        }
      }
    } catch (error: any) {
      console.error('Failed to load meeting:', error);
      setError('Meeting not found or is no longer available.');
    } finally {
      setLoading(false);
    }
  };

  const formatMeetingTime = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: selectedTimeZone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      // Store guest info and redirect to request meeting page
      const guestInfo = {
        name: guestName.trim(),
        email: guestEmail.trim(),
        timeZone: selectedTimeZone,
        bookedAt: new Date().toISOString(),
        isGuest: true,
        meetingId: id,
      };
      
      sessionStorage.setItem('guestInfo', JSON.stringify(guestInfo));
      
      // Check if this is a user ID (for requesting meetings) or meeting ID (for joining)
      // If it's a meeting ID, go to guest join flow
      // If it's a user ID, go to request meeting flow
      try {
        await apiService.getMeeting(id!);
        // It's a valid meeting ID, redirect to guest join
        navigate(`/guest/join/${id}`);
      } catch {
        // Not a meeting ID, assume it's a user ID for requesting meetings
        navigate(`/request/${id}`);
      }
    } catch (error) {
      console.error('Failed to book meeting:', error);
      setError('Failed to book meeting. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
            <h2 className="card-title-white">Loading...</h2>
            <p className="card-description-white">Checking if this is a meeting to join or someone to book with...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>❌</div>
            <h2 className="card-title-white">Meeting Not Available</h2>
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

  if (!meeting) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
            <h2 className="card-title-white">Meeting Not Found</h2>
            <p className="card-description-white">The meeting you're looking for doesn't exist or has been cancelled.</p>
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
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
          {/* Meeting Details Card */}
          <div className="card-glass" style={{ marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📅</div>
              <h1 className="card-title-white">Book Meeting</h1>
              <p className="card-description-white">Reserve your spot in this meeting</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 className="card-title-white" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                {meeting.title}
              </h2>
              
              {meeting.description && (
                <p className="card-description-white" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                  {meeting.description}
                </p>
              )}

              <div className="card-glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🕒</span>
                  <strong className="card-description-white">When:</strong>
                </div>
                <p className="card-description-white" style={{ marginLeft: '1.7rem', fontSize: '1rem' }}>
                  {formatMeetingTime(meeting.scheduledAt)}
                </p>
              </div>

              <div className="card-glass" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                  <strong className="card-description-white">Duration:</strong>
                </div>
                <p className="card-description-white" style={{ marginLeft: '1.7rem', fontSize: '1rem' }}>
                  {meeting.duration} minutes
                </p>
              </div>

              <div className={`status-badge ${
                meeting.status === 'active' ? 'status-active' : 
                meeting.status === 'scheduled' ? 'status-scheduled' : 
                'status-ended'
              }`} style={{ fontSize: '0.9rem' }}>
                {meeting.status === 'active' ? '🟢 LIVE NOW' : 
                 meeting.status === 'scheduled' ? '🟡 SCHEDULED' : 
                 '🔴 ENDED'}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {meeting.status === 'scheduled' || meeting.status === 'active' ? (
            <div className="card-glass">
              <h3 className="card-title-white" style={{ marginBottom: '1.5rem' }}>
                Join as Guest
              </h3>
              
              <form onSubmit={handleBookMeeting}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="card-description-white" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Your Timezone
                  </label>
                  <select
                    value={selectedTimeZone}
                    onChange={(e) => setSelectedTimeZone(e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    {timeZones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <p className="card-description-white" style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
                    Meeting time will be displayed in your selected timezone
                  </p>
                </div>

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
                  className="btn btn-success"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                >
                  🚀 Join Meeting
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                  <strong className="card-description-white">Guest Access Info</strong>
                </div>
                <ul className="card-description-white" style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  <li>No account required to join</li>
                  <li>Full video, audio, and chat access</li>
                  <li>Meeting link valid until meeting ends</li>
                  <li>Your name will be visible to other participants</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="card-glass text-center">
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔒</div>
              <h3 className="card-title-white">Meeting Not Available</h3>
              <p className="card-description-white">
                This meeting has ended and is no longer accepting participants.
              </p>
            </div>
          )}

          {/* Alternative Access */}
          <div className="card-glass" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h4 className="card-title-white" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Have an Account?
            </h4>
            <p className="card-description-white" style={{ marginBottom: '1rem' }}>
              Sign in to access additional features and meeting management tools.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn btn-secondary"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}