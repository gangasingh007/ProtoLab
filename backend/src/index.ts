import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import experimentRoutes from './routes/experiment';
// import paperRoutes from './routes/papers';
// import commentRoutes from './routes/comments';
// import teamRoutes from './routes/teams';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
