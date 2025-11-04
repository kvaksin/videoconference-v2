import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import type { Meeting } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'availability' | 'booking';
  meetingId?: string;
  userId?: string;
  description?: string;
}

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [availabilitySettings, setAvailabilitySettings] = useState({
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  const [createEventForm, setCreateEventForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'meeting' as 'meeting' | 'availability',
  });

  useEffect(() => {
    loadMeetings();
    loadAvailabilitySettings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = user?.role === 'admin' ? await apiService.getAllMeetings() : await apiService.getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await apiService.deleteMeeting(meetingId);
      await loadMeetings(); // Reload meetings after deletion
      alert('Meeting deleted successfully.');
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      alert('Failed to delete meeting. Please try again.');
    }
  };

  const handleMeetingClick = (event: CalendarEvent) => {
    if (event.type === 'meeting' && event.meetingId) {
      const meeting = meetings.find(m => m.id === event.meetingId);
      if (meeting) {
        setSelectedMeeting(meeting);
        setShowMeetingDetails(true);
      }
    }
  };

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/meeting/${meetingId}`, '_blank');
  };

  const closeMeetingDetails = () => {
    setShowMeetingDetails(false);
    setSelectedMeeting(null);
  };

  const loadAvailabilitySettings = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem('availabilitySettings');
    if (saved) {
      setAvailabilitySettings(JSON.parse(saved));
    }
  };

  const saveAvailabilitySettings = (settings: typeof availabilitySettings) => {
    setAvailabilitySettings(settings);
    localStorage.setItem('availabilitySettings', JSON.stringify(settings));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (createEventForm.type === 'meeting') {
        const startDateTime = new Date(`${createEventForm.date}T${createEventForm.startTime}`);
        const endDateTime = new Date(`${createEventForm.date}T${createEventForm.endTime}`);
        const duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));

        await apiService.createMeeting({
          title: createEventForm.title,
          description: createEventForm.description,
          scheduledAt: startDateTime.toISOString(),
          duration,
        });
      }
      
      setShowCreateForm(false);
      setCreateEventForm({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'meeting',
      });
      loadMeetings();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const generateCalendarGrid = (): Date[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    
    meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.scheduledAt);
      if (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      ) {
        events.push({
          id: meeting.id,
          title: meeting.title,
          start: meetingDate,
          end: new Date(meetingDate.getTime() + meeting.duration * 60 * 1000),
          type: 'meeting',
          meetingId: meeting.id,
          description: meeting.description,
        });
      }
    });
    
    return events;
  };

  const exportToICS = () => {
    const events = meetings.map(meeting => {
      const startDate = new Date(meeting.scheduledAt);
      const endDate = new Date(startDate.getTime() + meeting.duration * 60 * 1000);
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      return [
        'BEGIN:VEVENT',
        `UID:${meeting.id}@videoconference.app`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${meeting.title}`,
        `DESCRIPTION:${meeting.description || ''}`,
        `LOCATION:Video Conference Meeting`,
        `URL:${window.location.origin}/meeting/${meeting.id}`,
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Video Conference App//Calendar//EN',
      'CALSCALE:GREGORIAN',
      events,
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'meetings.ics';
    link.click();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const calendarDates = generateCalendarGrid();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if user has Full license for calendar features
  const hasFullLicense = user?.license === 'full';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            to="/dashboard" 
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{ color: 'white', margin: 0 }}>Calendar & Scheduling</h1>
          {user?.role === 'admin' && (
            <span style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Admin Mode - Can delete any meeting
            </span>
          )}
          {!hasFullLicense && (
            <span style={{
              backgroundColor: 'rgba(255, 193, 7, 0.2)',
              color: '#ffc107',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Upgrade to Full License for advanced features
            </span>
          )}
        </div>
        <button
          onClick={logout}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {/* Calendar Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Calendar Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => navigateMonth('prev')}
              style={{
                padding: '8px 12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, color: '#1e293b' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              style={{
                padding: '8px 12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ›
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              + New Event
            </button>
            <button
              onClick={exportToICS}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              📅 Export ICS
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ padding: '24px' }}>
          {/* Day Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            marginBottom: '12px',
          }}>
            {dayNames.map(day => (
              <div
                key={day}
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#64748b',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Dates */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
          }}>
            {calendarDates.map((date, index) => {
              const events = getEventsForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  style={{
                    minHeight: '120px',
                    padding: '8px',
                    backgroundColor: isCurrentMonth ? 'white' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    fontWeight: isToday ? '700' : '500',
                    color: isToday ? '#667eea' : isCurrentMonth ? '#1e293b' : '#94a3b8',
                    marginBottom: '4px',
                  }}>
                    {date.getDate()}
                  </div>
                  
                  {events.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleMeetingClick(event)}
                      style={{
                        backgroundColor: event.type === 'meeting' ? '#dbeafe' : '#dcfce7',
                        color: event.type === 'meeting' ? '#1d4ed8' : '#15803d',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        marginBottom: '2px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={`Click to view details: ${event.title} - ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      <span style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        flex: 1,
                        minWidth: 0
                      }}>
                        {event.title}
                      </span>
                      {user?.role === 'admin' && event.type === 'meeting' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeeting(event.id);
                          }}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            padding: '1px 3px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            marginLeft: '4px',
                            flexShrink: 0,
                          }}
                          title="Delete meeting (Admin)"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability Settings */}
        {hasFullLicense && (
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}>
            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>📋 Availability Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Working Hours
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="time"
                    value={availabilitySettings.workingHours.start}
                    onChange={(e) => saveAvailabilitySettings({
                      ...availabilitySettings,
                      workingHours: { ...availabilitySettings.workingHours, start: e.target.value }
                    })}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={availabilitySettings.workingHours.end}
                    onChange={(e) => saveAvailabilitySettings({
                      ...availabilitySettings,
                      workingHours: { ...availabilitySettings.workingHours, end: e.target.value }
                    })}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Time Zone
                </label>
                <select
                  value={availabilitySettings.timeZone}
                  onChange={(e) => saveAvailabilitySettings({
                    ...availabilitySettings,
                    timeZone: e.target.value
                  })}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Europe/Tallinn">Tallinn (EET)</option>
                  <option value="Europe/Berlin">Berlin (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Australia/Sydney">Sydney (AEDT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Booking Link
                </label>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#e0f2fe',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {window.location.origin}/book/{user?.id}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${user?.id}`)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#0369a1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Event Title
                </label>
                <input
                  type="text"
                  value={createEventForm.title}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Description
                </label>
                <textarea
                  value={createEventForm.description}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={createEventForm.date}
                    onChange={(e) => setCreateEventForm({ ...createEventForm, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={createEventForm.startTime}
                    onChange={(e) => setCreateEventForm({ ...createEventForm, startTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={createEventForm.endTime}
                    onChange={(e) => setCreateEventForm({ ...createEventForm, endTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showMeetingDetails && selectedMeeting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
          }}>
            {/* Close button */}
            <button
              onClick={closeMeetingDetails}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
              }}
            >
              ×
            </button>

            {/* Meeting details */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                marginBottom: '16px', 
                color: '#1e293b',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                📅 {selectedMeeting.title}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                    📆 Date & Time
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {new Date(selectedMeeting.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {new Date(selectedMeeting.scheduledAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </p>
                </div>

                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                    ⏱️ Duration
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {selectedMeeting.duration} minutes
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                  📝 Description
                </h4>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280', 
                  fontSize: '14px',
                  lineHeight: '1.5',
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '6px',
                  minHeight: '40px'
                }}>
                  {selectedMeeting.description || 'No description provided'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                    📊 Status
                  </h4>
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: 
                      selectedMeeting.status === 'active' ? '#10b981' :
                      selectedMeeting.status === 'scheduled' ? '#f59e0b' :
                      selectedMeeting.status === 'completed' ? '#6b7280' : '#ef4444',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {selectedMeeting.status}
                  </span>
                </div>

                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                    👥 Participants
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {selectedMeeting.participants.length} participant{selectedMeeting.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Meeting ID for reference */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                  🆔 Meeting ID
                </h4>
                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#4b5563',
                  wordBreak: 'break-all'
                }}>
                  {selectedMeeting.id}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px'
            }}>
              <button
                onClick={closeMeetingDetails}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
              
              {(selectedMeeting.status === 'scheduled' || selectedMeeting.status === 'active') && (
                <button
                  onClick={() => handleJoinMeeting(selectedMeeting.id)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🎥 Join Meeting
                </button>
              )}

              {selectedMeeting.status === 'completed' && (
                <div style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Meeting Ended
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}