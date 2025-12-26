import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all experiments for a team
router.get('/team/:teamId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { teamId } = req.params;
    
    const experiments = await prisma.experiment.findMany({
      where: { teamId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
        },
        tags: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

// Get single experiment
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        tags: true,
        experimentPapers: {
          include: { paper: true },
        },
        codeVersions: { orderBy: { createdAt: 'desc' } },
      },
    });
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
});

// Create experiment
router.post('/new', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, hypothesis, method, teamId, tags } = req.body;
    
    const experiment = await prisma.experiment.create({
      data: {
        title,
        hypothesis,
        method,
        authorId: req.userId!,
        teamId,
        tags: tags ? {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
      },
    });
    
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create experiment' });
  }
});

// Update experiment
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, hypothesis, method, observations, results, failures, nextSteps, status } = req.body;
    
    const experiment = await prisma.experiment.update({
      where: { id },
      data: {
        title,
        hypothesis,
        method,
        observations,
        results,
        failures,
        nextSteps,
        status,
      },
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
      },
    });
    
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experiment' });
  }
});

// Delete experiment
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    await prisma.experiment.delete({ where: { id } });
    
    res.json({ message: 'Experiment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experiment' });
  }
});

export default router;
