import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import ts from 'typescript';

const router = Router();
const prisma = new PrismaClient();

// Get all teams for current user
// Get all teams for current user
router.get('/my-teams', authenticate, async (req: AuthRequest, res) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { userId: req.userId! },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
            _count: {
              select: {
                experiments: true,
                papers: true,
              },
            },
          },
        },
      },
    });
    
    // Transform the response to include userRole at the team level
    const teams = teamMembers.map(tm => ({
      ...tm.team,
      userRole: tm.role,
      joinedAt: tm.joinedAt,
    }));
    
    console.log('Teams fetched for user:', req.userId, 'Count:', teams.length); // Debug
    
    res.json(teams);
  } catch (error) {
    console.error('Fetch teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});


// Get single team
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is member of this team
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
            // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }
    
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        experiments: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        papers: {
          select: {
            id: true,
            title: true,
            authors: true,
            uploadedAt: true,
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json({
      ...team,
      userRole: membership.role,
    });
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create team
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: req.userId!,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
    
    res.json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if user is owner or editor
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!membership || (membership.role !== 'owner' && membership.role !== 'editor')) {
      return res.status(403).json({ error: 'Not authorized to update this team' });
    }
    
    const team = await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    
    res.json(team);
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is owner
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
            // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only team owner can delete the team' });
    }
    
    await prisma.team.delete({ where: { id } });
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Add member to team
router.post('/:id/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body; // role: "editor" or "viewer"
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Check if current user is owner or editor
    const currentMembership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!currentMembership || (currentMembership.role !== 'owner' && currentMembership.role !== 'editor')) {
      return res.status(403).json({ error: 'Not authorized to add members' });
    }
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          //@ts-ignore
          teamId: id,
        },
      },
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    const member = await prisma.teamMember.create({
        // @ts-ignore
      data: {
        userId,
        teamId: id,
        role: role || 'viewer',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    
    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.to(`team:${id}`).emit('member-added', { member });
    
    res.json(member);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Update member role
router.put('/:id/members/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['owner', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (owner, editor, viewer)' });
    }
    
    // Check if current user is owner
    const currentMembership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!currentMembership || currentMembership.role !== 'owner') {
      return res.status(403).json({ error: 'Only team owner can change roles' });
    }
    
    const member = await prisma.teamMember.update({
      where: {
        userId_teamId: {
          // @ts-ignore  
          userId,teamId: id,
        },
      },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.to(`team:${id}`).emit('member-role-updated', { member });
    
    res.json(member);
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id, userId } = req.params;
    
    // Check if current user is owner or removing themselves
    const currentMembership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!currentMembership) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }
    
    const isRemovingSelf = userId === req.userId;
    const isOwner = currentMembership.role === 'owner';
    
    if (!isOwner && !isRemovingSelf) {
      return res.status(403).json({ error: 'Only team owner can remove members' });
    }
    
    // Prevent removing the last owner
    if (isRemovingSelf && isOwner) {
      const ownerCount = await prisma.teamMember.count({
        where: {
          teamId: id,
          role: 'owner',
        },
      });
      
      if (ownerCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last owner. Transfer ownership first.' });
      }
    }
    
    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          // @ts-ignore
          userId,teamId: id,
        },
      },
    });
    
    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.to(`team:${id}`).emit('member-removed', { userId, teamId: id });
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get team statistics
router.get('/:id/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is member
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.userId!,
          // @ts-ignore
          teamId: id,
        },
      },
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this team' });
    }
    
    const [
      totalExperiments,
      completedExperiments,
      inProgressExperiments,
      blockedExperiments,
      totalPapers,
      totalMembers,
    ] = await Promise.all([
      prisma.experiment.count({ where: { teamId: id } }),
      prisma.experiment.count({ where: { teamId: id, status: 'COMPLETE' } }),
      prisma.experiment.count({ where: { teamId: id, status: 'IN_PROGRESS' } }),
      prisma.experiment.count({ where: { teamId: id, status: 'BLOCKED' } }),
      prisma.paper.count({ where: { teamId: id } }),
      prisma.teamMember.count({ where: { teamId: id } }),
    ]);
    
    res.json({
      totalExperiments,
      completedExperiments,
      inProgressExperiments,
      blockedExperiments,
      totalPapers,
      totalMembers,
    });
  } catch (error) {
    console.error('Fetch team stats error:', error);
    res.status(500).json({ error: 'Failed to fetch team statistics' });
  }
});

export default router;
