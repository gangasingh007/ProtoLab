'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { experimentsAPI, teamsAPI } from '@/lib/api';
import { Experiment, Team } from '@/types';
import { Sidebar } from '@/components/dashboard/SideBar'; // Ensure correct path
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Search, FlaskConical, Loader2, Filter, 
  SortAsc, Calendar, User, Tag as TagIcon, 
  LayoutGrid, List, ChevronRight, Activity, 
  CheckCircle2, Clock, AlertCircle, PlayCircle
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'oldest' | 'title' | 'status';

// Custom status color helper
const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'BLOCKED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

export default function ExperimentsPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const teamsData = await teamsAPI.getMyTeams();
      setTeams(teamsData);
      
      if (teamsData.length > 0) {
        // Load all experiments from all teams
        const allExperiments = await Promise.all(
          teamsData.map(team => experimentsAPI.getTeamExperiments(team.id))
        );
        setExperiments(allExperiments.flat());
      }
    } catch (error: any) {
      toast.error('Failed to load experiments');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort
  const filteredExperiments = experiments
    .filter((exp) => {
      const matchesSearch = 
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.hypothesis?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      const matchesTeam = selectedTeam === 'all' || exp.teamId === selectedTeam;
      return matchesSearch && matchesStatus && matchesTeam;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title': return a.title.localeCompare(b.title);
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  const stats = {
    total: experiments.length,
    planning: experiments.filter(e => e.status === 'PLANNING').length,
    inProgress: experiments.filter(e => e.status === 'IN_PROGRESS').length,
    blocked: experiments.filter(e => e.status === 'BLOCKED').length,
    complete: experiments.filter(e => e.status === 'COMPLETE').length,
  };

  if (isLoading && teams.length === 0) return <LoadingSkeleton />;

  return (
    <div className="flex bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30">
      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#171717]/90">
        
        {/* Header */}
        <header className="border-b border-white/5 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="px-8 py-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#151921] rounded-lg border border-white/10">
                            <FlaskConical className="w-5 h-5 text-teal-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                                <span className="cursor-pointer hover:text-slate-300">Workspace</span> 
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-teal-500">All Experiments</span>
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Experiment Registry</h1>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => {
                            if (teams.length === 0) {
                                toast.error('Create a team first');
                                router.push('/teams');
                                return;
                            }
                            router.push(`/experiments/new?teamId=${teams[0].id}`);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-black shadow-lg shadow-teal-500/20 border border-teal-500/50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Experiment
                    </Button>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-5 gap-4">
                    <StatCard label="Total Protocols" value={stats.total} icon={Activity} color="text-white" />
                    <StatCard label="Planning" value={stats.planning} icon={Clock} color="text-slate-400" />
                    <StatCard label="In Progress" value={stats.inProgress} icon={PlayCircle} color="text-amber-400" />
                    <StatCard label="Blocked" value={stats.blocked} icon={AlertCircle} color="text-rose-400" />
                    <StatCard label="Completed" value={stats.complete} icon={CheckCircle2} color="text-teal-400" />
                </div>
            </div>

            {/* Controls Bar */}
            <div className="px-8 py-3 border-t border-white/5 flex items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search by title or hypothesis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-[#151921] border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-teal-500/50 text-xs"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <FilterSelect 
                        value={selectedTeam} 
                        onChange={setSelectedTeam} 
                        placeholder="All Teams"
                        options={[
                            { value: 'all', label: 'All Teams' },
                            ...teams.map(t => ({ value: t.id, label: t.name }))
                        ]}
                    />
                    <FilterSelect 
                        value={statusFilter} 
                        onChange={setStatusFilter} 
                        placeholder="Status"
                        options={[
                            { value: 'all', label: 'All Statuses' },
                            { value: 'PLANNING', label: 'Planning' },
                            { value: 'IN_PROGRESS', label: 'In Progress' },
                            { value: 'BLOCKED', label: 'Blocked' },
                            { value: 'COMPLETE', label: 'Complete' }
                        ]}
                    />
                    <FilterSelect 
                        value={sortBy} 
                        onChange={(val:any) => setSortBy(val)} 
                        placeholder="Sort"
                        options={[
                            { value: 'recent', label: 'Recent' },
                            { value: 'oldest', label: 'Oldest' },
                            { value: 'title', label: 'Title' },
                            { value: 'status', label: 'Status' }
                        ]}
                    />
                </div>

                {/* View Toggle */}
                <div className="flex bg-card rounded-md p-1 border border-white/10 ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn("h-7 w-7 p-0", viewMode === 'grid' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn("h-7 w-7 p-0", viewMode === 'list' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
            <div className="p-8 pb-20">
                {filteredExperiments.length === 0 ? (
                    <EmptyState 
                        hasFilter={!!searchQuery || statusFilter !== 'all'} 
                        onClear={() => {setSearchQuery(''); setStatusFilter('all')}}
                        onCreate={() => router.push(`/experiments/new?teamId=${teams[0]?.id}`)}
                    />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredExperiments.map((experiment) => (
                            <ExperimentGridCard 
                                key={experiment.id} 
                                experiment={experiment} 
                                onClick={() => router.push(`/experiments/${experiment.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredExperiments.map((experiment) => (
                            <ExperimentListItem 
                                key={experiment.id} 
                                experiment={experiment} 
                                onClick={() => router.push(`/experiments/${experiment.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}

// --- Sub Components ---

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="bg-gradient-to-br from-muted/10 to-transparent border border-white/5 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
                    <p className="text-2xl font-bold text-slate-200 mt-1">{value}</p>
                </div>
                <div className={cn("p-2 rounded-lg bg-white/5", color)}>
                    <Icon className="w-5 h-5" />
                </div>
            </CardContent>
        </Card>
    )
}

function FilterSelect({ value, onChange, options, placeholder }: any) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[140px] h-9 bg-[#151921] border-white/10 text-xs text-slate-300">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-[#151921] border-white/10 text-slate-200">
                {options.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs focus:bg-white/5 focus:text-white">
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function ExperimentGridCard({ experiment, onClick }: { experiment: Experiment; onClick: () => void }) {
  return (
    <Card
      className="group cursor-pointer bg-gradient-to-br from-muted/30 to-transparent border-white/10 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
            <Badge variant="outline" className={cn("rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold", getStatusColor(experiment.status))}>
                {experiment.status.replace('_', ' ')}
            </Badge>
            <span className="text-[10px] text-slate-500 font-mono">
                {formatDate(experiment.updatedAt)}
            </span>
        </div>
        <CardTitle className="text-lg text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
            {experiment.title}
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs line-clamp-2 mt-2 h-8">
            {experiment.hypothesis || "No hypothesis defined."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-[10px] font-bold">
                    {experiment.createdBy?.name?.charAt(0)}
                </div>
                <span className="text-xs text-slate-500">{experiment.createdBy?.name}</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-600">
                {experiment.tags?.[0] && (
                    <span className="text-teal-400 px-2 py-0.5 rounded border border-white/5">
                        {experiment.tags[0].name}
                    </span>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExperimentListItem({ experiment, onClick }: { experiment: Experiment; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer bg-card border-white/15 hover:bg-[#1A1D24] hover:border-teal-500/20 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-center p-4 gap-6">
        <div className={cn("w-1 h-12 rounded-full", 
            experiment.status === 'COMPLETE' ? 'bg-teal-500' :
            experiment.status === 'IN_PROGRESS' ? 'bg-amber-500' :
            experiment.status === 'BLOCKED' ? 'bg-rose-500' : 'bg-slate-500'
        )} />
        
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-base text-slate-200 group-hover:text-white transition-colors truncate">
                    {experiment.title}
                </h3>
                <Badge variant="outline" className={cn("text-[10px] py-0 h-5", getStatusColor(experiment.status))}>
                    {experiment.status.replace('_', ' ')}
                </Badge>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-2xl">
                {experiment.hypothesis || "No hypothesis defined."}
            </p>
        </div>

        <div className="flex items-center gap-8 text-xs text-slate-500">
            <div className="flex items-center gap-2 w-32">
                <User className="w-3.5 h-3.5" />
                <span className="truncate">{experiment.createdBy?.name}</span>
            </div>
            <div className="flex items-center gap-2 w-24">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(experiment.createdAt)}</span>
            </div>
        </div>
        
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-500 transition-colors" />
      </div>
    </Card>
  );
}

function EmptyState({ hasFilter, onClear, onCreate }: any) {
    return (
        <Card className="border-dashed border-2 border-white/10 bg-[#151921]/20 mt-12">
            <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-white/5 flex items-center justify-center mb-6">
                    {hasFilter ? <Search className="w-8 h-8 text-slate-500" /> : <FlaskConical className="w-8 h-8 text-teal-500/60" />}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                    {hasFilter ? 'No experiments found' : 'No experiments yet'}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm text-center mb-8">
                    {hasFilter 
                        ? 'Try adjusting your filters or search query.' 
                        : 'Create your first experiment to start tracking your scientific process.'}
                </p>
                {hasFilter ? (
                    <Button onClick={onClear} variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                        Clear Filters
                    </Button>
                ) : (
                    <Button onClick={onCreate} className="bg-teal-600 hover:bg-teal-700 text-black shadow-lg shadow-teal-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Experiment
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

function LoadingSkeleton() {
    return (
        <div className="h-screen w-full bg-[#171717] p-8 flex gap-8">
            <div className="w-64 h-full bg-white/5 rounded-xl hidden lg:block" />
            <div className="flex-1 space-y-6">
                <div className="h-10 w-full bg-white/5 rounded-xl" />
                <div className="grid grid-cols-5 gap-4">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white/5 rounded-xl" />)}
                </div>
            </div>
        </div>
    )
}