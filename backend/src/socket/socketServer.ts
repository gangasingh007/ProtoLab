import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import redis from '../config/redis';

interface AuthSocket extends Socket {
  userId?: string;
  userName?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; name: string };
      socket.userId = decoded.userId;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userName} (${socket.userId})`);

    // Join experiment room
    socket.on('join-experiment', async (experimentId: string) => {
      socket.join(`experiment:${experimentId}`);
      
      // Track active users in Redis
      await redis.sadd(`experiment:${experimentId}:users`, socket.userId!);
      
      // Get all active users
      const activeUsers = await redis.smembers(`experiment:${experimentId}:users`);
      
      // Notify others
      socket.to(`experiment:${experimentId}`).emit('user-joined', {
        userId: socket.userId,
        userName: socket.userName,
      });
      
      // Send current active users to the new joiner
      socket.emit('active-users', { users: activeUsers, experimentId });
      
      console.log(`${socket.userName} joined experiment: ${experimentId}`);
    });

    // Leave experiment room
    socket.on('leave-experiment', async (experimentId: string) => {
      socket.leave(`experiment:${experimentId}`);
      await redis.srem(`experiment:${experimentId}:users`, socket.userId!);
      
      socket.to(`experiment:${experimentId}`).emit('user-left', {
        userId: socket.userId,
      });
    });

    // Real-time experiment updates
    socket.on('experiment-update', (data: { experimentId: string; changes: any }) => {
      socket.to(`experiment:${data.experimentId}`).emit('experiment-changed', {
        userId: socket.userId,
        userName: socket.userName,
        changes: data.changes,
        timestamp: Date.now(),
      });
    });

    // Live cursor position
    socket.on('cursor-move', (data: { experimentId: string; position: any }) => {
      socket.to(`experiment:${data.experimentId}`).emit('cursor-update', {
        userId: socket.userId,
        userName: socket.userName,
        position: data.position,
      });
    });

    // Real-time comments
    socket.on('new-comment', (data: { experimentId: string; comment: any }) => {
      io.to(`experiment:${data.experimentId}`).emit('comment-added', {
        comment: data.comment,
        author: {
          id: socket.userId,
          name: socket.userName,
        },
      });
    });

    // Typing indicator
    socket.on('typing-start', (data: { experimentId: string }) => {
      socket.to(`experiment:${data.experimentId}`).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('typing-stop', (data: { experimentId: string }) => {
      socket.to(`experiment:${data.experimentId}`).emit('user-stopped-typing', {
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      // Remove user from all experiment rooms
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room.startsWith('experiment:')) {
          await redis.srem(room + ':users', socket.userId!);
          socket.to(room).emit('user-left', { userId: socket.userId });
        }
      }
      
      console.log(` User disconnected: ${socket.userName}`);
    });
  });

  return io;
};
