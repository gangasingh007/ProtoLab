'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teamsAPI, experimentsAPI } from '@/lib/api';
import { Team, Experiment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  FlaskConical, 
  FileText, 
  Network, 
  Users, 
  Settings, 
  Loader2, 
  Plus, 
  CalendarDays,
  MoreVertical,
  Clock,
  Microscope
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Helper to color-code experiment statuses
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20';
    case 'IN_PROGRESS': return 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20';
    case 'PLANNED': return 'bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      toast.error(error.response?.data?.error || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <TeamLoadingSkeleton />;
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Team not found</h2>
        <Button onClick={() => router.push('/teams')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
        </Button>
      </div>
    );
  }

  // Generate team initials for the header icon
  const teamInitials = team.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* 1. Enhanced Header Section */}
      <div className="bg-background border-b border-border/60 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-8 py-6">
          
          {/* Breadcrumb-style Back Button */}
          <div className="mb-6">
            <button 
                onClick={() => router.push('/teams')}
                className="group flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to all teams
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Team Logo/Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20 text-white text-xl font-bold">
                {teamInitials}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{team.name}</h1>
                <p className="text-muted-foreground mt-1 text-sm max-w-2xl leading-relaxed">
                  {team.description || 'No description provided for this research team.'}
                </p>
                
                {/* Meta Data Row */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{team.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Created {formatDate(team.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
               <Button variant="outline" size="icon">
                 <Settings className="w-4 h-4 text-muted-foreground" />
               </Button>
               <Button onClick={() => router.push(`/experiments/new?teamId=${teamId}`)} className="shadow-md shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Navigation Tabs - Integrated into Header */}
        <div className="container mx-auto px-4 sm:px-8 mt-2">
            <Tabs defaultValue="experiments" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b border-transparent">
                  <TabItem value="experiments" icon={FlaskConical} label="Experiments" count={experiments.length} />
                  <TabItem value="members" icon={Users} label="Members" count={team.members?.length || 0} />
                  <TabItem value="papers" icon={FileText} label="Papers" />
                  <TabItem value="graph" icon={Network} label="Knowledge Graph" />
                </TabsList>
                
                {/* Tab Content Wrapper */}
                <div className="py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <TabsContent value="experiments" className="mt-0">
                         {experiments.length === 0 ? (
                            <EmptyState 
                                icon={FlaskConical}
                                title="No experiments yet"
                                description="Start your first experiment to begin tracking research progress."
                                actionLabel="Create Experiment"
                                onAction={() => router.push(`/experiments/new?teamId=${teamId}`)}
                            />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {experiments.map((experiment) => (
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
                            description="Research papers linked to your experiments will appear here."
                        />
                    </TabsContent>

                    <TabsContent value="graph" className="mt-0">
                         <EmptyState 
                            icon={Network} 
                            title="Knowledge Graph Empty" 
                            description="Connect data points to generate your team's knowledge graph."
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components for cleaner code ---

function TabItem({ value, icon: Icon, label, count }: { value: string, icon: any, label: string, count?: number }) {
    return (
        <TabsTrigger 
            value={value} 
            className="group relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary transition-all bg-transparent !shadow-none"
        >
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {count !== undefined && (
                    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary">
                        {count}
                    </span>
                )}
            </div>
        </TabsTrigger>
    );
}

function ExperimentCard({ experiment, router }: { experiment: Experiment, router: any }) {
    return (
        <Card 
            className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            onClick={() => router.push(`/experiments/${experiment.id}`)}
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={cn("rounded-md border-0 px-2 py-1 font-medium", getStatusBadgeVariant(experiment.status))}>
                        {experiment.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {experiment.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm mt-1">
                    {experiment.hypothesis || "No hypothesis defined."}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
                {experiment.tags && experiment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {experiment.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10 text-muted-foreground">
                                {tag.name}
                            </span>
                        ))}
                         {experiment.tags.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                +{experiment.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                         <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {experiment.createdBy?.name?.charAt(0) || 'U'}
                         </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[100px]">{experiment.createdBy?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(experiment.createdAt)}
                </div>
            </CardFooter>
        </Card>
    );
}

function MemberCard({ member }: { member: any }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors">
             <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={member.user.avatarUrl} />
                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                {member.user.name?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{member.user.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{member.user.email}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] h-5 font-normal capitalize">
                {member.role.toLowerCase()}
            </Badge>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: any) {
    return (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto mb-6">
                    {description}
                </p>
                {actionLabel && (
                    <Button onClick={onAction} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

function TeamLoadingSkeleton() {
    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-6">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        </div>
    )
}