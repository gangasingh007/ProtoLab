import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all papers for a team
router.get('/team/:teamId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { teamId } = req.params;
    
    const papers = await prisma.paper.findMany({
      where: { teamId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        experimentPapers: {
          include: {
            experiment: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
    
    res.json(papers);
  } catch (error) {
    console.error('Fetch papers error:', error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// Get single paper
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        experimentPapers: {
          include: {
            experiment: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
    });
    
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    res.json(paper);
  } catch (error) {
    console.error('Fetch paper error:', error);
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// Create paper
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { 
      title, 
      authors, 
      url, 
      pdfUrl, 
      summary, 
      findings, 
      methodology, 
      limitations, 
      teamId 
    } = req.body;
    
    if (!title || !teamId) {
      return res.status(400).json({ error: 'Title and teamId are required' });
    }
    
    const paper = await prisma.paper.create({
      data: {
        title,
        authors,
        url,
        pdfUrl,
        summary,
        findings,
        methodology,
        limitations,
        uploadedById: req.userId!,
        teamId,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    // Broadcast to team via Socket.io
    const io = req.app.get('io');
    io.to(`team:${teamId}`).emit('paper-added', { paper });
    
    res.json(paper);
  } catch (error) {
    console.error('Create paper error:', error);
    res.status(500).json({ error: 'Failed to create paper' });
  }
});

// Update paper
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      authors, 
      url, 
      pdfUrl, 
      summary, 
      findings, 
      methodology, 
      limitations 
    } = req.body;
    
    // Check if paper exists and user has permission
    const existingPaper = await prisma.paper.findUnique({
      where: { id },
      select: { uploadedById: true, teamId: true },
    });
    
    if (!existingPaper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    const paper = await prisma.paper.update({
      where: { id },
      data: {
        title,
        authors,
        url,
        pdfUrl,
        summary,
        findings,
        methodology,
        limitations,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    // Broadcast update via Socket.io
    const io = req.app.get('io');
    io.to(`team:${existingPaper.teamId}`).emit('paper-updated', { paper });
    
    res.json(paper);
  } catch (error) {
    console.error('Update paper error:', error);
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

// Delete paper
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if paper exists
    const existingPaper = await prisma.paper.findUnique({
      where: { id },
      select: { uploadedById: true, teamId: true },
    });
    
    if (!existingPaper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    
    // Only uploader or admin can delete
    if (existingPaper.uploadedById !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this paper' });
    }
    
    await prisma.paper.delete({ where: { id } });
    
    // Broadcast deletion via Socket.io
    const io = req.app.get('io');
    io.to(`team:${existingPaper.teamId}`).emit('paper-deleted', { paperId: id });
    
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

// Link paper to experiment
router.post('/:paperId/link-experiment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { paperId } = req.params;
    const { experimentId } = req.body;
    
    if (!experimentId) {
      return res.status(400).json({ error: 'experimentId is required' });
    }
    
    // Check if link already exists
    const existingLink = await prisma.experimentPaper.findUnique({
      where: {
        experimentId_paperId: {
          experimentId,
          // @ts-ignore
          paperId,
        },
      },
    });
    
    if (existingLink) {
      return res.status(400).json({ error: 'Link already exists' });
    }
    
    const link = await prisma.experimentPaper.create({
        // @ts-ignore
        data: {
        experimentId,
        paperId,
      },
      include: {
        paper: true,
        experiment: {
          select: { id: true, title: true },
        },
      },
    });
    
    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.to(`experiment:${experimentId}`).emit('paper-linked', { link });
    
    res.json(link);
  } catch (error) {
    console.error('Link paper error:', error);
    res.status(500).json({ error: 'Failed to link paper to experiment' });
  }
});

// Unlink paper from experiment
router.delete('/:paperId/unlink-experiment/:experimentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { paperId, experimentId } = req.params;
    
    await prisma.experimentPaper.delete({
      where: {
        experimentId_paperId: {
            // @ts-ignore
          experimentId,paperId,
        },
      },
    });
    
    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.to(`experiment:${experimentId}`).emit('paper-unlinked', { paperId, experimentId });
    
    res.json({ message: 'Paper unlinked successfully' });
  } catch (error) {
    console.error('Unlink paper error:', error);
    res.status(500).json({ error: 'Failed to unlink paper' });
  }
});

// Search papers in team
router.get('/team/:teamId/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { teamId } = req.params;
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const papers = await prisma.paper.findMany({
      where: {
        teamId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { authors: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { findings: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
      take: 20,
    });
    
    res.json(papers);
  } catch (error) {
    console.error('Search papers error:', error);
    res.status(500).json({ error: 'Failed to search papers' });
  }
});

export default router;
