'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { experimentsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  FlaskConical, 
  Sparkles, 
  ScrollText, 
  Tags,
  Save,
  Microscope
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';

export default function NewExperimentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    hypothesis: '',
    method: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      toast.error('Team ID is required');
      return;
    }

    setIsCreating(true);
    try {
      const experiment = await experimentsAPI.createExperiment({
        ...formData,
        teamId,
      });
      toast.success('Experiment initialized successfully');
      router.push(`/experiments/${experiment.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create experiment');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 flex flex-col">
      
      {/* 1. Top Navigation Bar */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
               <Microscope className="w-4 h-4" />
               <span>New Experiment</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline-block mr-2">
              Changes are not saved
            </span>
            <Button 
                onClick={handleSubmit} 
                disabled={isCreating} 
                className="shadow-lg shadow-primary/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Initialize Experiment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Layout */}
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Scientific Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title Section */}
            <div className="space-y-4">
              <Label htmlFor="title" className="text-muted-foreground uppercase text-xs tracking-wider font-semibold">
                Experiment Title
              </Label>
              <Input
                id="title"
                placeholder="E.g. Analysis of protein folding structures..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="text-2xl font-bold h-auto py-3 px-0 border-0 border-b rounded-none border-border/50 focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Hypothesis Card */}
            <Card className="border-border/60 shadow-sm bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                    </div>
                    <CardTitle className="text-base">Hypothesis</CardTitle>
                </div>
                <CardDescription>
                  What is the core question or prediction driving this research?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="hypothesis"
                  placeholder="We hypothesize that..."
                  value={formData.hypothesis}
                  onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                  rows={4}
                  className="resize-none bg-muted/30 focus:bg-background transition-colors border-border/50"
                />
              </CardContent>
            </Card>

            {/* Methodology Card */}
            <Card className="border-border/60 shadow-sm bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-teald-500/10 rounded-lg">
                        <ScrollText className="w-4 h-4 text-teald-500" />
                    </div>
                    <CardTitle className="text-base">Methodology</CardTitle>
                </div>
                <CardDescription>
                   Outline the procedures, materials, and protocols to be used.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="method"
                  placeholder="1. Sample preparation..."
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  rows={8}
                  className="resize-none bg-muted/30 focus:bg-background transition-colors border-border/50 font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Metadata & Settings (1/3 width) */}
          <div className="space-y-6">
            
            {/* Context Card */}
             <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-1">
                             <FlaskConical className="w-4 h-4 text-primary" />
                             <span className="text-sm font-medium text-primary">New Entry</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This experiment will be initialized with a status of <strong>Planning</strong>.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Tags Card */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
               <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                 <div className="flex items-center gap-2">
                    <Tags className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Tags & Categories</CardTitle>
                 </div>
               </CardHeader>
               <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-xs">Add Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="e.g. Genomics"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="bg-background"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddTag}
                        size="icon"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="min-h-[100px] p-3 rounded-lg bg-muted/20 border border-border/50">
                     {formData.tags.length === 0 ? (
                         <p className="text-xs text-muted-foreground text-center py-8 opacity-60">
                             No tags added yet.
                         </p>
                     ) : (
                         <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                                <Badge 
                                    key={tag} 
                                    variant="secondary" 
                                    className="pl-2.5 pr-1.5 py-1 bg-background hover:bg-background border-border/60"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1.5 p-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    >{}
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                         </div>
                     )}
                  </div>
               </CardContent>
            </Card>

          </div>
        </form>
      </div>
    </div>
  );
}