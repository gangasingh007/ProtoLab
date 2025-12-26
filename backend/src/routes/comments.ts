import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all comments for an experiment
router.get('/experiment/:experimentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { experimentId } = req.params;
    
    const comments = await prisma.comment.findMany({
      where: { experimentId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get single comment
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        experiment: {
          select: { id: true, title: true },
        },
      },
    });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Fetch comment error:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

// Create comment with real-time broadcast
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, experimentId, mentions } = req.body;
    
    if (!content || !experimentId) {
      return res.status(400).json({ error: 'Content and experimentId are required' });
    }
    
    // Verify experiment exists
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      select: { id: true, teamId: true },
    });
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        experimentId,
        authorId: req.userId!,
        mentions: mentions || [],
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.to(`experiment:${experimentId}`).emit('comment-added', { 
      comment,
      experimentId,
    });
    
    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      mentions.forEach((userId: string) => {
        io.to(`user:${userId}`).emit('mentioned', {
          comment,
          experimentId,
          experimentTitle: experiment.id,
        });
      });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content, mentions } = req.body;
    
    // Check if comment exists and user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, experimentId: true },
    });
    
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (existingComment.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }
    
    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content,
        mentions: mentions || [],
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    // Broadcast update via Socket.io
    const io = req.app.get('io');
    io.to(`experiment:${existingComment.experimentId}`).emit('comment-updated', { 
      comment,
      experimentId: existingComment.experimentId,
    });
    
    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists and user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, experimentId: true },
    });
    
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (existingComment.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    await prisma.comment.delete({ where: { id } });
    
    // Broadcast deletion via Socket.io
    const io = req.app.get('io');
    io.to(`experiment:${existingComment.experimentId}`).emit('comment-deleted', { 
      commentId: id,
      experimentId: existingComment.experimentId,
    });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Get comments mentioning current user
router.get('/mentions/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        mentions: {
          has: req.userId,
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        experiment: {
          select: { id: true, title: true, teamId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Fetch mentions error:', error);
    res.status(500).json({ error: 'Failed to fetch mentions' });
  }
});

// React to comment (future enhancement - likes/reactions)
router.post('/:id/react', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body; // e.g., "like", "thumbsup", "fire"
    
    // This would require a Reaction model in your schema
    // For now, just acknowledge the request
    
    res.json({ message: 'Reaction feature coming soon', commentId: id, reaction });
  } catch (error) {
    console.error('React to comment error:', error);
    res.status(500).json({ error: 'Failed to react to comment' });
  }
});

export default router;
