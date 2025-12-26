'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  FlaskConical, 
  FileText, 
  Loader2, 
  ChevronRight, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  MoreHorizontal,
  Microscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils'; // Assuming standard shadcn utils
import { useTeamStore } from '@/lib/stores/teamStores';

export default function TeamsPage() {
  const router = useRouter();
  const { teams, setTeams, addTeam } = useTeamStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });

  // Mock loading for a smoother initial render feel
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamsAPI.getMyTeams();
      setTeams(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const team = await teamsAPI.createTeam(newTeam);
      addTeam(team);
      toast.success('Team created successfully!');
      setIsDialogOpen(false);
      setNewTeam({ name: '', description: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter teams based on search
  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header Section */}
      <div className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Research Teams
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your active laboratories and collaborations.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleCreateTeam}>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Establish a new research group. You will be assigned as the Lab Manager.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Quantum Computing Lab"
                          value={newTeam.name}
                          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                          required
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Briefly describe the research focus..."
                          value={newTeam.description}
                          onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                          rows={4}
                          className="resize-none bg-muted/30"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Team'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-8">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                className="pl-9 bg-background border-border/60 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 sm:px-8 py-8">
        {filteredTeams.length === 0 ? (
          <EmptyState 
            isSearching={searchQuery.length > 0} 
            onClear={() => setSearchQuery('')}
            onCreate={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className={cn(
            "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {filteredTeams.map((team) => (
              <TeamCard 
                key={team.id} 
                team={team} 
                viewMode={viewMode}
                onClick={() => router.push(`/teams/${team.id}`)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual Team Cards
function TeamCard({ team, viewMode, onClick }: { team: any; viewMode: 'grid' | 'list'; onClick: () => void }) {
  // Generate initials for the avatar fallback
  const initials = team.name.slice(0, 2).toUpperCase();
  
  // Random color logic for the team icon background (you can replace this with fixed logic)
  const colors = ["bg-blue-100 text-blue-600", "bg-indigo-100 text-indigo-600", "bg-violet-100 text-violet-600", "bg-emerald-100 text-emerald-600"];
  const colorClass = colors[team.id.length % colors.length];

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onClick}
        className="group flex items-center justify-between p-4 bg-card hover:bg-accent/50 border border-border/60 rounded-xl cursor-pointer transition-all hover:border-primary/30"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm", colorClass)}>
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{team.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{team.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <FlaskConical className="w-4 h-4" />
             <span>{team._count?.experiments || 0}</span>
           </div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Users className="w-4 h-4" />
             <span>{team.members?.length || 0}</span>
           </div>
           <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer border-border/60 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-3 shadow-sm", colorClass)}>
            {initials}
          </div>
          {/* Mock Status Badge */}
          <Badge variant="secondary" className="bg-secondary/50 font-normal">Active</Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {team.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 h-10">
          {team.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-2 py-2 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Experiments</span>
            <div className="flex items-center gap-1.5 mt-1 text-foreground font-semibold">
              <FlaskConical className="w-3.5 h-3.5 text-primary" />
              <span>{team._count?.experiments || 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 border-l border-border/50">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Papers</span>
            <div className="flex items-center gap-1.5 mt-1 text-foreground font-semibold">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>{team._count?.papers || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {/* Mocking Avatar overlap for visual flair */}
          {[...Array(Math.min(3, team.members?.length || 0))].map((_, i) => (
             <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
               U{i+1}
             </div>
          ))}
          {(team.members?.length || 0) > 3 && (
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[9px] font-medium">
              +{team.members.length - 3}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Updated {formatDate(team.createdAt)}
        </div>
      </CardFooter>
    </Card>
  );
}

// Sub-component for Empty State
function EmptyState({ isSearching, onClear, onCreate }: { isSearching: boolean; onClear: () => void; onCreate: () => void }) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No teams found</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          We couldn't find any teams matching your search query.
        </p>
        <Button variant="link" onClick={onClear} className="mt-4 text-primary">
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2 border-border/60 bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
          <Microscope className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">No teams created yet</h3>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Get started by creating your first research team. Invite members and start tracking experiments.
        </p>
        <Button onClick={onCreate} size="lg" className="mt-8 shadow-xl shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Team
        </Button>
      </CardContent>
    </Card>
  );
}