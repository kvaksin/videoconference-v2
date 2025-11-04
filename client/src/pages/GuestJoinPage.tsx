import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function GuestJoinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);

  useEffect(() => {
    loadMeetingInfo();
  }, [id]);

  const loadMeetingInfo = async () => {
    try {
      const response = await fetch(`/api/meetings/${id}`);
      if (!response.ok) {
        throw new Error('Meeting not found');
      }
      const data = await response.json();
      setMeetingInfo(data.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load meeting information');
    } finally {
      setLoadingMeeting(false);
    }
  };

  const handleJoinAsGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!meetingInfo) {
      setError('Meeting information not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/meetings/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: guestName.trim(),
          isGuest: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join meeting');
      }

      const guestInfo = {
        name: guestName.trim(),
        joinedAt: new Date().toISOString(),
        isGuest: true,
        meetingId: id,
      };
      
      sessionStorage.setItem('guestInfo', JSON.stringify(guestInfo));
      navigate(`/guest/meeting/${id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-section">
        <div className="container-small">
          <div className="card text-center">
            {loadingMeeting ? (
              <div>
                <h1 className="card-title">Loading Meeting...</h1>
                <p className="card-description">Please wait while we fetch the meeting information.</p>
              </div>
            ) : error && !meetingInfo ? (
              <div>
                <h1 className="card-title" style={{ color: '#dc2626' }}>Meeting Not Found</h1>
                <p className="card-description">{error}</p>
                <div className="mt-3">
                  <a href="/" className="nav-link" style={{ color: '#667eea' }}>
                    ← Back to Home
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h1 className="card-title">Join Meeting</h1>
                  {meetingInfo && (
                    <div className="card-glass mb-3">
                      <h3 className="card-title" style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{meetingInfo.title}</h3>
                      {meetingInfo.description && (
                        <p className="card-description" style={{ margin: 0, fontSize: '14px' }}>{meetingInfo.description}</p>
                      )}
                      <p className="card-description" style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                        Meeting ID: {meetingInfo.id}
                      </p>
                    </div>
                  )}
                  <p className="card-description">
                    Enter your name to join this video conference meeting
                  </p>
                </div>

                {error && (
                  <div className="card" style={{ backgroundColor: '#fee', border: '1px solid #fcc', marginBottom: '1rem' }}>
                    <p style={{ color: '#d00', margin: 0 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleJoinAsGuest}>
                  <div className="form-group">
                    <label className="form-label text-left">Your Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your full name"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !guestName.trim()}
                    className={`btn ${loading || !guestName.trim() ? 'btn-secondary' : 'btn-primary'} btn-large`}
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Joining...' : '🎥 Join Meeting'}
                  </button>
                </form>

                <div className="card-glass mt-4">
                  <h4 className="card-title" style={{ fontSize: '1rem', marginBottom: '8px' }}>👤 Guest Access</h4>
                  <ul className="card-description" style={{ textAlign: 'left', margin: 0, paddingLeft: '20px' }}>
                    <li>No account required</li>
                    <li>Full video and audio capabilities</li>
                    <li>Chat with other participants</li>
                    <li>Screen sharing available</li>
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="card-description" style={{ fontSize: '12px' }}>
                    Need an account? <a href="/register" className="nav-link" style={{ color: '#667eea' }}>Sign up here</a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}