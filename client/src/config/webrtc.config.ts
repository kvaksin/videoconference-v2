/**
 * WebRTC Configuration for NAT Traversal
 * 
 * Includes STUN servers for discovering public IP addresses
 * and TURN servers for relaying media when direct connection fails
 */

export const webrtcConfig: RTCConfiguration = {
  iceServers: [
    // Google's public STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    
    // Additional public STUN servers for better connectivity
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    
    // Open Relay Project's free TURN servers for NAT traversal
    // These relay media when direct P2P connection isn't possible
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  
  // Pre-gather ICE candidates to speed up connection establishment
  iceCandidatePoolSize: 10,
  
  // Use both UDP and TCP for better connectivity through firewalls
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
};

/**
 * For production, you may want to use your own TURN servers
 * Services like Twilio, Xirsys, or self-hosted coturn are recommended
 * 
 * Example with environment variables:
 * 
 * const TURN_SERVER = import.meta.env.VITE_TURN_SERVER;
 * const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME;
 * const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL;
 * 
 * if (TURN_SERVER && TURN_USERNAME && TURN_CREDENTIAL) {
 *   webrtcConfig.iceServers.push({
 *     urls: TURN_SERVER,
 *     username: TURN_USERNAME,
 *     credential: TURN_CREDENTIAL
 *   });
 * }
 */
