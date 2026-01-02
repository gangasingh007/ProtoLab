'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { papersAPI, teamsAPI } from '@/lib/api';
import { Paper, Team } from '@/types';
import { Sidebar } from '@/components/dashboard/SideBar'; // Ensure path is correct
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, FileText, Loader2, Search, ExternalLink, 
  BookOpen, Link as LinkIcon, Calendar, Users, 
  Quote, ChevronRight, Download
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PapersPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newPaper, setNewPaper] = useState({
    title: '', authors: '', url: '', pdfUrl: '',
    summary: '', findings: '', methodology: '', limitations: '',
    teamId: '',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadPapers(selectedTeam);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      const data = await teamsAPI.getMyTeams();
      setTeams(data);
      if (data.length > 0) setSelectedTeam(data[0].id);
    } catch (error: any) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPapers = async (teamId: string) => {
    setIsLoading(true);
    try {
        // @ts-ignore
      const data = await teamsAPI.getTeamPapers(teamId);
      setPapers(data);
    } catch (error: any) {
       // Silent fail for init
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const paper = await papersAPI.createPaper({
        ...newPaper,
        teamId: selectedTeam,
      });
      setPapers([paper, ...papers]);
      toast.success('Paper added to library');
      setIsDialogOpen(false);
      setNewPaper({
        title: '', authors: '', url: '', pdfUrl: '',
        summary: '', findings: '', methodology: '', limitations: '',
        teamId: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add paper');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredPapers = papers.filter((paper) =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && teams.length === 0) return <PapersLoadingSkeleton />;

  return (
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30">
      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#171717]/90">
        
        {/* --- Header --- */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <div className="p-2 bg-[#151921] rounded-lg border border-white/10">
                    <BookOpen className="w-5 h-5 text-teal-500" />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                       <span className="cursor-pointer hover:text-slate-300">Workspace</span> 
                       <ChevronRight className="w-3 h-3" />
                       <span className="text-teal-500">Library</span>
                    </div>
                    <h2 className="text-base font-medium text-white tracking-tight">Literature Review</h2>
                 </div>
             </div>

             <div className="flex items-center gap-3">
                 {/* Team Selector */}
                 <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-[160px] h-8 bg-[#151921] border-white/10 text-xs font-medium text-slate-200">
                      <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151921] border-white/10 text-slate-200">
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>

                 {/* Search */}
                 <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search papers, authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-8 bg-[#151921] border-white/10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-teal-500/50 text-xs"
                    />
                 </div>

                 {/* Add Button */}
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-black shadow-lg shadow-teal-500/20 border border-teal-500/50">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Paper
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#0B0E14] border-white/10 text-slate-200">
                      <form onSubmit={handleCreatePaper}>
                        <DialogHeader>
                          <DialogTitle className="text-white">Add Research Paper</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Add a new entry to your team's knowledge base.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                          {/* Metadata Col */}
                          <div className="space-y-4">
                             <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Title</Label>
                                <Input 
                                    placeholder="Paper title" 
                                    value={newPaper.title} 
                                    onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })} 
                                    className="bg-[#000000] border-white/10 text-slate-200"
                                    required 
                                />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Authors</Label>
                                <Input 
                                    placeholder="e.g. Vaswani et al." 
                                    value={newPaper.authors} 
                                    onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })} 
                                    className="bg-[#151921] border-white/10 text-slate-200"
                                />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Links</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="URL" value={newPaper.url} onChange={(e) => setNewPaper({ ...newPaper, url: e.target.value })} className="bg-[#151921] border-white/10 text-slate-200 text-xs" />
                                    <Input placeholder="PDF URL" value={newPaper.pdfUrl} onChange={(e) => setNewPaper({ ...newPaper, pdfUrl: e.target.value })} className="bg-[#151921] border-white/10 text-slate-200 text-xs" />
                                </div>
                             </div>
                          </div>

                          {/* Analysis Col */}
                          <div className="space-y-4">
                             <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Abstract / Summary</Label>
                                <Textarea 
                                    placeholder="Brief summary of findings..." 
                                    value={newPaper.summary} 
                                    onChange={(e) => setNewPaper({ ...newPaper, summary: e.target.value })} 
                                    className="bg-[#151921] border-white/10 text-slate-200 min-h-[140px] resize-none"
                                />
                             </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                          <Button type="submit" disabled={isCreating} className="bg-teal-600 hover:bg-teal-700 text-white">
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Library'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                 </Dialog>
             </div>
        </header>

        {/* --- Content Grid --- */}
        <ScrollArea className="flex-1">
            <div className="container mx-auto px-6 py-8 pb-20">
                {isLoading ? (
                    <PapersLoadingSkeleton />
                ) : filteredPapers.length === 0 ? (
                    <EmptyState onAdd={() => setIsDialogOpen(true)} hasSearch={!!searchQuery} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPapers.map((paper) => (
                            <PaperCard key={paper.id} paper={paper} router={router} />
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

function PaperCard({ paper, router }: { paper: Paper; router: any }) {
    const handleCopyCitation = (e: React.MouseEvent) => {
        e.stopPropagation();
        const citation = `${paper.authors} (${new Date(paper.createdAt).getFullYear()}). "${paper.title}".`;
        navigator.clipboard.writeText(citation);
        toast.success("Citation copied");
    }

    return (
        <Card 
            className="group flex flex-col h-full bg-[#151921] border-white/5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer overflow-hidden relative"
            onClick={() => router.push(`/papers/${paper.id}`)}
        >
            <CardHeader className="pb-3 space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <Badge variant="outline" className="border-white/10 text-slate-500 font-mono text-[10px] bg-[#0B0E14]">
                        {new Date(paper.createdAt).getFullYear()}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-white" onClick={handleCopyCitation} title="Copy Citation">
                            <Quote className="w-3 h-3" />
                         </Button>
                         {paper.url && (
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-teal-400" onClick={(e) => {e.stopPropagation(); window.open(paper.url, '_blank')}}>
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                         )}
                    </div>
                </div>
                
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-slate-100 group-hover:text-teal-400 transition-colors leading-snug line-clamp-2">
                        {paper.title}
                    </CardTitle>
                    <p className="text-xs text-slate-400 font-medium italic truncate">
                        {paper.authors || 'Unknown Authors'}
                    </p>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 pb-4">
                {paper.summary ? (
                    <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed bg-[#0B0E14]/50 p-3 rounded-md border border-white/5">
                        {paper.summary}
                    </p>
                ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-600 bg-[#0B0E14]/30 rounded-lg text-xs italic border border-white/5 border-dashed">
                        No summary provided
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-3 border-t border-white/5 bg-[#0B0E14]/30 mt-auto flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Calendar className="w-3 h-3" />
                    {formatDate(paper.createdAt)}
                </div>
                
                {paper.pdfUrl && (
                    <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors gap-1 pl-1.5 pr-2">
                        <FileText className="w-3 h-3" />
                        <span className="text-[10px] font-medium">PDF</span>
                    </Badge>
                )}
            </CardFooter>
        </Card>
    )
}

function EmptyState({ onAdd, hasSearch }: { onAdd: () => void, hasSearch: boolean }) {
  return (
    <Card className="w-full border-dashed border-2 border-white/10 bg-gradient-to-br from-muted/40 to-transparentmt-8">
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        
        {/* Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-white/5 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          {hasSearch ? (
            <Search className="w-7 h-7 text-slate-500" />
          ) : (
            <BookOpen className="w-7 h-7 text-teal-500/80" />
          )}
        </div>

        {/* Text Content - Removed CardHeader wrapper to fix wrapping issue */}
        <h3 className="text-xl font-medium text-white tracking-tight mb-2">
          {hasSearch ? 'No papers found' : 'Library is empty'}
        </h3>
        
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          {hasSearch 
            ? 'Try adjusting your search filters to find what you are looking for.' 
            : 'Start building your knowledge base by adding relevant research papers.'}
        </p>

        {/* Action Button */}
        {!hasSearch && (
          <Button 
            onClick={onAdd} 
            className="bg-teal-600 hover:bg-teal-700 text-black shadow-lg shadow-teal-500/20 border border-teal-500/50 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Paper
          </Button>
        )}
      </div>
    </Card>
  );
}

function PapersLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[280px] w-full rounded-xl bg-[#151921] border border-white/5" />
            ))}
        </div>
    )
}