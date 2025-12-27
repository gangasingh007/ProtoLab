'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teamsAPI, experimentsAPI } from '@/lib/api';
import { Team, Experiment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, FlaskConical, FileText, Network, Users, 
  Settings, Loader2, Plus, CalendarDays, MoreVertical,
  Clock, Search, Filter, Activity, ChevronRight
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// --- Color Helpers ---
const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-teald-500/10 text-teald-400 border-teald-500/20';
    case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'BLOCKED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      const [teamData, experimentsData] = await Promise.all([
        teamsAPI.getTeam(teamId),
        experimentsAPI.getTeamExperiments(teamId),
      ]);
      setTeam(teamData);
      setExperiments(experimentsData);
    } catch (error: any) {
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExperiments = experiments.filter(exp => 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <TeamLoadingSkeleton />;

  if (!team) return <div className="h-screen bg-[#000000] text-white flex items-center justify-center">Team not found</div>;

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 ">
      

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#171717]/90">
        
        {/* --- Header Section --- */}
        <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-20">
            <div className="px-8 py-6 max-w-7xl mx-auto w-full">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-4">
                   <button onClick={() => router.push('/teams')} className="text-teal-400 hover:text-teal-700 transition-colors">Workspace</button> 
                   <ChevronRight className="w-3 h-3" />
                   <span className="text-white">Team Dashboard</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-6">
                        {/* Team Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teald-500/20 to-teal-500/10 border border-teald-500/20 flex items-center justify-center text-teald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <span className="text-2xl font-bold">{team.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{team.name}</h1>
                            <p className="text-slate-400 mt-1 text-sm max-w-2xl leading-relaxed">
                                {team.description || 'Research and development unit.'}
                            </p>
                            
                            {/* Meta Badges */}
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{team.members?.length || 0} Members</span>
                                </div>
                                <div className="h-3 w-px bg-white/10" />
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    <span>Est. {formatDate(team.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="border-white/10  bg-white/5 hover:bg-white/10 hover:text-white text-slate-400">
                            <Settings className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => router.push(`/experiments/new?teamId=${teamId}`)} className="bg-teal-700 hover:bg-teal-600 text-black shadow-lg shadow-teald-500/20 border border-teald-500/50">
                            <Plus className="w-4 h-4 mr-2" />
                            New Experiment
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- Tabs --- */}
            <div className="px-8 max-w-7xl mx-auto w-full">
                <Tabs defaultValue="experiments" className="w-full">
                    <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start rounded-none border-b border-white/5">
                        <TabItem value="experiments" icon={FlaskConical} label="Experiments" count={experiments.length} />
                        <TabItem value="members" icon={Users} label="Researchers" count={team.members?.length} />
                        <TabItem value="papers" icon={FileText} label="Publications" />
                        <TabItem value="graph" icon={Network} label="Graph View" />
                    </TabsList>
                    
                    <div className="h-[calc(100vh-220px)] overflow-hidden relative">
                         <ScrollArea className="h-full w-full">
                            <div className="py-8 pb-20">
                                <TabsContent value="experiments" className="mt-0 space-y-6">
                                     {/* Search & Filter Bar */}
                                     <div className="flex items-center justify-between gap-4">
                                        <div className="relative w-full max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input 
                                                placeholder="Search experiments..." 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9 bg-[#151921] border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-teald-500/50"
                                            />
                                        </div>
                                        <Button variant="outline" className="border-white/10 bg-[#151921] text-slate-400 hover:text-white">
                                            <Filter className="w-4 h-4 mr-2" /> Filter
                                        </Button>
                                     </div>

                                     {filteredExperiments.length === 0 ? (
                                        <EmptyState 
                                            icon={FlaskConical}
                                            title="No experiments found"
                                            description="Start a new protocol to begin tracking data."
                                            actionLabel="Create Experiment"
                                            onAction={() => router.push(`/experiments/new?teamId=${teamId}`)}
                                        />
                                     ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredExperiments.map((experiment) => (
                                                <ExperimentCard key={experiment.id} experiment={experiment} router={router} />
                                            ))}
                                        </div>
                                     )}
                                </TabsContent>

                                <TabsContent value="members" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {team.members?.map((member) => (
                                            <MemberCard key={member.id} member={member} />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="papers" className="mt-0">
                                    <EmptyState 
                                        icon={FileText} 
                                        title="No papers published" 
                                        description="Link published research papers to this team."
                                    />
                                </TabsContent>

                                <TabsContent value="graph" className="mt-0">
                                     <EmptyState 
                                        icon={Network} 
                                        title="Graph View Empty" 
                                        description="Add data points to visualize connections."
                                    />
                                </TabsContent>
                            </div>
                         </ScrollArea>
                    </div>
                </Tabs>
            </div>
        </header>
      </main>
    </div>
  );
}

// --- Components ---

function TabItem({ value, icon: Icon, label, count }: any) {
    return (
       <TabsTrigger 
          value={value} 
          className="data-[state=active]:bg-transparent data-[state=active]:text-teald-400 data-[state=active]:border-teald-500 border-b-2 border-transparent px-1 pb-3 pt-2 text-slate-500 hover:text-slate-300 transition-all rounded-none gap-2 font-medium"
       >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          {count !== undefined && <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{count}</span>}
       </TabsTrigger>
    )
 }

function ExperimentCard({ experiment, router }: { experiment: Experiment, router: any }) {
    return (
        <Card 
            className="group cursor-pointer bg-black/20 border-white/5 hover:border-teald-500/30 hover:shadow-lg hover:shadow-teald-500/5 transition-all duration-300 relative overflow-hidden"
            onClick={() => router.push(`/experiments/${experiment.id}`)}
        >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn("rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", getStatusColor(experiment.status))}>
                        {experiment.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-teald-500" />
                        Updated {formatDate(experiment.updatedAt)}
                    </span>
                </div>
                <CardTitle className="text-base text-white group-hover:text-teald-400 transition-colors leading-snug">
                    {experiment.title}
                </CardTitle>
                <p className="text-sm text-slate-400 line-clamp-2 mt-2 h-10">
                    {experiment.hypothesis || "No hypothesis defined for this protocol."}
                </p>
            </CardHeader>

            <CardFooter className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-white/10">
                         <AvatarFallback className="text-[9px] bg-[#0B0E14] text-slate-400">
                            {experiment.createdBy?.name?.charAt(0) || 'U'}
                         </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-500 truncate max-w-[100px]">{experiment.createdBy?.name}</span>
                </div>
                
                {/* Tag Pill */}
                {experiment.tags?.[0] && (
                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                        {experiment.tags[0].name}
                    </span>
                )}
            </CardFooter>
        </Card>
    );
}

function MemberCard({ member }: { member: any }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-card/20 hover transition-colors group">
             <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={member.user.avatarUrl} />
                <AvatarFallback className="bg-teald-500/10 text-teald-500 font-bold text-xs">
                {member.user.name?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{member.user.name}</p>
                <p className="text-xs text-slate-500 truncate">{member.user.email}</p>
            </div>
            <Badge variant="secondary" className="bg-[#0B0E14] text-slate-400 border-white/5 text-[10px] capitalize">
                {member.role.toLowerCase()}
            </Badge>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#151921]/20">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto mb-6">
                {description}
            </p>
            {actionLabel && (
                <Button onClick={onAction} variant="outline" className="gap-2 border-white/10 hover:bg-white/5 text-slate-300">
                    <Plus className="w-4 h-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

function TeamLoadingSkeleton() {
    return (
        <div className="h-screen bg-[#0B0E14] flex">
             <div className="w-64 border-r border-white/5 hidden lg:block" />
             <div className="flex-1 p-8 space-y-8">
                <div className="flex gap-6">
                    <Skeleton className="h-20 w-20 rounded-2xl bg-white/5" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-8 w-64 bg-white/5" />
                        <Skeleton className="h-4 w-96 bg-white/5" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 pt-8">
                    {[1,2,3].map(i => (
                        <Skeleton key={i} className="h-48 rounded-xl bg-white/5" />
                    ))}
                </div>
             </div>
        </div>
    )
}