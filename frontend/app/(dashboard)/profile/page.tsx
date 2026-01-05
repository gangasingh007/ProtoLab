'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { experimentsAPI, teamsAPI } from '@/lib/api';
import { Experiment, Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Mail, MapPin, Globe, Building, Calendar, FlaskConical, Users, 
  FileText, Award, TrendingUp, Loader2, Edit, Link as LinkIcon, CheckCircle2, 
  ChevronRight, Clock, Shield
} from 'lucide-react';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExperiments: 0,
    completedExperiments: 0,
    activeTeams: 0,
    totalContributions: 0,
  });

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      const userData = currentUser; // Mock for now
      setUser(userData || null);

      const teamsData = await teamsAPI.getMyTeams();
      setTeams(teamsData);

      const allExperiments = await Promise.all(
        teamsData.map(team => experimentsAPI.getTeamExperiments(team.id))
      );
      const userExperiments = allExperiments.flat().filter(exp => exp.createdById === userId);
      setExperiments(userExperiments);

      setStats({
        totalExperiments: userExperiments.length,
        completedExperiments: userExperiments.filter(e => e.status === 'COMPLETE').length,
        activeTeams: teamsData.length,
        totalContributions: userExperiments.length + (userExperiments.reduce((acc, exp) => acc + (exp.comments?.length || 0), 0)),
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!user) return <div className="h-screen bg-[#171717] flex items-center justify-center text-white">User not found</div>;

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30 overflow-hidden">
      {/* 2. Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#171717]/90">
        
        {/* Header (Fixed) */}
        <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-[#171717]/80 backdrop-blur-md z-20">
             <div className="flex items-center gap-4">
                 <div className="p-2 bg-[#151921] rounded-lg border border-white/10">
                    <Users className="w-5 h-5 text-teal-500" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                       <span className="cursor-pointer hover:text-slate-300" onClick={() => router.push('/teams')}>Workspace</span> 
                       <ChevronRight className="w-3 h-3" />
                       <span className="text-teal-500">Researcher Profile</span>
                    </div>
                    <h2 className="text-base font-medium text-white tracking-tight">{user.name}</h2>
                 </div>
             </div>
             
             {isOwnProfile && (
                <Button 
                    onClick={() => router.push('/settings')} 
                    variant="outline" 
                    className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs"
                >
                    <Edit className="w-3 h-3 mr-2" /> Edit Profile
                </Button>
             )}
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
            <div className="p-8 pb-20 max-w-6xl mx-auto w-full space-y-8">
                
                {/* --- Profile Banner Section --- */}
                <div className="relative mb-16">
                    {/* Banner */}
                    <div className="h-48 w-full bg-gradient-to-r from-[#0c0e1300] to-teal-900/20  rounded-xl border border-white/5 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    </div>

                    {/* Profile Info Overlay */}
                    <div className="absolute -bottom-10 left-8 right-8 flex items-end justify-between">
                        <div className="flex items-end gap-6">
                            <Avatar className="w-32 h-32 border-4 border-[#171717] bg-[#151921] shadow-2xl rounded-2xl">
                                <AvatarFallback className=" bg-gradient-to-r from-teal-900/20 to-[#0c0e1300] text-white text-4xl font-bold rounded-2xl">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mb-2 space-y-1">
                                <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-teal-400">
                                        <Shield className="w-3 h-3" />
                                        {user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" /> Amritsar, PB
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Building className="w-3.5 h-3.5" /> GNDU
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Stats Strip */}
                        <div className="flex items-center gap-1 bg-card backdrop-blur-md border border-white/5 p-1 rounded-lg mb-2">
                            <StatBadge label="Experiments" value={stats.totalExperiments} />
                            <div className="w-px h-8 bg-white/10 mx-1" />
                            <StatBadge label="Completed" value={stats.completedExperiments} />
                            <div className="w-px h-8 bg-white/10 mx-1" />
                            <StatBadge label="Contributions" value={stats.totalContributions} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    
                    {/* LEFT COL: About & Achievements */}
                    <div className="space-y-6">
                        <Card className="bg-black/10 border-white/5 shadow-none">
                            <CardHeader className="pb-3 border-b border-white/5">
                                <CardTitle className="text-sm font-semibold text-slate-200 uppercase tracking-wider">About</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <p className="text-sm text-white leading-relaxed">
                                    Full-stack developer passionate about AI and machine learning. 
                                    Currently working on research projects involving deep learning and computer vision.
                                </p>
                                <div className="flex flex-col gap-2 pt-2">
                                    <SocialLink icon={Mail} label={user.email} href={`mailto:${user.email}`} />
                                    <SocialLink icon={Globe} label="portfolio.dev" href="#" />
                                    <SocialLink icon={Calendar} label={`Joined ${formatDate(user.createdAt)}`} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/10 border-white/5 shadow-none">
                            <CardHeader className="pb-3 border-b border-white/5">
                                <CardTitle className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Achievements</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-4 gap-2">
                                <AchievementIcon icon={FlaskConical} color="text-blue-400" bg="bg-blue-500/10" tooltip="First Experiment" />
                                <AchievementIcon icon={Award} color="text-teal-400" bg="bg-teal-500/10" tooltip="Experiment Master" />
                                <AchievementIcon icon={Users} color="text-purple-400" bg="bg-purple-500/10" tooltip="Team Player" />
                                <AchievementIcon icon={TrendingUp} color="text-amber-400" bg="bg-amber-500/10" tooltip="Top Contributor" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COL: Tabs & Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="activity" className="w-full">
                            <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start rounded-none border-b border-white/5 mb-6">
                                <TabItem value="activity" icon={TrendingUp} label="Activity" />
                                <TabItem value="experiments" icon={FlaskConical} label="Experiments" count={experiments.length} />
                                <TabItem value="teams" icon={Users} label="Teams" count={teams.length} />
                            </TabsList>

                            <TabsContent value="activity" className="space-y-4">
                                <Card className="bg-black/10 border-white/5 shadow-none">
                                    <CardContent className="p-0">
                                        <ActivityItem 
                                            icon={FlaskConical} title="Created new experiment" 
                                            desc="ResNet-50 Fine-tuning" time="2 hours ago" color="bg-blue-500/20 text-blue-400" 
                                        />
                                        <ActivityItem 
                                            icon={FileText} title="Added a paper" 
                                            desc="Attention Is All You Need" time="5 hours ago" color="bg-teal-500/20 text-teal-400" 
                                        />
                                        <ActivityItem 
                                            icon={Users} title="Joined a team" 
                                            desc="AI Research Lab" time="2 days ago" color="bg-purple-500/20 text-purple-400" 
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="experiments" className="space-y-4">
                                {experiments.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-xl bg-[#151921]/50">
                                        <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No experiments yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {experiments.map(exp => (
                                            <ExperimentCard key={exp.id} experiment={exp} router={router} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="teams" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {teams.map(team => (
                                        <TeamCard key={team.id} team={team} router={router} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function TabItem({ value, icon: Icon, label, count }: any) {
    return (
       <TabsTrigger 
          value={value} 
          className="data-[state=active]:bg-transparent data-[state=active]:text-teal-400 data-[state=active]:border-teal-500 border-b-2 border-transparent px-1 pb-3 pt-2 text-slate-500 hover:text-slate-300 transition-all rounded-none gap-2 font-medium"
       >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          {count !== undefined && <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{count}</span>}
       </TabsTrigger>
    )
 }

function StatBadge({ label, value }: any) {
    return (
        <div className="px-4 py-2 text-center min-w-[80px]">
            <div className="text-lg font-bold text-white leading-none">{value}</div>
            <div className="text-[10px] uppercase text-slate-500 font-bold mt-1 tracking-wider">{label}</div>
        </div>
    )
}

function SocialLink({ icon: Icon, label, href }: any) {
    return (
        <a href={href || "#"} className="flex items-center gap-3 text-sm text-slate-400 hover:text-teal-400 transition-colors p-2 rounded-lg hover:bg-white/5">
            <Icon className="w-4 h-4" />
            <span className="truncate">{label}</span>
        </a>
    )
}

function AchievementIcon({ icon: Icon, color, bg, tooltip }: any) {
    return (
        <div className={cn("aspect-square rounded-xl flex items-center justify-center border border-white/5 hover:border-white/10 transition-all cursor-help group relative", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
            {/* Simple Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tooltip}
            </div>
        </div>
    )
}

function ActivityItem({ icon: Icon, title, desc, time, color }: any) {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <span className="text-[10px] text-slate-600 whitespace-nowrap">{time}</span>
        </div>
    )
}

function ExperimentCard({ experiment, router }: { experiment: Experiment, router: any }) {
    return (
        <Card 
            className="group cursor-pointer bg-card border-white/5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
            onClick={() => router.push(`/experiments/${experiment.id}`)}
        >
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">{experiment.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="outline" className={cn("text-[10px] h-4 px-1 py-0", getStatusColor(experiment.status))}>
                            {experiment.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(experiment.updatedAt)}
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-500 transition-colors" />
            </CardContent>
        </Card>
    )
}

function TeamCard({ team, router }: { team: Team, router: any }) {
    return (
        <Card 
            className="cursor-pointer bg-card border-white/5 hover:bg-card/10 hover:border-teal-500 hover:border-teal-500/30 transition-all"
            onClick={() => router.push(`/teams/${team.id}`)}
        >
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 font-bold text-xs">
                        {team.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-medium text-slate-200 truncate">{team.name}</h4>
                        <p className="text-[10px] text-slate-500">{team.members?.length || 0} members</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function LoadingSkeleton() {
    return (
        <div className="h-screen w-full bg-[#171717] p-8 flex gap-8">
            <div className="w-64 h-full bg-white/5 rounded-xl hidden lg:block" />
            <div className="flex-1 space-y-6">
                <div className="h-48 w-full bg-white/5 rounded-xl" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-64 bg-white/5 rounded-xl" />
                    <div className="col-span-2 h-96 bg-white/5 rounded-xl" />
                </div>
            </div>
        </div>
    )
}