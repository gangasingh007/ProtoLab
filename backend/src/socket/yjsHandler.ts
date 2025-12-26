import { Server } from 'socket.io';
import * as Y from 'yjs';
import { PrismaClient } from '@prisma/client';
import redis from '../config/redis';

const prisma = new PrismaClient();

const experiments = new Map<string, Y.Doc>();

export const setupYjs = (io: Server) => {
  io.on('connection', (socket) => {
    
    socket.on('yjs-sync-step1', async ({ experimentId, stateVector }) => {
      try {
        let doc = experiments.get(experimentId);
        
        if (!doc) {
          doc = new Y.Doc();
            const experiment = await prisma.experiment.findUnique({
            where: { id: experimentId },
          });
          
          if (experiment) {
            const yText = doc.getText('content');
            yText.insert(0, experiment.observations || '');
          }
          
          experiments.set(experimentId, doc);
        }
        
        // Send state vector back
        const update = Y.encodeStateAsUpdate(doc, new Uint8Array(stateVector));
        socket.emit('yjs-sync-step2', { experimentId, update: Array.from(update) });
        
      } catch (error) {
        console.error('Yjs sync error:', error);
      }
    });

    socket.on('yjs-update', async ({ experimentId, update }) => {
      try {
        const doc = experiments.get(experimentId);
        if (!doc) return;
        
        // Apply update to Y.Doc
        Y.applyUpdate(doc, new Uint8Array(update));
        socket.to(`experiment:${experimentId}`).emit('yjs-update', {
          experimentId,
          update,
        });
        
        // Debounced save to database (every 2 seconds)
        const lastSave = await redis.get(`experiment:${experimentId}:last-save`);
        const now = Date.now();
        
        if (!lastSave || now - parseInt(lastSave) > 2000) {
          const yText = doc.getText('content');
          const content = yText.toString();
          
          await prisma.experiment.update({
            where: { id: experimentId },
            data: { observations: content },
          });
          
          await redis.set(`experiment:${experimentId}:last-save`, now.toString());
        }
        
      } catch (error) {
        console.error('Yjs update error:', error);
      }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
  });
};
