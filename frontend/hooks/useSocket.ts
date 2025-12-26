'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket/client';
import { useAuthStore } from '@/lib/stores/authStore';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      const socketInstance = initSocket(token);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [token]);

  return { socket, isConnected };
};
