'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { experimentsAPI, aiAPI } from '@/lib/api';
import { Experiment } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from '@/components/experiments/CommentSection'; 
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft, Loader2, Save, Sparkles, MessageSquare, FileText, Code, 
  Network, Edit3, Microscope, ClipboardList, AlertTriangle, 
  CheckCircle2, Share2, FlaskConical, Eye, ChevronRight, Calendar, Bot,
  Lightbulb, TrendingUp, AlertOctagon, Copy
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
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

  // Socket Logic
  useEffect(() => {
    if (socket && isConnected && experiment) {
      socket.emit('join-experiment', experimentId);

      socket.on('experiment-changed', (data: { changes: Partial<Experiment> }) => {
        setExperiment((prev) => (prev ? { ...prev, ...data.changes } : prev));
        if (!isEditing) {
             setEditData(prev => ({ ...prev, ...data.changes } as any));
        }
        toast('Updated remotely', { icon: '🔄' });
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
      toast.success('Notebook saved');
    } catch (error: any) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = experiment?.status;
    setExperiment(prev => prev ? { ...prev, status: newStatus as any } : null);
    setEditData(prev => ({ ...prev, status: newStatus as any }));

    try {
        //@ts-ignore
        await experimentsAPI.updateExperiment(experimentId, { status: newStatus });
        toast.success(`Status updated`);
    } catch (error) {
        setExperiment(prev => prev ? { ...prev, status: previousStatus as any } : null);
        toast.error("Failed to update status");
    }
  }

  const parseSuggestions = (input: string | string[]) => {
    if (Array.isArray(input)) return input;
    if (!input || typeof input !== 'string') return [];

    const s = input.trim();
    // Try to extract numbered list items like "1. ... 2. ..."
    const numbered = s.match(/\d+\.[\s\S]*?(?=(\n\d+\.|$))/g);
    if (numbered && numbered.length > 0) {
      return numbered.map(item => item.replace(/^\d+\.\s*/, '').trim());
    }

    // Otherwise split into paragraphs (double newline)
    const paragraphs = s.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length > 1) return paragraphs;

    // Fallback: split by single newline
    return s.split('\n').map(l => l.trim()).filter(Boolean);
  };

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const data = await aiAPI.suggestNextSteps(experimentId);
      // Accept either a string or an array and parse into items for display
      // @ts-ignore
      const raw = data.suggestion ?? data.suggestions ?? data;
      const parsed = parseSuggestions(raw as any);
      setAiSuggestions(parsed);
      toast.success('AI insights generated');
    } catch (error: any) {
      toast.error('Failed to generate insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!experiment) {
    return <div className="h-screen bg-[#171717]/90 text-white flex items-center justify-center">Experiment not found</div>;
  }

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teald-500/30">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#171717]/90">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
           <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" onClick={() => router.back()} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 cursor-pointer text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                   <span onClick={() => router.push('/teams')}>Workspace</span> <ChevronRight className="w-3 h-3" />
                   <span>Team</span> <ChevronRight className="w-3 h-3" />
                   <span className="text-teal-500">Protocol {experimentId.slice(-4)}</span>
                </div>
                <h2 className="text-base font-medium text-white tracking-tight truncate max-w-md">{experiment.title}</h2>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <Select value={editData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 w-[140px] bg-[#262626] border-white/10 text-xs font-medium text-slate-200">
                       <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", editData.status === 'IN_PROGRESS' ? "bg-teald-500 animate-pulse" : "bg-slate-500")} />
                          <SelectValue />
                       </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10 text-slate-200">
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
                      <SelectItem value="COMPLETE">Complete</SelectItem>
                  </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6 bg-white/10" />

              {isEditing ? (
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                    <Button size="sm" onClick={handleSave} className="bg-teald-600 hover:bg-teald-700 text-white">
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} Save
                    </Button>
                 </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs">
                    <Edit3 className="w-3 h-3 mr-2" /> Edit Notebook
                </Button>
              )}
           </div>
        </header>

        {/* Workspace Body - Fixed scrolling */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="protocol" className="h-full flex flex-col">
            {/* Tab Headers - Fixed */}
            <div className="px-8 pt-6 pb-2 shrink-0 border-b border-white/5">
                <TabsList className="bg-transparent p-0 gap-6 h-auto w-full justify-start rounded-none">
                    <TabItem value="protocol" icon={FlaskConical} label="Protocol" />
                    <TabItem value="notes" icon={ClipboardList} label="Field Notes" />
                    <TabItem value="analysis" icon={Microscope} label="Analysis" />
                    <TabItem value="discussion" icon={MessageSquare} label="Discussion" badge={0} />
                </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
                <TabsContent value="protocol" className="space-y-6 mt-0 animate-in fade-in duration-300">
                     <SectionBlock 
                        title="Hypothesis"
                        description="Scientific Question & Expected Outcome"
                        icon={Sparkles}
                        iconColor="text-amber-500"
                        value={editData.hypothesis}
                        onChange={(v: any) => setEditData(prev => ({...prev, hypothesis: v}))}
                        isEditing={isEditing}
                        placeholder="State your hypothesis..."
                     />
                     <SectionBlock 
                        title="Methodology"
                        description="Detailed procedural steps and conditions"
                        icon={FileText}
                        iconColor="text-blue-500"
                        value={editData.method}
                        onChange={(v: any) => setEditData(prev => ({...prev, method: v}))}
                        isEditing={isEditing}
                        placeholder="Step 1..."
                        fontMono
                     />
                </TabsContent>

                <TabsContent value="notes" className="space-y-6 mt-0 animate-in fade-in duration-300">
                     <SectionBlock 
                        title="Observations"
                        icon={Eye}
                        iconColor="text-teal-500"
                        value={editData.observations}
                        onChange={(v: any) => setEditData(prev => ({...prev, observations: v}))}
                        isEditing={isEditing}
                        minHeight="min-h-[300px]"
                     />
                     <div className="grid grid-cols-2 gap-6">
                        <SectionBlock title="Results" icon={CheckCircle2} iconColor="text-teal-500" value={editData.results} onChange={(v:any) => setEditData(prev => ({...prev, results: v}))} isEditing={isEditing} />
                        <SectionBlock title="Failures" icon={AlertTriangle} iconColor="text-rose-500" value={editData.failures} onChange={(v:any) => setEditData(prev => ({...prev, failures: v}))} isEditing={isEditing}  />
                     </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6 mt-0 animate-in fade-in duration-300">
                     <ResearchReportRenderer 
                        suggestions={aiSuggestions} 
                        isGenerating={isGeneratingInsights} 
                        onGenerate={handleGenerateInsights} 
                     />
                     
                     <SectionBlock 
                        title="Next Steps"
                        icon={Share2}
                        iconColor="text-violet-500"
                        value={editData.nextSteps}
                        onChange={(v: any) => setEditData(prev => ({...prev, nextSteps: v}))}
                        isEditing={isEditing}
                     />
                </TabsContent>

                <TabsContent value="discussion" className="mt-0">
                    <div className="min-h-[600px]">
                      <CommentSection experimentId={experimentId} />
                    </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// --- Enhanced Helper Components ---

function TabItem({ value, icon: Icon, label, badge }: any) {
   return (
      <TabsTrigger 
         value={value} 
         className="data-[state=active]:bg-[#262626] data-[state=active]:text-teald-400 data-[state=active]:border-teald-500 border-b-2 border-transparent px-4 py-2 text-slate-400 hover:text-slate-200 transition-all rounded-t-md gap-2"
      >
         <Icon className="w-4 h-4" />
         <span>{label}</span>
         {badge !== undefined && badge > 0 && <span className="text-[10px] bg-teald-500/20 text-teald-400 px-1.5 rounded-full">{badge}</span>}
      </TabsTrigger>
   )
}

function SectionBlock({ title, description, icon: Icon, iconColor, value, onChange, isEditing, placeholder, fontMono, minHeight, variant }: any) {
    const isDanger = variant === 'danger';
    return (
        <div className="space-y-3">
             <div className="flex items-center gap-2 mb-2">
                 <div className={cn("p-1.5 rounded-lg bg-[#1a1a1a] border border-white/5", iconColor)}>
                    <Icon className="w-4 h-4" />
                 </div>
                 <div>
                    <h3 className={cn("text-sm font-bold text-slate-200", isDanger && "text-rose-400")}>{title}</h3>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                 </div>
             </div>
             
             <div className={cn(
                 "bg-[#1b1b1b] border border-white/5 rounded-xl overflow-hidden transition-all",
                 isDanger ? "border-rose-900/20 bg-rose-950/5" : "border-white/5",
                 isEditing && "ring-1 ring-teal-500/50 border-teald-500/20"
             )}>
                 {isEditing ? (
                    <Textarea 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                        placeholder={placeholder}
                        className={cn("bg-transparent border-0 resize-none p-5 text-white focus-visible:ring-0", fontMono && "font-mono text-sm leading-7", minHeight || "h-40")}
                    />
                 ) : (
                    <div className={cn("p-5 whitespace-pre-wrap text-sm leading-7 text-white", fontMono && "font-mono text-white", minHeight || "h-40")}>
                        {value || <span className="text-slate-600 italic">No content recorded.</span>}
                    </div>
                 )}
             </div>
        </div>
    )
}

function ResearchReportRenderer({ suggestions, isGenerating, onGenerate }: any) {
    const getIconForSuggestion = (text: string) => {
        const t = text.toLowerCase();
        if (t.includes('risk') || t.includes('warning') || t.includes('fail')) return <AlertOctagon className="w-4 h-4 text-rose-400" />;
        if (t.includes('optimize') || t.includes('improve')) return <TrendingUp className="w-4 h-4 text-teald-400" />;
        if (t.includes('hypothesis') || t.includes('consider')) return <Lightbulb className="w-4 h-4 text-amber-400" />;
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(suggestions.join('\n'));
        toast.success("Report copied to clipboard");
    }

    return (
        <Card className="bg-gradient-to-br from-[#171717] to-[#171717] border border-white/15 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base text-teal-100">Research Analysis</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">AI-powered pattern detection & next steps</CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {suggestions.length > 0 && (
                            <Button size="icon" variant="ghost" onClick={copyToClipboard} className="h-8 w-8 text-slate-500 hover:text-white">
                                <Copy className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={onGenerate} 
                            disabled={isGenerating} 
                            className="bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20 hover:text-teal-200"
                        >
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                            {suggestions.length > 0 ? "Regenerate" : "Analyze Data"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {suggestions.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {suggestions.map((item: string, idx: number) => {
                            const parts = item.split(':');
                            const hasTitle = parts.length > 1;
                            const title = hasTitle ? parts[0].trim() : `Insight ${idx + 1}`;
                            const content = hasTitle ? parts.slice(1).join(':').trim() : item;

                            return (
                                <div key={idx} className="p-4 hover:bg-white/[0.02] transition-colors flex gap-4 group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="mt-1 shrink-0">
                                        <div className="w-6 h-6 rounded-md bg-[#171717] border border-white/10 flex items-center justify-center">
                                            {getIconForSuggestion(item)}
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <h5 className="text-sm font-medium text-slate-200">
                                            {title}
                                        </h5>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {content}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-teal-500/5 flex items-center justify-center">
                            <Microscope className="w-8 h-8 opacity-40 text-teal-400" />
                        </div>
                        <p className="text-sm max-w-xs">Run the analysis to detect anomalies in your methodology and generate suggested next steps.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function LoadingSkeleton() {
    return (
        <div className="h-screen w-full bg-[#171717] p-8 flex gap-8">
            <Skeleton className="h-full w-64 bg-white/5 rounded-xl" />
            <div className="flex-1 space-y-6">
                <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
                <Skeleton className="h-96 w-full bg-white/5 rounded-xl" />
            </div>
        </div>
    )
}
