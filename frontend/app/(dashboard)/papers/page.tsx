'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { papersAPI, teamsAPI } from '@/lib/api';
import { Paper, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  FileText, 
  Loader2, 
  Search, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Link as LinkIcon, 
  Calendar,
  Users,
  Filter
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

  const [newPaper, setNewPaper] = useState({
    title: '',
    authors: '',
    url: '',
    pdfUrl: '',
    summary: '',
    findings: '',
    methodology: '',
    limitations: '',
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
      if (data.length > 0) {
        setSelectedTeam(data[0].id);
      }
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
      const data = await teamsAPI.getTeamPapers(teamId); // Assuming API structure
      setPapers(data);
    } catch (error: any) {
      // toast.error('Failed to load papers'); // Optional: suppress if common on init
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
      setPapers([paper, ...papers]); // Prepend to list
      toast.success('Paper added to library');
      setIsDialogOpen(false);
      setNewPaper({
        title: '',
        authors: '',
        url: '',
        pdfUrl: '',
        summary: '',
        findings: '',
        methodology: '',
        limitations: '',
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
    <div className="flex flex-col h-screen bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Context */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Literature Review</h1>
                <p className="text-xs text-muted-foreground">Manage your team's research library</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-1 md:justify-end">
              
              {/* Team Selector */}
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px] h-9 bg-background/50">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative w-full max-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background/50"
                />
              </div>

              {/* Add Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shadow-md shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Paper
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <form onSubmit={handleCreatePaper}>
                    <DialogHeader>
                      <DialogTitle>Add Research Paper</DialogTitle>
                      <DialogDescription>
                        Enter the details manually or paste a DOI (coming soon).
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                      {/* Left Col: Meta */}
                      <div className="space-y-4">
                         <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Metadata</h4>
                         <div className="space-y-2">
                            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                            <Input id="title" placeholder="e.g. Attention is All You Need" value={newPaper.title} onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })} required />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="authors">Authors</Label>
                            <Input id="authors" placeholder="Vaswani et al." value={newPaper.authors} onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })} />
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="url">Paper URL</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                                    <Input id="url" className="pl-8" placeholder="https://..." value={newPaper.url} onChange={(e) => setNewPaper({ ...newPaper, url: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pdfUrl">PDF Link</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                                    <Input id="pdfUrl" className="pl-8" placeholder=".pdf url" value={newPaper.pdfUrl} onChange={(e) => setNewPaper({ ...newPaper, pdfUrl: e.target.value })} />
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* Right Col: Analysis */}
                      <div className="space-y-4">
                         <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analysis</h4>
                         <div className="space-y-2">
                            <Label htmlFor="summary">Summary</Label>
                            <Textarea id="summary" placeholder="Brief abstract..." rows={3} value={newPaper.summary} onChange={(e) => setNewPaper({ ...newPaper, summary: e.target.value })} className="resize-none" />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="findings">Key Findings</Label>
                            <Textarea id="findings" placeholder="What did they discover?" rows={3} value={newPaper.findings} onChange={(e) => setNewPaper({ ...newPaper, findings: e.target.value })} className="resize-none" />
                         </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Add to Library'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 sm:px-8 py-8">
            {isLoading ? (
                 <PapersLoadingSkeleton />
            ) : filteredPapers.length === 0 ? (
                <EmptyState onAdd={() => setIsDialogOpen(true)} hasSearch={!!searchQuery} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredPapers.map((paper) => (
                        <PaperCard key={paper.id} paper={paper} router={router} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function PaperCard({ paper, router }: { paper: Paper; router: any }) {
    return (
        <Card 
            className="group flex flex-col h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => router.push(`/papers/${paper.id}`)}
        >
            <CardHeader className="pb-3 relative">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="leading-snug text-lg group-hover:text-primary transition-colors line-clamp-2 pr-6">
                    {paper.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="truncate">{paper.authors || 'Unknown Authors'}</span>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 pb-4">
                {paper.summary ? (
                    <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {paper.summary}
                    </p>
                ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/40 bg-muted/20 rounded-lg text-xs italic">
                        No summary provided
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 border-t border-border/50 p-4 bg-muted/20 mt-auto flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(paper.createdAt)}
                </div>
                <div className="flex gap-2">
                    {paper.pdfUrl && (
                         <div 
                            className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors"
                            onClick={(e) => { e.stopPropagation(); window.open(paper.pdfUrl, '_blank') }}
                         >
                            <FileText className="w-3 h-3" />
                            PDF
                        </div>
                    )}
                    {paper.url && (
                        <div 
                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                            onClick={(e) => { e.stopPropagation(); window.open(paper.url, '_blank') }}
                         >
                            <LinkIcon className="w-3 h-3" />
                            Link
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}

function EmptyState({ onAdd, hasSearch }: { onAdd: () => void, hasSearch: boolean }) {
    return (
        <Card className="border-dashed border-2 bg-transparent shadow-none max-w-lg mx-auto mt-12">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    {hasSearch ? <Search className="w-8 h-8 text-muted-foreground" /> : <FileText className="w-8 h-8 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-semibold">{hasSearch ? 'No papers found' : 'Library is empty'}</h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto mb-6">
                    {hasSearch ? 'Try adjusting your search filters.' : 'Start building your knowledge base by adding relevant research papers.'}
                </p>
                {!hasSearch && (
                    <Button onClick={onAdd} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Add First Paper
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

function PapersLoadingSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[240px] rounded-xl" />
                ))}
            </div>
        </div>
    )
}