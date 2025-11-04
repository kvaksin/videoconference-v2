import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import { socketService } from '../services/socket.service';
import type { Meeting, ChatMessage } from '../types';

export default function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [displayName, setDisplayName] = useState(user?.name || 'User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!id) return;

    loadMeeting();
    setupMedia();
    socketService.connect();

    return () => {
      cleanup();
    };
  }, [id]);

  const loadMeeting = async () => {
    try {
      const data = await apiService.getMeeting(id!);
      setMeeting(data);

      if (data.status === 'scheduled') {
        await apiService.startMeeting(id!);
        const updated = await apiService.getMeeting(id!);
        setMeeting(updated);
      }

      if (data.roomId && user) {
        socketService.joinRoom(data.roomId, user.id);
        setupSocketListeners(data.roomId);
      }
    } catch (error) {
      console.error('Failed to load meeting:', error);
    }
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to get media:', error);
    }
  };

  const setupSocketListeners = (_roomId: string) => {
    socketService.on('user-joined', handleUserJoined);
    // WebRTC signaling - server sends (data, senderSocketId)
    socketService.on('offer', (offer: RTCSessionDescriptionInit, senderSocketId: string) => {
      handleOffer(offer, senderSocketId);
    });
    socketService.on('answer', (answer: RTCSessionDescriptionInit, senderSocketId: string) => {
      handleAnswer(answer, senderSocketId);
    });
    socketService.on('ice-candidate', (candidate: RTCIceCandidateInit, senderSocketId: string) => {
      handleIceCandidate(candidate, senderSocketId);
    });
    socketService.on('chat-message', handleChatMessage);
    socketService.on('name-changed', handleNameChanged);
    
    // Listen for participant updates
    socketService.on('participants-updated', (participantList: any[]) => {
      setParticipants(participantList);
      console.log('Participants updated:', participantList);
    });
    
    // Listen for guest events
    socketService.on('guest-joined', (guestData: any) => {
      console.log('Guest joined the meeting:', guestData);
    });
    
    socketService.on('guest-left', (guestData: any) => {
      console.log('Guest left the meeting:', guestData);
    });
  };

  const handleNameChanged = (data: { userId: string; newName: string }) => {
    // Update display names for remote participants
    // This would be used to update participant list if we had one
    console.log(`User ${data.userId} changed name to ${data.newName}`);
  };

  const startEditingName = () => {
    setTempName(displayName);
    setIsEditingName(true);
  };

  const saveNameChange = () => {
    if (tempName.trim() && tempName !== displayName) {
      setDisplayName(tempName.trim());
      // Notify other participants
      if (meeting?.roomId && user) {
        socketService.getSocket()?.emit('name-change', meeting.roomId, {
          userId: user.id,
          newName: tempName.trim()
        });
      }
    }
    setIsEditingName(false);
  };

  const cancelNameEdit = () => {
    setTempName('');
    setIsEditingName(false);
  };

  const handleUserJoined = async (userId: string) => {
    console.log('User joined:', userId);
    if (localStream) {
      await createOffer(userId);
    }
  };

  const createOffer = async (remoteSocketId?: string) => {
    if (!meeting?.roomId) return;

    console.log('Creating offer for remote peer:', remoteSocketId);

    // Close existing connection if any
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
    });

    // Add local tracks to peer connection
    localStream?.getTracks().forEach((track) => {
      console.log('Adding local track to peer connection:', track.kind);
      peerConnection.current?.addTrack(track, localStream);
    });

    // Handle incoming remote tracks
    peerConnection.current.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('Set remote video stream');
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && meeting.roomId) {
        console.log('Sending ICE candidate');
        socketService.getSocket()?.emit('ice-candidate', meeting.roomId, event.candidate.toJSON(), remoteSocketId);
      }
    };

    // Log connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.current?.connectionState);
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.current?.iceConnectionState);
    };

    // Create and send offer
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    console.log('Sending offer');
    socketService.getSocket()?.emit('offer', meeting.roomId, offer, remoteSocketId);
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, senderSocketId: string) => {
    if (!meeting?.roomId) return;

    console.log('Received offer from:', senderSocketId);

    // Close existing connection if any
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
    });

    // Add local tracks
    localStream?.getTracks().forEach((track) => {
      console.log('Adding local track to peer connection:', track.kind);
      peerConnection.current?.addTrack(track, localStream);
    });

    // Handle incoming remote tracks
    peerConnection.current.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('Set remote video stream');
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && meeting.roomId) {
        console.log('Sending ICE candidate');
        socketService.getSocket()?.emit('ice-candidate', meeting.roomId, event.candidate.toJSON(), senderSocketId);
      }
    };

    // Log connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.current?.connectionState);
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.current?.iceConnectionState);
    };

    // Set remote description and create answer
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    console.log('Sending answer to:', senderSocketId);
    socketService.getSocket()?.emit('answer', meeting.roomId, answer, senderSocketId);
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, senderSocketId: string) => {
    console.log('Received answer from:', senderSocketId);
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Set remote description from answer');
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, senderSocketId: string) => {
    console.log('Received ICE candidate from:', senderSocketId);
    if (peerConnection.current) {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Added ICE candidate');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleChatMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !meeting?.roomId || !user) return;

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: displayName, // Use the editable display name
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    socketService.sendChatMessage(meeting.roomId, message);
    setNewMessage('');
  };

  const handleEndMeeting = async () => {
    if (meeting) {
      await apiService.endMeeting(meeting.id);
      cleanup();
      navigate('/dashboard');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing and switch back to camera
        await setupMedia();
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        // Replace video track in peer connection
        if (peerConnection.current && localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnection.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }

        setLocalStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        // Handle screen share end (when user clicks "Stop sharing" in browser)
        screenStream.getVideoTracks()[0].onended = async () => {
          await setupMedia();
          setIsScreenSharing(false);
        };
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const copyMeetingLink = () => {
    const meetingUrl = `${window.location.origin}/meeting/${meeting?.id}`;
    navigator.clipboard.writeText(meetingUrl).then(() => {
      alert('Meeting link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy meeting link');
    });
  };

  const copyGuestLink = () => {
    const guestUrl = `${window.location.origin}/guest/join/${meeting?.id}`;
    navigator.clipboard.writeText(guestUrl).then(() => {
      alert('Guest link copied to clipboard! Anyone with this link can join without an account.');
    }).catch(() => {
      alert('Failed to copy guest link');
    });
  };

  const cleanup = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    peerConnection.current?.close();
    if (meeting?.roomId && user) {
      socketService.leaveRoom(meeting.roomId, user.id);
    }
    socketService.disconnect();
  };

  if (!meeting) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card-glass text-center" style={{ marginTop: '4rem' }}>
            <p className="card-description-white">Loading meeting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <nav className="navbar">
        <div className="nav-container">
          <div>
            <h2 className="card-title" style={{ margin: 0, marginBottom: '5px', color: '#333' }}>{meeting.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <span className={`status-badge ${
                meeting.status === 'active' ? 'status-active' : 
                meeting.status === 'scheduled' ? 'status-scheduled' : 
                'status-ended'
              }`}>
                {meeting.status === 'active' ? '🟢 LIVE' : 
                 meeting.status === 'scheduled' ? '🟡 SCHEDULED' : 
                 '🔴 ENDED'}
              </span>
              <span className="status-badge" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                👥 {participants.length + 1} {participants.length + 1 === 1 ? 'participant' : 'participants'}
              </span>
              <span style={{ color: '#555', fontWeight: '500' }}>You are:</span>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveNameChange()}
                    onKeyDown={(e) => e.key === 'Escape' && cancelNameEdit()}
                    className="form-input"
                    style={{ fontSize: '14px', minWidth: '120px', padding: '4px 8px' }}
                    autoFocus
                  />
                  <button 
                    onClick={saveNameChange}
                    className="btn btn-success btn-small"
                  >
                    ✓
                  </button>
                  <button 
                    onClick={cancelNameEdit}
                    className="btn btn-secondary btn-small"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditingName}
                  className="btn btn-secondary btn-small"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Click to edit your display name"
                >
                  <span>{displayName}</span>
                  <span style={{ fontSize: '12px' }}>✏️</span>
                </button>
              )}
            </div>
          </div>
          <div className="nav-links">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary btn-small"
            >
              ← Dashboard
            </button>
            <button 
              onClick={copyMeetingLink}
              className="btn btn-primary btn-small"
            >
              📋 Copy Link
            </button>
            <button 
              onClick={copyGuestLink}
              className="btn btn-success btn-small"
              title="Share this link with guests who don't have accounts"
            >
              👥 Guest Link
            </button>
            <button 
              onClick={handleEndMeeting} 
              className="btn btn-danger btn-small"
            >
              End Meeting
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Video Area */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Main Video (Remote or Screen Share) */}
          <div style={{ 
            flex: 1, 
            backgroundColor: '#000', 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                backgroundColor: '#000'
              }}
            />
            {/* No Remote Video Placeholder */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textAlign: 'center',
              fontSize: '18px',
              zIndex: 1
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
              <div>Waiting for other participants...</div>
            </div>

            {/* Local Video Overlay (Picture-in-Picture) */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '200px',
              height: '150px',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              zIndex: 10
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
              {/* Video disabled indicator */}
              {!isVideoEnabled && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px'
                }}>
                  📹
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div style={{
            height: '80px',
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '0 20px'
          }}>
            <button
              onClick={toggleAudio}
              className={`btn ${isAudioEnabled ? 'btn-success' : 'btn-danger'}`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? '🎤' : '🔇'}
            </button>

            <button
              onClick={toggleVideo}
              className={`btn ${isVideoEnabled ? 'btn-success' : 'btn-danger'}`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? '📹' : '📵'}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`btn ${isScreenSharing ? 'btn-warning' : 'btn-secondary'}`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {isScreenSharing ? '🛑' : '🖥️'}
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          borderLeft: '1px solid #ddd',
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <div style={{ 
            padding: '15px', 
            borderBottom: '1px solid #ddd',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            💬 Meeting Chat
          </div>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '15px',
            backgroundColor: '#f8f9fa'
          }}>
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                marginTop: '20px'
              }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="card" style={{ 
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: msg.userId === user?.id ? '#e3f2fd' : '#fff',
                  borderLeft: `4px solid ${msg.userId === user?.id ? '#2196f3' : '#ccc'}`
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginBottom: '5px',
                    fontWeight: 'bold'
                  }}>
                    {msg.userName} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4', color: '#333' }}>
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendMessage} style={{ 
            padding: '15px', 
            borderTop: '1px solid #ddd',
            backgroundColor: '#fff'
          }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="form-input mb-2"
              style={{ fontSize: '14px' }}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className={`btn ${newMessage.trim() ? 'btn-primary' : 'btn-secondary'} btn-small`}
              style={{ 
                width: '100%',
                cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
