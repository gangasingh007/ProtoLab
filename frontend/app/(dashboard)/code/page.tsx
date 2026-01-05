'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/SideBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  GitCommit, 
  Database, 
  Box, 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Copy, 
  ExternalLink,
  ChevronRight,
  FileCode,
  RefreshCw,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Mock Data ---
const REPO_DATA = {
  name: "protolab-resnet-finetune",
  branch: "main",
  provider: "GitHub",
  lastSync: "2 mins ago",
  environment: {
    base: "pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime",
    python: "3.10.12",
    dependencies: ["numpy==1.26.0", "pandas==2.1.1", "scikit-learn==1.3.1"]
  }
};

const COMMITS = [
  {
    id: "c8f1a2b",
    message: "feat: implement focal loss for class imbalance",
    author: "Alice Johnson",
    time: "2 hours ago",
    status: "verified",
    experiment: "Exp-92BG",
    dataset: "v2.3 (Cleaned)",
    metrics: { accuracy: "94.2%", loss: "0.12" }
  },
  {
    id: "a1b2c3d",
    message: "fix: adjust learning rate scheduler",
    author: "Mark Smith",
    time: "1 day ago",
    status: "failed",
    experiment: "Exp-91AF",
    dataset: "v2.2",
    metrics: { accuracy: "88.1%", loss: "0.45" }
  },
  {
    id: "d4e5f6g",
    message: "chore: update preprocessing pipeline",
    author: "Alice Johnson",
    time: "3 days ago",
    status: "verified",
    experiment: "Exp-89XY",
    dataset: "v2.1",
    metrics: { accuracy: "91.5%", loss: "0.18" }
  }
];

export default function CodeRepositoryPage() {
  const [activeTab, setActiveTab] = useState('history');
  const [isReproducing, setIsReproducing] = useState(false);

  const handleReproduce = () => {
    setIsReproducing(true);
    setTimeout(() => setIsReproducing(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#171717]/90">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <div className="p-2 bg-[#151921] rounded-lg border border-white/10">
                    <GitBranch className="w-5 h-5 text-teal-500" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                       <span className="cursor-pointer hover:text-slate-300">Workspace</span> 
                       <ChevronRight className="w-3 h-3" />
                       <span className="text-teal-500">Version Control</span>
                    </div>
                    <h2 className="text-base font-medium text-white tracking-tight flex items-center gap-2">
                        {REPO_DATA.name} 
                        <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 bg-[#151921] h-5">
                            <GitBranch className="w-3 h-3 mr-1" /> {REPO_DATA.branch}
                        </Badge>
                    </h2>
                 </div>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500 mr-2 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3" />
                    Synced {REPO_DATA.lastSync}
                </div>
                <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs gap-2">
                    <ExternalLink className="w-3 h-3" /> GitHub
                </Button>
                <Button size="sm" onClick={handleReproduce} className="h-8 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 text-xs gap-2 border border-teal-500/50">
                    {isReproducing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    Reproduce Latest
                </Button>
             </div>
        </header>

        {/* Content Body */}
        <ScrollArea className="flex-1">
            <div className="p-8 max-w-7xl mx-auto w-full pb-20">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: History & Diffs (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-[#151921] border border-white/5 p-1 mb-6">
                                <TabItem value="history" icon={GitCommit} label="Commit History" />
                                <TabItem value="files" icon={FileCode} label="File Browser" />
                                <TabItem value="environment" icon={Box} label="Environment Config" />
                            </TabsList>

                            <TabsContent value="history" className="space-y-4 mt-0">
                                {COMMITS.map((commit, idx) => (
                                    <CommitCard key={commit.id} commit={commit} isLatest={idx === 0} />
                                ))}
                            </TabsContent>

                            <TabsContent value="environment" className="mt-0">
                                <EnvironmentView data={REPO_DATA.environment} />
                            </TabsContent>
                        </Tabs>

                    </div>

                    {/* RIGHT COLUMN: Context (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Reproducibility Status */}
                        <Card className="bg-[#151921] border-white/5">
                            <CardHeader className="pb-3 border-b border-white/5">
                                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Server className="w-3 h-3" /> System Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Container Build</span>
                                    <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px]">Passing</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Dataset Linkage</span>
                                    <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px]">Verified</Badge>
                                </div>
                                <div className="p-3 bg-[#0B0E14] rounded-lg border border-white/5 mt-2">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-slate-500">Storage Usage</span>
                                        <span className="text-slate-300">12.4 GB</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-[65%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Environment */}
                        <Card className="bg-gradient-to-br from-[#151921] to-[#0B0E14] border-white/5">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Box className="w-4 h-4 text-indigo-400" />
                                    <CardTitle className="text-sm font-medium text-slate-200">Active Container</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-mono text-xs text-slate-400 bg-[#0B0E14] p-3 rounded-lg border border-white/5 space-y-2">
                                    <div className="flex gap-2">
                                        <span className="text-indigo-400">$</span>
                                        <span>python --version</span>
                                    </div>
                                    <div className="text-slate-500">Python {REPO_DATA.environment.python}</div>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-indigo-400">$</span>
                                        <span>pip freeze | wc -l</span>
                                    </div>
                                    <div className="text-slate-500">142 packages</div>
                                </div>
                                <Button variant="secondary" className="w-full mt-4 h-8 text-xs bg-white/5 hover:bg-white/10 border border-white/5">
                                    <Terminal className="w-3 h-3 mr-2" /> Launch Shell
                                </Button>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}

// --- Components ---

function TabItem({ value, icon: Icon, label }: any) {
    return (
       <TabsTrigger 
          value={value} 
          className="data-[state=active]:bg-[#1A1D24] data-[state=active]:text-teal-400 data-[state=active]:border-teal-500/50 border-b-2 border-transparent px-4 py-2 text-slate-400 hover:text-slate-200 transition-all rounded-md gap-2 mx-1 my-1"
       >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
       </TabsTrigger>
    )
 }

function CommitCard({ commit, isLatest }: { commit: any, isLatest: boolean }) {
    return (
        <Card className={cn(
            "bg-[#151921] border transition-all duration-200 group relative overflow-hidden",
            isLatest ? "border-teal-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-white/5 hover:border-white/10"
        )}>
            {isLatest && (
                <div className="absolute top-0 right-0 px-2 py-1 bg-teal-500/20 text-teal-400 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg border-l border-b border-teal-500/20">
                    Latest Build
                </div>
            )}
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-semibold text-slate-200 truncate">{commit.message}</h3>
                            <Badge variant="secondary" className={cn(
                                "text-[10px] h-5 px-1.5 border-0",
                                commit.status === 'verified' ? "bg-teal-500/10 text-teal-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {commit.status === 'verified' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                {commit.status}
                            </Badge>
                        </div>
                        
                        {/* Meta Row */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1.5 font-mono text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10">
                                <GitCommit className="w-3 h-3" />
                                {commit.id}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-white">
                                    {commit.author.charAt(0)}
                                </span>
                                {commit.author}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {commit.time}
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-400 hover:text-white">
                            <Copy className="w-3 h-3 mr-1" /> Copy Hash
                        </Button>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="bg-[#0B0E14] rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <Database className="w-3 h-3" /> Linked Data
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-teal-400 font-mono">{commit.dataset}</span>
                            <span className="text-[10px] text-slate-600">2.4 GB</span>
                        </div>
                    </div>
                    <div className="bg-[#0B0E14] rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> Key Metrics
                        </p>
                        <div className="flex gap-3 text-xs">
                            <div className="flex flex-col">
                                <span className="text-slate-600 text-[9px]">ACCURACY</span>
                                <span className="text-slate-300 font-mono">{commit.metrics.accuracy}</span>
                            </div>
                            <div className="w-px h-full bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-slate-600 text-[9px]">LOSS</span>
                                <span className="text-slate-300 font-mono">{commit.metrics.loss}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EnvironmentView({ data }: { data: any }) {
    return (
        <Card className="bg-[#151921] border-white/5">
            <CardHeader>
                <CardTitle className="text-sm text-slate-200">Container Specification</CardTitle>
                <CardDescription className="text-xs text-slate-500">Dockerfile configuration for reproducibility</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-[#0B0E14] rounded-lg border border-white/5 p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
                    <div className="flex">
                        <span className="text-purple-400 w-20 shrink-0">FROM</span>
                        <span>{data.base}</span>
                    </div>
                    <div className="flex">
                        <span className="text-purple-400 w-20 shrink-0">WORKDIR</span>
                        <span>/app</span>
                    </div>
                    <div className="flex">
                        <span className="text-purple-400 w-20 shrink-0">RUN</span>
                        <span>pip install --no-cache-dir \</span>
                    </div>
                    <div className="pl-20 text-slate-400">
                        {data.dependencies.map((dep: string) => (
                            <div key={dep}>{dep} \</div>
                        ))}
                    </div>
                    <div className="flex">
                        <span className="text-purple-400 w-20 shrink-0">COPY</span>
                        <span>. .</span>
                    </div>
                    <div className="flex">
                        <span className="text-purple-400 w-20 shrink-0">CMD</span>
                        <span>["python", "main.py"]</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}