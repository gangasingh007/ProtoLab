import { Server, Socket } from 'socket.io';
import redis from '../config/redis';

interface PresenceData {
  userId: string;
  userName: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: number;
}

const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export const setupPresence = (io: Server) => {
  
  io.on('connection', (socket: any) => {
    
    socket.on('update-presence', async (data: {
      experimentId: string;
      cursorPosition?: any;
      selection?: any;
    }) => {
      try {
        const presenceKey = `presence:${data.experimentId}`;
        
        // Assign color if not exists
        let userColor = await redis.hget(`user:${socket.userId}:color`, 'color');
        if (!userColor) {
          const colorIndex = Math.floor(Math.random() * userColors.length);
          //@ts-ignore
          userColor  = userColors[colorIndex];
          //@ts-ignore
          await redis.hset(`user:${socket.userId}:color`, 'color', userColor);
        }
        
        const presenceData: PresenceData = {
          userId: socket.userId,
          userName: socket.userName,
          // @ts-ignore
          color: userColor,
          cursorPosition: data.cursorPosition,
          selection: data.selection,
          lastActive: Date.now(),
        };
        
        // Store presence in Redis (expires in 30 seconds)
        await redis.hset(presenceKey, socket.userId, JSON.stringify(presenceData));
        await redis.expire(presenceKey, 30);
        
        // Broadcast to others in the room
        socket.to(`experiment:${data.experimentId}`).emit('presence-update', {
          userId: socket.userId,
          presence: presenceData,
        });
        
      } catch (error) {
        console.error('Presence update error:', error);
      }
    });

    // Get all presence data for an experiment
    socket.on('get-presence', async (experimentId: string) => {
      try {
        const presenceKey = `presence:${experimentId}`;
        const presenceData = await redis.hgetall(presenceKey);
        
        const presenceList = Object.entries(presenceData).map(([userId, data]) => {
          return JSON.parse(data);
        });
        
        socket.emit('presence-data', { experimentId, presence: presenceList });
        
      } catch (error) {
        console.error('Get presence error:', error);
      }
    });
  });
};
