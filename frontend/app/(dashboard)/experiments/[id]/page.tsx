'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { experimentsAPI, aiAPI } from '@/lib/api';
import { Experiment } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from '@/components/experiments/CommentSection'; // Assuming path
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
  MessageSquare,
  FileText,
  Code,
  Network,
  Edit,
  Microscope,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Share2,
  MoreVertical,
  FlaskConical,
  Eye
} from 'lucide-react';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = params.id as string;
  const { socket, isConnected } = useSocket();

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI State
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Local state for editing
  const [editData, setEditData] = useState({
    hypothesis: '',
    method: '',
    observations: '',
    results: '',
    failures: '',
    nextSteps: '',
    status: 'PLANNING' as 'PLANNING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETE',
  });

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  // Socket Logic (Preserved from your code)
  useEffect(() => {
    if (socket && isConnected && experiment) {
      socket.emit('join-experiment', experimentId);

      socket.on('experiment-changed', (data: { changes: Partial<Experiment> }) => {
        setExperiment((prev) => (prev ? { ...prev, ...data.changes } : prev));
        // Also update local edit state if we aren't currently editing to keep sync
        if (!isEditing) {
             setEditData(prev => ({ ...prev, ...data.changes } as any));
        }
        toast('Experiment updated by collaborator', { icon: '🔄' });
      });

      return () => {
        socket.emit('leave-experiment', experimentId);
        socket.off('experiment-changed');
      };
    }
  }, [socket, isConnected, experimentId, experiment, isEditing]);

  const loadExperiment = async () => {
    try {
      const data = await experimentsAPI.getExperiment(experimentId);
      setExperiment(data);
      setEditData({
        hypothesis: data.hypothesis || '',
        method: data.method || '',
        observations: data.observations || '',
        results: data.results || '',
        failures: data.failures || '',
        nextSteps: data.nextSteps || '',
        status: data.status,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load experiment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await experimentsAPI.updateExperiment(experimentId, editData);
      setExperiment(updated);
      setIsEditing(false);
      toast.success('Notebook saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick status update without entering full edit mode
  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = experiment?.status;
    // Optimistic update
    setExperiment(prev => prev ? { ...prev, status: newStatus as any } : null);
    setEditData(prev => ({ ...prev, status: newStatus as any }));

    try {
        await experimentsAPI.updateExperiment(experimentId, { 
            //@ts-ignore
            status: newStatus });
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
        // Revert on failure
        setExperiment(prev => prev ? { ...prev, status: previousStatus as any } : null);
        toast.error("Failed to update status");
    }
  }

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const data = await aiAPI.suggestNextSteps(experimentId);
      setAiSuggestions(data.suggestions || []);
      toast.success('AI insights generated');
    } catch (error: any) {
      toast.error('Failed to generate insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!experiment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="p-6 bg-white rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold mb-2 text-slate-800">Experiment not found</h2>
            <Button onClick={() => router.push('/teams')}>Return to Workspace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold leading-tight truncate max-w-md">{experiment.title}</h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{experiment.createdBy?.name}</span>
                        <span>•</span>
                        <span>Last updated {formatDate(experiment.updatedAt)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Interactive Status Badge */}
                <Select value={editData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className={cn("h-8 border-transparent hover:bg-muted/50 transition-colors w-[140px]", getStatusColor(editData.status))}>
                         <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                </Select>
                
                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                {isEditing ? (
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="min-w-[100px]">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                        </Button>
                    </>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Notebook
                    </Button>
                )}
            </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                
                {/* Left: Main Notebook (8 columns) */}
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                    <Tabs defaultValue="protocol" className="flex flex-col h-full">
                        <TabsList className="w-full justify-start border-b border-border/50 bg-transparent p-0 rounded-none h-auto mb-4">
                            <TabTrigger value="protocol" icon={FlaskConical} label="Protocol" />
                            <TabTrigger value="notes" icon={ClipboardList} label="Field Notes" />
                            <TabTrigger value="analysis" icon={Microscope} label="Analysis" />
                            <TabTrigger value="discussion" icon={MessageSquare} label="Discussion" badge={0} />
                        </TabsList>

                        <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 scrollbar-thin scrollbar-thumb-muted">
                            
                            <TabsContent value="protocol" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                <SectionCard 
                                    title="Hypothesis" 
                                    icon={Sparkles} 
                                    iconColor="text-amber-500"
                                    description="What are we trying to prove?"
                                    value={editData.hypothesis}
                                    onChange={(v: any) => setEditData(prev => ({...prev, hypothesis: v}))}
                                    isEditing={isEditing}
                                    placeholder="State your hypothesis clearly..."
                                />
                                <SectionCard 
                                    title="Methodology" 
                                    icon={FileText} 
                                    iconColor="text-blue-500"
                                    description="Procedures and protocols."
                                    value={editData.method}
                                    onChange={(v:any) => setEditData(prev => ({...prev, method: v}))}
                                    isEditing={isEditing}
                                    placeholder="Step 1..."
                                    className="font-mono text-sm"
                                    minHeight="h-64"
                                />
                            </TabsContent>

                            <TabsContent value="notes" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                <SectionCard 
                                    title="Observations" 
                                    icon={Eye} 
                                    iconColor="text-emerald-500"
                                    description="Raw data and daily logs."
                                    value={editData.observations}
                                    onChange={(v : any) => setEditData(prev => ({...prev, observations: v}))}
                                    isEditing={isEditing}
                                    placeholder="Log observations here..."
                                    minHeight="h-48"
                                />
                                <SectionCard 
                                    title="Results" 
                                    icon={CheckCircle2} 
                                    iconColor="text-indigo-500"
                                    description="Measured outcomes."
                                    value={editData.results}
                                    onChange={(v:any ) => setEditData(prev => ({...prev, results: v}))}
                                    isEditing={isEditing}
                                    placeholder="Enter results..."
                                />
                                <SectionCard 
                                    title="Failures & Deviations" 
                                    icon={AlertTriangle} 
                                    iconColor="text-red-500"
                                    description="What went wrong?"
                                    value={editData.failures}
                                    onChange={(v:any ) => setEditData(prev => ({...prev, failures: v}))}
                                    isEditing={isEditing}
                                    placeholder="Document any deviations from protocol..."
                                    variant="destructive"
                                />
                            </TabsContent>

                            <TabsContent value="analysis" className="space-y-6 mt-0 animate-in fade-in duration-300">
                                <AIInsightCard 
                                    onGenerate={handleGenerateInsights} 
                                    isGenerating={isGeneratingInsights}
                                    suggestions={aiSuggestions}
                                />
                                <SectionCard 
                                    title="Next Steps" 
                                    icon={Share2} 
                                    iconColor="text-violet-500"
                                    description="Action items based on findings."
                                    value={editData.nextSteps}
                                    onChange={(v:any) => setEditData(prev => ({...prev, nextSteps: v}))}
                                    isEditing={isEditing}
                                    placeholder="Plan next steps..."
                                />
                            </TabsContent>

                            <TabsContent value="discussion" className="h-full mt-0 animate-in fade-in duration-300">
                                <div className="h-[600px]">
                                    <CommentSection experimentId={experimentId} />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right: Sidebar / Meta (4 columns) */}
                <div className="lg:col-span-4 border-l border-border/50 pl-6 hidden lg:block overflow-y-auto">
                    <div className="space-y-6 py-2">
                        
                        {/* Tags Widget */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {experiment.tags?.length ? (
                                    experiment.tags.map(tag => (
                                        <Badge key={tag.id} variant="secondary" className="px-2 py-1">{tag.name}</Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">No tags assigned.</span>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Linked Assets */}
                        <div className="space-y-3">
                             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assets</h3>
                             <Button variant="outline" className="w-full justify-start" disabled>
                                <FileText className="w-4 h-4 mr-2" />
                                {experiment.papers?.length || 0} Linked Papers
                             </Button>
                             <Button variant="outline" className="w-full justify-start" disabled>
                                <Code className="w-4 h-4 mr-2" />
                                {experiment.codeVersions?.length || 0} Code Versions
                             </Button>
                             <Button variant="outline" className="w-full justify-start" disabled>
                                <Network className="w-4 h-4 mr-2" />
                                Graph Node
                             </Button>
                        </div>

                        <Separator />

                        {/* Collaborators (Mock) */}
                        <div className="space-y-3">
                             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team</h3>
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                     {experiment.createdBy?.name?.charAt(0)}
                                 </div>
                                 <div className="text-sm">
                                     <p className="font-medium leading-none">{experiment.createdBy?.name}</p>
                                     <p className="text-xs text-muted-foreground">Owner</p>
                                 </div>
                             </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function TabTrigger({ value, icon: Icon, label, badge }: any) {
    return (
        <TabsTrigger 
            value={value}
            className="group data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 pb-3 pt-2"
        >
            <div className="flex items-center gap-2 text-muted-foreground group-data-[state=active]:text-primary transition-colors">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge > 0 && (
                    <span className="bg-muted text-foreground text-[10px] px-1.5 rounded-full">{badge}</span>
                )}
            </div>
        </TabsTrigger>
    );
}

function SectionCard({ title, icon: Icon, iconColor, description, value, onChange, isEditing, placeholder, className, minHeight, variant = 'default' }: any) {
    return (
        <Card className={cn("overflow-hidden border-border/60 shadow-sm", variant === 'destructive' && "border-red-200 bg-red-50/10 dark:bg-red-900/10")}>
            <CardHeader className="pb-3 bg-muted/20 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", iconColor)} />
                    <CardTitle className="text-base">{title}</CardTitle>
                </div>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="p-0">
                {isEditing ? (
                    <Textarea 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                        placeholder={placeholder}
                        className={cn("border-0 focus-visible:ring-0 rounded-none resize-none p-4 bg-background", className, minHeight || "h-32")}
                    />
                ) : (
                    <div className={cn("p-4 whitespace-pre-wrap text-sm leading-relaxed", minHeight || "h-32", !value && "text-muted-foreground italic")}>
                        {value || "No entry recorded."}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function AIInsightCard({ onGenerate, isGenerating, suggestions }: any) {
    return (
        <Card className="border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <CardTitle className="text-base text-indigo-700 dark:text-indigo-300">AI Assistant</CardTitle>
                    </div>
                    <Button size="sm" variant="outline" onClick={onGenerate} disabled={isGenerating} className="bg-background/50">
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                        Generate Insights
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {suggestions.length > 0 ? (
                    <div className="space-y-2 mt-2">
                        {suggestions.map((suggestion: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-background/60 rounded-lg border border-indigo-100 dark:border-indigo-900 text-sm">
                                <span className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0">
                                    {i + 1}
                                </span>
                                <span className="text-foreground/80">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground p-2">
                        Click generate to analyze your observations and get suggested next steps.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function LoadingSkeleton() {
    return (
        <div className="h-screen w-full p-6 space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-12 gap-6 h-full">
                <div className="col-span-8 space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="col-span-4 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    )
}