import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupYjs } from './socket/yjsHandler';
import { initializeSocket } from './socket/socketServer';
import authRoutes from './routes/auth';
import experimentRoutes from './routes/experiment';
import { setupPresence } from './socket/presence';
// import paperRoutes from './routes/papers';
// import commentRoutes from './routes/comments';
// import teamRoutes from './routes/teams';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
const io = initializeSocket(httpServer);
setupYjs(io);
setupPresence(io);
// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);
// app.use('/api/papers', paperRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/teams', teamRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});
