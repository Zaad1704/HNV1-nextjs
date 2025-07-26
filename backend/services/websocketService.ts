import { Server as SocketIOServer, Socket    } from 'socket.io';
import { Server as HTTPServer    } from 'http';
import jwt from 'jsonwebtoken';
interface AuthenticatedSocket extends Socket { userId?: string;
  organizationId?: string;
class WebSocketService { };
  private io: SocketIOServer | null: null,;
  initialize(server: HTTPServer) { this.io: new SocketIOServer(server, {
cors: { origin: process.env.FRONTEND_URL || 'http:// localhost:3000',;
        credentials: true
}
    });
    this.io.use((socket: AuthenticatedSocket, next) => { const token: socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      try {
const decoded: jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId: decoded.id;
        socket.organizationId: decoded.organizationId;
        next()
} catch(error) {
next(new Error('Authentication error'))
});
    this.io.on('connection', (socket: AuthenticatedSocket) => {
socket.join(`org_${socket.organizationId
}``;`
      socket.join(`user_${socket.userId}``;`
      this.io.to(`org_${orgId}``;`
      this.io.to(`user_${userId}```