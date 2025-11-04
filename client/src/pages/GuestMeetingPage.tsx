import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket.service';

export default function GuestMeetingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [guestUserId, setGuestUserId] = useState<string>('');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [roomId, setRoomId] = useState<string>('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Get guest info from sessionStorage
    const storedGuestInfo = sessionStorage.getItem('guestInfo');
    if (!storedGuestInfo) {
      navigate(`/guest/join/${id}`);
      return;
    }

    const guest = JSON.parse(storedGuestInfo);
    setGuestInfo(guest);

    // Load meeting info first, then initialize socket
    loadMeetingInfo().then((meeting) => {
      // Initialize socket connection for guest after meeting info is loaded
      initializeGuestSocket(guest, meeting);
    }).catch((error) => {
      console.error('Failed to initialize guest meeting:', error);
      navigate(`/guest/join/${id}`);
    });

    // Initialize media access
    initializeMedia();

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      socketService.disconnect();
    };
  }, [id, navigate]);

  const initializeMedia = async () => {
    try {
      // Request both video and audio permissions upfront
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsVideoOn(true);
      setIsAudioOn(true);
      setMediaPermissionDenied(false);
    } catch (error) {
      console.error('Error initializing media:', error);
      setMediaPermissionDenied(true);
      // Don't show alert immediately, let user manually enable
      console.log('Media access not available - user can enable manually');
    }
  };

  const requestMediaPermissions = async () => {
    setMediaPermissionDenied(false);
    await initializeMedia();
  };

  const loadMeetingInfo = async (): Promise<any> => {
    try {
      const response = await fetch(`/api/meetings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMeetingInfo(data.data);
        return Promise.resolve(data.data);
      } else {
        return Promise.reject('Failed to load meeting');
      }
    } catch (error) {
      console.error('Failed to load meeting info:', error);
      return Promise.reject(error);
    }
  };

  const initializeGuestSocket = (guest: any, meeting: any) => {
    // Connect to socket as guest
    socketService.connect();
    
    // Use the same roomId that authenticated users use
    const actualRoomId = meeting?.roomId || id;
    setRoomId(actualRoomId);
    console.log('Guest joining room:', actualRoomId, 'with guest info:', guest);
    console.log('Meeting data:', meeting);
    
    // Join the same meeting room that authenticated users join
    const guestUserId = `guest-${Date.now()}`;
    setGuestUserId(guestUserId);
    socketService.joinRoom(actualRoomId!, guestUserId);
    
    // Emit guest join event
    socketService.emit('guest-joined', {
      meetingId: actualRoomId,
      guestInfo: {
        name: guest.name,
        isGuest: true,
        joinedAt: guest.joinedAt,
        tempId: guestUserId,
      }
    });

    // Listen for participants updates
    socketService.on('participants-updated', (participantList: any[]) => {
      setParticipants(participantList);
    });

    // Listen for chat messages
    socketService.on('chat-message', (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for meeting events
    socketService.on('meeting-ended', () => {
      alert('The meeting has been ended by the host.');
      navigate('/');
    });

    // Listen for other users joining/leaving
    socketService.on('user-joined', (userData: any) => {
      console.log('User joined:', userData);
      // Add to participants list if needed
    });

    socketService.on('user-left', (userData: any) => {
      console.log('User left:', userData);
      // Remove from participants list if needed
    });

    // Listen for guest-specific events
    socketService.on('guest-joined', (guestData: any) => {
      console.log('Guest joined:', guestData);
      setParticipants(prev => [...prev, guestData]);
    });

    socketService.on('guest-left', (guestData: any) => {
      console.log('Guest left:', guestData);
      setParticipants(prev => prev.filter(p => p.tempId !== guestData.tempId));
    });
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        // Get new stream with video
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: isAudioOn 
        });
        
        // Stop existing stream if any
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsVideoOn(true);
      } else {
        // Turn off video but keep audio if it's on
        if (localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks();
          videoTracks.forEach(track => track.stop());
          
          // If audio is still on, create new stream with audio only
          if (isAudioOn) {
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({ 
                video: false, 
                audio: true 
              });
              localStreamRef.current = audioStream;
            } catch (error) {
              console.error('Error maintaining audio stream:', error);
            }
          } else {
            localStreamRef.current = null;
          }
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        setIsVideoOn(false);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const toggleAudio = async () => {
    try {
      if (!isAudioOn) {
        // Get new stream with audio
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: isVideoOn, 
          audio: true 
        });
        
        // Stop existing stream if any
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        localStreamRef.current = stream;
        if (localVideoRef.current && isVideoOn) {
          localVideoRef.current.srcObject = stream;
        }
        setIsAudioOn(true);
      } else {
        // Turn off audio but keep video if it's on
        if (localStreamRef.current) {
          const audioTracks = localStreamRef.current.getAudioTracks();
          audioTracks.forEach(track => track.stop());
          
          // If video is still on, create new stream with video only
          if (isVideoOn) {
            try {
              const videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
              });
              localStreamRef.current = videoStream;
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = videoStream;
              }
            } catch (error) {
              console.error('Error maintaining video stream:', error);
            }
          } else {
            localStreamRef.current = null;
          }
        }
        setIsAudioOn(false);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      alert('Unable to access microphone. Please check permissions and try again.');
    }
  };

  const startScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = screenStream;
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        };
        
        setIsScreenSharing(true);
      } else {
        if (remoteVideoRef.current?.srcObject) {
          const stream = remoteVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          remoteVideoRef.current.srcObject = null;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
      alert('Unable to start screen sharing. Please check permissions.');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !guestInfo || !roomId) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: `guest-${guestInfo.name}`,
      userName: guestInfo.name,
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
      isGuest: true,
    };

    // Use the same chat message event as authenticated users
    socketService.sendChatMessage(roomId, message);
    
    setMessages(prev => [...prev, message]);
    setMessageInput('');
  };

  const leaveMeeting = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Leave the room using the same method as authenticated users
    if (roomId && guestUserId) {
      socketService.leaveRoom(roomId, guestUserId);
      
      // Emit guest left event
      socketService.emit('guest-left', {
        meetingId: roomId,
        guestInfo: {
          ...guestInfo,
          tempId: guestUserId
        }
      });
    }
    
    sessionStorage.removeItem('guestInfo');
    navigate('/');
  };

  if (!guestInfo) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <p className="card-description-white">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <nav className="navbar" style={{ background: 'linear-gradient(135deg, #2d2d2d, #404040)' }}>
        <div className="nav-container">
          <div>
            <h2 className="card-title-white" style={{ margin: 0, fontSize: '18px' }}>
              {meetingInfo?.title || 'Video Conference'}
            </h2>
            <p className="card-description-white" style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
              Joined as: {guestInfo.name} (Guest) • {participants.length} participants
            </p>
          </div>
          <div className="nav-links">
            <button onClick={leaveMeeting} className="btn btn-danger btn-small">
              Leave Meeting
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Video Area */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#000' }}>
          {/* Remote/Screen Share Video (Large) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000',
            }}
          />
          
          {!isScreenSharing && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '96px',
                height: '96px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                👥
              </div>
              <p>Waiting for other participants...</p>
            </div>
          )}

          {/* Local Video (Small overlay) */}
          {isVideoOn && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '200px',
              height: '150px',
              backgroundColor: '#2d2d2d',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #404040',
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Controls */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '12px 24px',
            borderRadius: '24px',
          }}>
            {mediaPermissionDenied && (
              <button
                onClick={requestMediaPermissions}
                className="btn btn-primary btn-small"
                style={{ marginRight: '8px' }}
              >
                📹 Enable Camera & Mic
              </button>
            )}
            
            <button
              onClick={toggleAudio}
              className={`btn ${isAudioOn ? 'btn-success' : 'btn-danger'}`}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                fontSize: '18px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isAudioOn ? '🎤' : '🔇'}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`btn ${isVideoOn ? 'btn-success' : 'btn-danger'}`}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                fontSize: '18px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isVideoOn ? '📹' : '📷'}
            </button>
            
            <button
              onClick={startScreenShare}
              className={`btn ${isScreenSharing ? 'btn-warning' : 'btn-secondary'}`}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                fontSize: '18px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              🖥️
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: '#2d2d2d',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #404040',
        }}>
          {/* Participants */}
          <div style={{ padding: '16px', borderBottom: '1px solid #404040' }}>
            <h3 className="card-title-white" style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
              Participants ({participants.length + 1})
            </h3>
            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
              <div className="card-glass" style={{
                padding: '8px',
                marginBottom: '4px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))'
              }}>
                <span className="card-description-white" style={{ fontSize: '14px' }}>
                  {guestInfo.name} (You) 
                  <span style={{ color: '#a0a0a0', fontSize: '12px' }}> • Guest</span>
                </span>
              </div>
              {participants.map((participant) => (
                <div key={participant.id || participant.tempId || participant.name} className="card-glass" style={{
                  padding: '8px',
                  marginBottom: '4px',
                }}>
                  <span className="card-description-white" style={{ fontSize: '14px' }}>
                    {participant.name}
                    {participant.isGuest && (
                      <span style={{ color: '#a0a0a0', fontSize: '12px' }}> • Guest</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 16px 8px 16px' }}>
              <h3 className="card-title-white" style={{ margin: 0, fontSize: '16px' }}>Chat</h3>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 16px',
              maxHeight: 'calc(100vh - 400px)',
            }}>
              {messages.map((message) => (
                <div key={message.id} className="card-glass" style={{ 
                  marginBottom: '12px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#a0a0a0', fontSize: '12px', fontWeight: '600' }}>
                      {message.userName || message.sender}
                      {message.isGuest && <span style={{ color: '#6b7280' }}> (Guest)</span>}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="card-description-white" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    {message.message || message.text}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={sendMessage} style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="form-input-glass"
                  style={{ flex: 1, fontSize: '14px' }}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`btn ${messageInput.trim() ? 'btn-primary' : 'btn-secondary'} btn-small`}
                  style={{
                    cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}