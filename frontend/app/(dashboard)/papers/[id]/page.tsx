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
import { Sidebar } from '@/components/dashboard/SideBar';
import { 
  ArrowLeft, ExternalLink, FileText, Loader2, Sparkles, 
  Download, BookOpen, Calendar, Users, Quote, Microscope,
  AlertTriangle, Lightbulb, Link as LinkIcon, ChevronRight
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
      <div className="h-screen bg-[#171717] flex flex-col items-center justify-center text-white">
        <FileText className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Paper not found</h2>
        <Button variant="outline" onClick={() => router.push('/papers')}>Return to Library</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30">
      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#171717]/90">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex py-3 items-center justify-between px-8 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <Button size="icon" variant="ghost" onClick={() => router.push('/papers')} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5">
                    <ArrowLeft className="w-4 h-4" />
                 </Button>
                 <div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                       <span className="cursor-pointer hover:text-slate-300">Library</span> 
                       <ChevronRight className="w-3 h-3" />
                       <span className="text-teal-500">Analysis</span>
                    </div>
                    <h2 className="text-base font-medium text-white tracking-tight truncate max-w-md">{paper.title}</h2>
                 </div>
             </div>
             
             <div className="flex items-center gap-3">
                {paper.url && (
                    <Button variant="outline" size="sm" asChild className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs gap-2">
                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" /> View Source
                        </a>
                    </Button>
                )}
                {paper.pdfUrl && (
                    <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 text-xs gap-2">
                        <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Download className="w-3 h-3" /> Download PDF
                        </a>
                    </Button>
                )}
             </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Content (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Title Block */}
                    <div>
                        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
                            {paper.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-teal-500" />
                                <span className="text-slate-300 font-medium">{paper.authors || "Unknown Authors"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span>{formatDate(paper.createdAt)}</span>
                            </div>
                            <Badge variant="outline" className="border-white/10 text-slate-500 font-mono text-[10px] bg-[#151921]">
                                PAPER ID: {paper.id.substring(0,8).toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    {/* AI Summary Card */}
                    <div className="relative group rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 shadow-lg shadow-indigo-500/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
                        <Card className="relative bg-[#0B0E14] border-0 h-full">
                            <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                    <CardTitle className="text-base text-white">AI Executive Summary</CardTitle>
                                </div>
                                {!paper.summary && (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={handleSummarize} 
                                        disabled={isSummarizing}
                                        className="h-7 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 text-xs"
                                    >
                                        {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                                        Generate
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="pt-6">
                                {paper.summary ? (
                                    <p className="leading-relaxed text-slate-300 text-sm">{paper.summary}</p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                                        <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-sm">Click generate to analyze this paper using AI.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Key Sections Grid */}
                    <div className="space-y-6">
                        <SectionBlock 
                            title="Key Findings" 
                            icon={Lightbulb} 
                            content={paper.findings} 
                            placeholder="Extract key findings to populate this section."
                            colorClass="text-amber-400"
                            bgClass="bg-amber-500/10"
                        />
                        
                        <SectionBlock 
                            title="Methodology" 
                            icon={Microscope} 
                            content={paper.methodology} 
                            placeholder="Methodology details will appear here."
                            colorClass="text-blue-400"
                            bgClass="bg-blue-500/10"
                        />
                        
                        <SectionBlock 
                            title="Limitations" 
                            icon={AlertTriangle} 
                            content={paper.limitations} 
                            placeholder="Noted limitations will appear here."
                            colorClass="text-rose-400"
                            bgClass="bg-rose-500/10"
                        />
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function SectionBlock({ title, icon: Icon, content, placeholder, colorClass, bgClass }: any) {
    return (
        <Card className="bg-gradient-to-r from-card/90 via-card/70 to-transparent border-white/5 overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-md", bgClass)}>
                        <Icon className={cn("w-4 h-4", colorClass)} />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-200">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-5">
                {content ? (
                    <p className="leading-relaxed text-slate-400 text-sm whitespace-pre-wrap">
                        {content}
                    </p>
                ) : (
                    <p className="text-slate-600 italic text-sm">{placeholder}</p>
                )}
            </CardContent>
        </Card>
    )
}

function PaperSkeleton() {
    return (
        <div className="h-screen w-full bg-[#171717] p-8 flex gap-8">
            <div className="w-64 h-full bg-white/5 rounded-xl hidden lg:block" />
            <div className="flex-1 space-y-6">
                <div className="h-12 w-3/4 bg-white/5 rounded-xl" />
                <div className="h-64 bg-white/5 rounded-xl" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="h-48 bg-white/5 rounded-xl" />
                    <div className="h-48 bg-white/5 rounded-xl" />
                    <div className="h-48 bg-white/5 rounded-xl" />
                </div>
            </div>
        </div>
    )
}