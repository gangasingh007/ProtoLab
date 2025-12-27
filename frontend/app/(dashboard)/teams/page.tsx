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
  Microscope,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
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

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-slate-50/80 to-primary/5">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="relative w-12 h-12 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground mt-6 font-medium animate-pulse">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-[#171717]/90">
      {/* Enhanced Header with Gradient */}
      <div className="border-b border-border/40  backdrop-blur-xl  sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl ring-4 ring-primary/5">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Research Teams
                  </h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {teams.length} {teams.length === 1 ? 'active laboratory' : 'active laboratories'}
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] group">
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px]">
                <form onSubmit={handleCreateTeam}>
                  <DialogHeader className="space-y-3">
                    <div className="mx-auto p-3 bg-primary/10 rounded-xl ring-8 ring-primary/5 w-fit">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl text-center">Create New Team</DialogTitle>
                    <DialogDescription className="text-center">
                      Establish a new research group. You'll be assigned as the Lab Manager with full permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 py-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className="text-sm font-semibold">Team Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Quantum Computing Lab"
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        required
                        className="bg-muted/40 border-border/60 focus-visible:ring-primary/30 h-11"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="description" className="text-sm font-semibold">
                        Description
                        <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your research focus, objectives, and key areas of interest..."
                        value={newTeam.description}
                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                        rows={4}
                        className="resize-none bg-muted/40 border-border/60 focus-visible:ring-primary/30"
                      />
                      <p className="text-xs text-muted-foreground">
                        {newTeam.description.length} characters
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="min-w-24">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating} className="min-w-32">
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Team
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Enhanced Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8">
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search teams by name or description..."
                className="pl-10 pr-4 h-11 bg-background border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <span className="text-xs font-medium">Clear</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("h-9 w-9 p-0 transition-all", viewMode === 'grid' && "shadow-sm")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4 text-white" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("h-9 w-9 p-0 transition-all", viewMode === 'list' && "shadow-sm")}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="h-4 w-4 text-white" />
                </Button>
              </div>
              
              {filteredTeams.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">{filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 sm:px-8 py-10">
        {filteredTeams.length === 0 ? (
          <EmptyState 
            isSearching={searchQuery.length > 0} 
            onClear={() => setSearchQuery('')}
            onCreate={() => setIsDialogOpen(true)}
          />
        ) : (
          <div className={cn(
            "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-5xl mx-auto"
          )}>
            {filteredTeams.map((team, index) => (
              <TeamCard 
                key={team.id} 
                team={team} 
                viewMode={viewMode}
                onClick={() => router.push(`/teams/${team.id}`)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Team Card Component
function TeamCard({ team, viewMode, onClick, index }: { team: any; viewMode: 'grid' | 'list'; onClick: () => void; index: number }) {
  //@ts-ignore
  const initials = team.name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase() || team.name.slice(0, 2).toUpperCase();
  
  const gradients = [
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-violet-500 to-purple-600",
    "bg-gradient-to-br from-teald-500 to-teal-600",
    "bg-gradient-to-br from-orange-500 to-red-600",
    "bg-gradient-to-br from-pink-500 to-rose-600",
    "bg-gradient-to-br from-cyan-500 to-blue-600",
  ];
  const gradientClass = gradients[team.id.length % gradients.length];

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onClick}
        style={{ animationDelay: `${index * 50}ms` }}
        className="group flex items-center justify-between p-5 bg-card hover:bg-accent/30 border border-border/60 rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 animate-in fade-in slide-in-from-left-4"
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0", gradientClass)}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors mb-1">
              {team.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {team.description || 'No description provided'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 ml-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FlaskConical className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{team._count?.experiments || 0}</div>
              <div className="text-xs text-muted-foreground">Experiments</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{team.members?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={onClick}
      style={{ animationDelay: `${index * 75}ms` }}
      className="group relative overflow-hidden cursor-pointer border-border/60 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 bg-card/50 backdrop-blur animate-in fade-in zoom-in-95"
    >
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300 bg-primary/80")}>
            {initials}
          </div>
          <Badge variant="secondary" className="bg-teald-500/10 text-teald-700 dark:text-teald-400 border-teald-500/20 font-medium px-3 shadow-sm">
            Active
          </Badge>
        </div>
        
        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-1">
          {team.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {team.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 group-hover:border-primary/20 transition-all duration-300">
            <FlaskConical className="w-5 h-5 text-primary mb-2" />
            <span className="text-2xl font-bold text-foreground">{team._count?.experiments || 0}</span>
            <span className="text-xs text-muted-foreground font-medium mt-1">Experiments</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10 group-hover:border-primary/20 transition-all duration-300">
            <FileText className="w-5 h-5 text-primary mb-2" />
            <span className="text-2xl font-bold text-foreground">{team._count?.papers || 0}</span>
            <span className="text-xs text-muted-foreground font-medium mt-1">Papers</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, team.members?.length || 0))].map((_, i) => (
              <div 
                key={i} 
                className="inline-flex h-8 w-8 rounded-full ring-2 ring-background bg-gradient-to-br from-slate-200 to-slate-300 items-center justify-center text-xs font-bold text-slate-700 shadow-sm transition-transform hover:scale-110 hover:z-10"
              >
                U{i+1}
              </div>
            ))}
            {(team.members?.length || 0) > 3 && (
              <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-background bg-muted items-center justify-center text-xs font-semibold text-muted-foreground shadow-sm">
                +{team.members.length - 3}
              </div>
            )}
          </div>
          {(team.members?.length || 0) > 0 && (
            <span className="text-xs text-muted-foreground font-medium ml-1">
              {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground font-medium">
          {formatDate(team.createdAt)}
        </div>
      </CardFooter>
    </Card>
  );
}

// Enhanced Empty State Component
function EmptyState({ isSearching, onClear, onCreate }: { isSearching: boolean; onClear: () => void; onCreate: () => void }) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ring-8 ring-muted/30">
            <Search className="w-9 h-9 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">No teams found</h3>
        <p className="text-muted-foreground mt-2 max-w-md leading-relaxed">
          
          We couldn't find any teams matching <span className="font-semibold text-foreground">"{
          // @ts-ignore
          searchQuery.length > 30 ? searchQuery.slice(0, 30) + '...' : searchQuery}"</span>. Try adjusting your search.
        </p>
        <Button variant="outline" onClick={onClear} size="lg" className="mt-8 group">
          <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2 border-border/60 bg-gradient-to-br from-muted/30 to-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-8 ring-primary/5">
            <Microscope className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-3">No teams created yet</h3>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed text-base">
          Get started by creating your first research team. Collaborate with members, track experiments, and publish groundbreaking research together.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <Button onClick={onCreate} size="lg" className="shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 group min-w-48">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Create Your First Team
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl">
          {[
            { icon: Users, label: 'Collaborate', desc: 'Work together seamlessly' },
            { icon: FlaskConical, label: 'Track Progress', desc: 'Monitor experiments' },
            { icon: FileText, label: 'Publish', desc: 'Share your findings' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
