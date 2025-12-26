'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { papersAPI, aiAPI } from '@/lib/api';
import { Paper } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Loader2, 
  Sparkles, 
  Download, 
  BookOpen, 
  Calendar, 
  Users, 
  Quote, 
  Microscope,
  AlertTriangle,
  Lightbulb,
  Link as LinkIcon
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    loadPaper();
  }, [paperId]);

  const loadPaper = async () => {
    try {
      const data = await papersAPI.getPaper(paperId);
      setPaper(data);
    } catch (error: any) {
      toast.error('Failed to load paper');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const data = await aiAPI.summarizePaper(paperId);
      setPaper((prev) => prev ? { ...prev, summary: data.summary } : prev);
      toast.success('Analysis generated successfully');
    } catch (error: any) {
      toast.error('Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoading) return <PaperSkeleton />;

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-4">
            <div className="bg-muted p-4 rounded-full inline-flex">
                <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">Paper not found</h2>
            <Button onClick={() => router.push('/papers')}>Return to Library</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* 1. Header with Breadcrumb */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/papers')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Library
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span className="truncate max-w-[200px] font-medium text-foreground">{paper.title}</span>
              </div>
           </div>
           
           <div className="text-xs text-muted-foreground hidden sm:block">
              Added {formatDate(paper.createdAt)} by {paper.uploadedBy?.name}
           </div>
        </div>
      </header>

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Content Analysis (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Title Section */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                            {paper.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-4 text-slate-600 dark:text-slate-400">
                            <Users className="w-5 h-5" />
                            <span className="text-lg">{paper.authors || "Unknown Authors"}</span>
                        </div>
                    </div>

                    {/* AI Summary Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 blur transition duration-1000 group-hover:opacity-40"></div>
                        <Card className="relative border-indigo-100 dark:border-indigo-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                        <Sparkles className="w-5 h-5" />
                                        <CardTitle className="text-lg">AI Analysis</CardTitle>
                                    </div>
                                    {!paper.summary && (
                                        <Button 
                                            size="sm" 
                                            onClick={handleSummarize} 
                                            disabled={isSummarizing}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Summary"}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {paper.summary ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                                            {paper.summary}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-sm">No analysis generated yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Findings & Methodology Grid */}
                    <div className="grid gap-6">
                        <SectionBlock 
                            title="Key Findings" 
                            icon={Lightbulb} 
                            content={paper.findings} 
                            placeholder="Key findings extracted from the paper will appear here."
                            colorClass="text-amber-500"
                        />
                        
                        <SectionBlock 
                            title="Methodology" 
                            icon={Microscope} 
                            content={paper.methodology} 
                            placeholder="Methodology details will appear here."
                            colorClass="text-blue-500"
                        />
                        
                        <SectionBlock 
                            title="Limitations" 
                            icon={AlertTriangle} 
                            content={paper.limitations} 
                            placeholder="Noted limitations will appear here."
                            colorClass="text-red-500"
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Quick Actions */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Source</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {paper.pdfUrl ? (
                                <Button className="w-full gap-2" size="lg" asChild>
                                    <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button className="w-full gap-2" variant="secondary" disabled>
                                    <Download className="w-4 h-4" />
                                    No PDF Available
                                </Button>
                            )}

                            {paper.url && (
                                <Button variant="outline" className="w-full gap-2" asChild>
                                    <a href={paper.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                        View Source
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Linked Experiments */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                             <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Linked Experiments</CardTitle>
                                <Badge variant="secondary" className="text-xs">{paper.experiments?.length || 0}</Badge>
                             </div>
                        </CardHeader>
                        <CardContent>
                             {paper.experiments && paper.experiments.length > 0 ? (
                                <div className="space-y-2">
                                    {paper.experiments.map((exp: any) => (
                                        <div 
                                            key={exp.id}
                                            onClick={() => router.push(`/experiments/${exp.experiment?.id}`)}
                                            className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                    <Microscope className="w-4 h-4" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                                        {exp.experiment?.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {exp.experiment?.status?.toLowerCase().replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 rotate-180 transition-all" />
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="text-center py-6">
                                    <LinkIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                                    <p className="text-sm text-muted-foreground">No experiments linked.</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>

                     {/* Metadata Card */}
                     <Card className="bg-muted/20 border-none shadow-none">
                        <CardContent className="pt-6 space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Added</span>
                                <span className="font-medium">{formatDate(paper.createdAt)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Updated</span>
                                <span className="font-medium">{formatDate(paper.updatedAt)}</span>
                            </div>
                             <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">ID</span>
                                <span className="font-mono text-xs text-muted-foreground">{paper.id.substring(0,8)}...</span>
                            </div>
                        </CardContent>
                     </Card>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SectionBlock({ title, icon: Icon, content, placeholder, colorClass }: any) {
    return (
        <div className="group">
            <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("w-5 h-5", colorClass)} />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <Card className="border-border/60 hover:border-border transition-colors">
                <CardContent className="pt-6">
                    {content ? (
                         <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                            {content}
                        </p>
                    ) : (
                        <p className="text-muted-foreground italic text-sm">{placeholder}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function PaperSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                <div className="col-span-4 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}