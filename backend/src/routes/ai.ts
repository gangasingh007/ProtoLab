import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import pdfParse from 'pdf-parse';
import { AIService } from '../services/aiServices';

const router = Router();
const prisma = new PrismaClient();

// Summarize paper
router.post('/papers/:id/summarize', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const paper = await prisma.paper.findUnique({
      where: { id },
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    // Check if already summarized
    if (paper.summary) {
      return res.json({
        summary: paper.summary,
        findings: paper.findings,
        methodology: paper.methodology,
        limitations: paper.limitations,
        cached: true,
      });
    }

    // Generate summary
    const result = await AIService.summarizePaper({
      title: paper.title,
      content: paper.url || '', // In real app, fetch PDF content
    });

    // Update paper with summary
    const updatedPaper = await prisma.paper.update({
      where: { id },
      data: result,
    });

    res.json({ ...result, cached: false });
  } catch (error) {
    console.error('Summarize paper error:', error);
    res.status(500).json({ error: 'Failed to summarize paper' });
  }
});

// Generate team insights
router.get('/teams/:teamId/insights', authenticate, async (req: AuthRequest, res) => {
  try {
    const { teamId } = req.params;

    // Verify user is member
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          // @ts-ignore
          teamId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }

    // Get all experiments
    const experiments = await prisma.experiment.findMany({
      where: { teamId },
      include: {
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    if (experiments.length === 0) {
      return res.json({
        insights: ['No experiments yet'],
        recommendations: ['Create your first experiment to get started'],
        patterns: [],
      });
    }

    // Generate insights
    const result = await AIService.generateInsights({
      experiments,
    });

    res.json(result);
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Suggest next experiment steps
router.post('/experiments/:id/suggest', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: {
        experimentPapers: {
          include: {
            paper: true,
          },
        },
      },
    });

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    const suggestion = await AIService.suggestNextExperiment({
      currentExperiment: experiment,
      relatedPapers: experiment.experimentPapers.map((ep) => ep.paper),
    });

    res.json({ suggestion });
  } catch (error) {
    console.error('Generate suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

// Extract key info from experiment
router.post('/experiments/:id/extract', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const experiment = await prisma.experiment.findUnique({
      where: { id },
    });

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    const experimentText = `
Title: ${experiment.title}
Hypothesis: ${experiment.hypothesis || ''}
Method: ${experiment.method || ''}
Observations: ${experiment.observations || ''}
Results: ${experiment.results || ''}
`;

    const result = await AIService.extractKeyInfo(experimentText);

    res.json(result);
  } catch (error) {
    console.error('Extract key info error:', error);
    res.status(500).json({ error: 'Failed to extract information' });
  }
});

// Quick paper summary from text
router.post('/papers/quick-summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const result = await AIService.summarizePaper({ title, content });

    res.json(result);
  } catch (error) {
    console.error('Quick summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
