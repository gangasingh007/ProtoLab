import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface GraphNode {
  id: string;
  label: string;
  type: 'experiment' | 'paper' | 'method' | 'metric' | 'user';
  size?: number;
  color?: string;
  data?: any;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  label?: string;
}

// Get knowledge graph for a team
router.get('/teams/:teamId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { teamId } = req.params;
    const stringTeamid= String(teamId);

    // Verify membership
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          teamId: stringTeamid,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }

    // Fetch all relevant data
    const [experiments, papers, users] = await Promise.all([
      prisma.experiment.findMany({
        where: { teamId },
        include: {
          author: { select: { id: true, name: true } },
          tags: true,
          experimentPapers: {
            include: { paper: true },
          },
        },
      }),
      prisma.paper.findMany({
        where: { teamId },
        include: {
          uploadedBy: { select: { id: true, name: true } },
          experimentPapers: {
            include: { experiment: true },
          },
        },
      }),
      prisma.teamMember.findMany({
        where: { teamId },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Add experiment nodes
    experiments.forEach((exp) => {
      nodes.push({
        id: `exp-${exp.id}`,
        label: exp.title,
        type: 'experiment',
        size: 20,
        color: exp.status === 'COMPLETE' ? '#10b981' : 
               exp.status === 'IN_PROGRESS' ? '#3b82f6' : '#ef4444',
        data: {
          status: exp.status,
          author: exp.author.name,
          createdAt: exp.createdAt,
        },
      });

      // Link to author
      links.push({
        source: `user-${exp.authorId}`,
        target: `exp-${exp.id}`,
        type: 'authored',
        label: 'created',
      });

      // Extract and add method nodes
      if (exp.method) {
        const methods = extractMethods(exp.method);
        methods.forEach((method) => {
          const methodId = `method-${method.toLowerCase().replace(/\s+/g, '-')}`;
          
          if (!nodes.find((n) => n.id === methodId)) {
            nodes.push({
              id: methodId,
              label: method,
              type: 'method',
              size: 15,
              color: '#f59e0b',
            });
          }

          links.push({
            source: `exp-${exp.id}`,
            target: methodId,
            type: 'uses',
            label: 'uses',
          });
        });
      }

      // Extract and add metric nodes
      if (exp.results) {
        const metrics = extractMetrics(exp.results);
        metrics.forEach((metric) => {
          const metricId = `metric-${metric.toLowerCase().replace(/\s+/g, '-')}`;
          
          if (!nodes.find((n) => n.id === metricId)) {
            nodes.push({
              id: metricId,
              label: metric,
              type: 'metric',
              size: 12,
              color: '#8b5cf6',
            });
          }

          links.push({
            source: `exp-${exp.id}`,
            target: metricId,
            type: 'measures',
            label: 'measures',
          });
        });
      }
    });

    // Add paper nodes
    papers.forEach((paper) => {
      nodes.push({
        id: `paper-${paper.id}`,
        label: paper.title,
        type: 'paper',
        size: 18,
        color: '#06b6d4',
        data: {
          authors: paper.authors,
          uploadedBy: paper.uploadedBy.name,
        },
      });

      // Link papers to experiments
      paper.experimentPapers.forEach((ep) => {
        links.push({
          source: `paper-${paper.id}`,
          target: `exp-${ep.experimentId}`,
          type: 'references',
          label: 'informs',
        });
      });
    });

    // Add user nodes
    users.forEach((member) => {
      nodes.push({
        id: `user-${member.userId}`,
        label: member.user.name,
        type: 'user',
        size: 16,
        color: '#ec4899',
        data: {
          role: member.role,
        },
      });
    });

    // Find similar experiments (based on shared tags/methods)
    experiments.forEach((exp1) => {
      experiments.forEach((exp2) => {
        if (exp1.id !== exp2.id) {
          const sharedTags = exp1.tags.filter((tag1) =>
            exp2.tags.some((tag2) => tag2.id === tag1.id)
          );

          if (sharedTags.length > 0) {
            links.push({
              source: `exp-${exp1.id}`,
              target: `exp-${exp2.id}`,
              type: 'similar',
              label: `${sharedTags.length} shared tags`,
            });
          }
        }
      });
    });

    res.json({
      nodes,
      links,
      stats: {
        experiments: experiments.length,
        papers: papers.length,
        users: users.length,
        connections: links.length,
      },
    });
  } catch (error) {
    console.error('Knowledge graph error:', error);
    res.status(500).json({ error: 'Failed to generate knowledge graph' });
  }
});

// Get experiment relationships
router.get('/experiments/:experimentId/relations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
        experimentPapers: {
          include: {
            paper: {
              include: {
                experimentPapers: {
                  include: {
                    experiment: {
                      select: { id: true, title: true, status: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Find related experiments
    const relatedByPapers = experiment.experimentPapers.flatMap((ep) =>
      ep.paper.experimentPapers
        .filter((otherEp) => otherEp.experimentId !== experimentId)
        .map((otherEp) => ({
          ...otherEp.experiment,
          relation: 'shared-paper',
          paperTitle: ep.paper.title,
        }))
    );

    const relatedByTags = await prisma.experiment.findMany({
      where: {
        AND: [
          { id: { not: experimentId } },
          { teamId: experiment.teamId },
          {
            tags: {
              some: {
                id: {
                  in: experiment.tags.map((tag) => tag.id),
                },
              },
            },
          },
        ],
      },
      include: {
        tags: true,
      },
      take: 10,
    });

    res.json({
      experiment: {
        id: experiment.id,
        title: experiment.title,
        status: experiment.status,
      },
      relatedByPapers: relatedByPapers.slice(0, 5),
      relatedByTags: relatedByTags.map((exp) => ({
        ...exp,
        relation: 'shared-tags',
        sharedTags: exp.tags.filter((tag) =>
          experiment.tags.some((t) => t.id === tag.id)
        ),
      })),
    });
  } catch (error) {
    console.error('Get relations error:', error);
    res.status(500).json({ error: 'Failed to get relationships' });
  }
});

// Helper functions
function extractMethods(methodText: string): string[] {
  const methods: string[] = [];
  const keywords = [
    'ResNet', 'BERT', 'Transformer', 'CNN', 'RNN', 'LSTM', 'GAN',
    'Random Forest', 'SVM', 'K-means', 'Linear Regression',
    'Neural Network', 'Deep Learning', 'Machine Learning',
    'Vision Transformer', 'ViT', 'EfficientNet', 'MobileNet',
    'Data Augmentation', 'Transfer Learning', 'Fine-tuning',
  ];

  keywords.forEach((keyword) => {
    if (methodText.toLowerCase().includes(keyword.toLowerCase())) {
      methods.push(keyword);
    }
  });

  return [...new Set(methods)]; // Remove duplicates
}

function extractMetrics(resultsText: string): string[] {
  const metrics: string[] = [];
  const keywords = [
    'Accuracy', 'Precision', 'Recall', 'F1-Score', 'F1 Score',
    'ROUGE', 'BLEU', 'Loss', 'MAE', 'MSE', 'RMSE',
    'AUC', 'ROC', 'Confusion Matrix', 'IoU', 'mAP',
  ];

  keywords.forEach((keyword) => {
    if (resultsText.toLowerCase().includes(keyword.toLowerCase())) {
      metrics.push(keyword);
    }
  });

  return [...new Set(metrics)];
}

export default router;
