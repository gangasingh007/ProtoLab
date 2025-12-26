'use client';

import { useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { usePresenceStore } from '@/lib/store';
import { PresenceData } from '@/types';

export const useSocket = (experimentId?: string) => {
  const socket = getSocket();
  const { updateUserPresence, removeUserPresence, setPresence } = usePresenceStore();

  useEffect(() => {
    if (!socket || !experimentId) return;

    // Join experiment room
    socket.emit('join-experiment', experimentId);

    // Listen for presence updates
    socket.on('active-users', (data: { users: string[]; experimentId: string }) => {
      console.log('Active users:', data);
    });

    socket.on('user-joined', (data: { userId: string; userName: string }) => {
      console.log('User joined:', data);
    });

    socket.on('user-left', (data: { userId: string }) => {
      removeUserPresence(data.userId);
    });

    socket.on('presence-update', (data: { userId: string; presence: PresenceData }) => {
      updateUserPresence(data.userId, data.presence);
    });

    socket.on('experiment-changed', (data: any) => {
      console.log('Experiment changed:', data);
    });

    socket.on('comment-added', (data: any) => {
      console.log('Comment added:', data);
    });

    socket.on('user-typing', (data: { userId: string; userName: string }) => {
      console.log('User typing:', data);
    });

    return () => {
      socket.emit('leave-experiment', experimentId);
      socket.off('active-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('presence-update');
      socket.off('experiment-changed');
      socket.off('comment-added');
      socket.off('user-typing');
    };
  }, [socket, experimentId, updateUserPresence, removeUserPresence]);

  const emitExperimentUpdate = useCallback(
    (changes: any) => {
      if (socket && experimentId) {
        socket.emit('experiment-update', { experimentId, changes });
      }
    },
    [socket, experimentId]
  );

  const emitCursorMove = useCallback(
    (position: any) => {
      if (socket && experimentId) {
        socket.emit('cursor-move', { experimentId, position });
      }
    },
    [socket, experimentId]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (socket && experimentId) {
        socket.emit(isTyping ? 'typing-start' : 'typing-stop', { experimentId });
      }
    },
    [socket, experimentId]
  );

  return {
    socket,
    emitExperimentUpdate,
    emitCursorMove,
    emitTyping,
  };
};
