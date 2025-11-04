import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (!this.socket) {
      this.socket = io({
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit('join-room', roomId, userId);
    }
  }

  leaveRoom(roomId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit('leave-room', roomId, userId);
    }
  }

  sendOffer(roomId: string, offer: RTCSessionDescriptionInit): void {
    if (this.socket) {
      this.socket.emit('offer', roomId, offer);
    }
  }

  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit): void {
    if (this.socket) {
      this.socket.emit('answer', roomId, answer);
    }
  }

  sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit): void {
    if (this.socket) {
      this.socket.emit('ice-candidate', roomId, candidate);
    }
  }

  sendChatMessage(roomId: string, message: any): void {
    if (this.socket) {
      this.socket.emit('chat-message', roomId, message);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
