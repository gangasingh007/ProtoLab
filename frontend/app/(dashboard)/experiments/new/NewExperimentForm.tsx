'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { experimentsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ChevronRight,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function NewExperimentForm() {
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
    <div className="flex h-screen bg-[#171717]/90 text-slate-200 font-sans selection:bg-teal-500/30">
      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#171717]/90">
        
        {/* Header */}
        <header className="h-16 py-3 border-b border-white/5 flex items-center justify-between px-8 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <Button size="icon" variant="ghost" onClick={() => router.back()} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5">
                    <ArrowLeft className="w-4 h-4" />
                 </Button>
                 <div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                       <span onClick={()=>router.push("/")} className="cursor-pointer hover:text-slate-300">Workspace</span> 
                       <ChevronRight className="w-3 h-3" />
                       <span className="text-teal-500">New Protocol</span>
                    </div>
                    <h2 className="text-base font-medium text-white tracking-tight">Initialize Experiment</h2>
                 </div>
             </div>
             
             <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-400 hover:text-white hover:bg-white/5 text-xs">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isCreating} 
                    className="bg-teal-600 hover:bg-teal-700 text-black shadow-lg shadow-teal-500/20 text-xs h-8 border border-teal-500/50"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save className="w-3 h-3 mr-2" />
                            Create Protocol
                        </>
                    )}
                </Button>
             </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-6xl mx-auto w-full pb-20">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Main Form (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Protocol Title</Label>
                        <Input
                            id="title"
                            placeholder="E.g. Analysis of protein folding structures under high heat..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="text-2xl font-bold h-auto py-4 px-2 bg-transparent border-0 border-b border-white/10 rounded bg-transparent placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-teal-500/50 text-white transition-all"
                        />
                    </div>

                    {/* Hypothesis Card */}
                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 border-b border-white/5 ">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5  rounded-md">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                </div>
                                <CardTitle className="text-sm font-semibold text-slate-200">Hypothesis</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Textarea
                                id="hypothesis"
                                placeholder="State the scientific question or expected outcome..."
                                value={formData.hypothesis}
                                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                                rows={4}
                                className="bg-[#0B0E14] border-white/10 text-slate-300 resize-none focus-visible:ring-amber-500/30 min-h-[120px]"
                            />
                        </CardContent>
                    </Card>

                    {/* Methodology Card */}
                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 border-b border-white/5 ">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-500/10 rounded-md">
                                    <ScrollText className="w-4 h-4 text-blue-500" />
                                </div>
                                <CardTitle className="text-sm font-semibold text-slate-200">Methodology</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Textarea
                                id="method"
                                placeholder="1. Step one..."
                                value={formData.method}
                                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                rows={8}
                                className="bg-[#0B0E14] border-white/10 text-slate-300 resize-none focus-visible:ring-blue-500/30 min-h-[200px] font-mono text-sm leading-relaxed"
                            />
                        </CardContent>
                    </Card>

                </div>

                {/* RIGHT COLUMN: Sidebar (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Context Info */}
                    <div className=" rounded-xl border border-white/5 p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-teal-500 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-slate-200">New Protocol Entry</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    This experiment will be initialized in the <strong>Planning</strong> phase. You can add collaborators and link datasets after creation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tags Card */}
                    <Card className="bg-card border-white/5">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Tags className="w-4 h-4 text-slate-500" />
                                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags & Keywords</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    className="h-9 bg-[#0B0E14] border-white/10 text-slate-300 focus-visible:ring-teal-500/30 text-xs"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddTag}
                                    size="sm"
                                    className="h-9 w-9 p-0 bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    <Plus className="w-4 h-4 text-slate-400" />
                                </Button>
                            </div>

                            <div className="min-h-[100px] p-3 rounded-lg bg-black/20 border border-white/5 flex flex-wrap content-start gap-2">
                                {formData.tags.length === 0 ? (
                                    <p className="text-xs text-white/50  w-full text-center py-8">No tags added yet.</p>
                                ) : (
                                    formData.tags.map((tag) => (
                                        <Badge 
                                            key={tag} 
                                            variant="secondary" 
                                            className="bg-[#151921] text-slate-300 border border-white/10 hover:bg-[#1A1D24] pl-2 pr-1 h-6 text-[10px]"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 p-0.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                                            >{}
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </form>
        </div>
      </main>
    </div>
  );
}
