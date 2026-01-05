'use client';

import { useEffect, useState, useRef } from 'react';
import { commentsAPI } from '@/lib/api';
import { Comment } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  MessageCircle,
  Reply
} from 'lucide-react';
import { formatDateTime, getInitials, cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  experimentId: string;
}

export function CommentSection({ experimentId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [experimentId]);

  // Real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join-experiment', experimentId);

      const handleCommentAdded = (comment: Comment) => {
        setComments((prev) => {
            // FIX: Check for duplicates to prevent double rendering if API + Socket both fire
            if (prev.some((c) => c.id === comment.id)) return prev;
            return [...prev, comment];
        });
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      };

      socket.on('comment-added', handleCommentAdded);

      return () => {
        socket.emit('leave-experiment', experimentId);
        socket.off('comment-added', handleCommentAdded);
      };
    }
  }, [socket, isConnected, experimentId]);

  const loadComments = async () => {
    try {
      const data = await commentsAPI.getExperimentComments(experimentId);
      setComments(data);
    } catch (error: any) {
      toast.error('Failed to load discussion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      // 1. Send to API
      const savedComment = await commentsAPI.createComment({
        content: newComment,
        experimentId,
      });
      const commentWithAuthor = {
          ...savedComment,
          author: savedComment.author || {
              id: user?.id,
              name: user?.name || 'Me',
          }
      };
      // @ts-ignore
      setComments((prev) => [...prev, commentWithAuthor]);
      
      setNewComment('');
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error: any) {
      toast.error('Failed to post comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-3 bg-[#151921] rounded-xl border border-white/5">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        <p className="text-sm text-slate-500 animate-pulse">Syncing discussion...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/15 border border-white/5 rounded-xl overflow-hidden shadow-sm">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 ]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-teal-500/10 rounded-md">
             <MessageSquare className="w-4 h-4 text-teal-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            Discussion Thread
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px] border border-white/5">
              {comments.length}
            </span>
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
            <div className={cn(
                "flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all",
                isConnected 
                ? "bg-teal-500/10 text-teal-400 border-teal-500/20" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-teal-500 animate-pulse" : "bg-amber-500")} />
                <span className="uppercase tracking-wider">{isConnected ? 'Live' : 'Connecting'}</span>
            </div>
        </div>
      </div>

      {/* 2. Thread List */}
      <ScrollArea className="flex-1 bg-[#0f1116]/30">
        <div className="p-6 space-y-6">
          {comments.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#151921] border border-white/5 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-300">No discussions yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                Start a conversation about the methodology or results.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMe = user?.id === comment.author?.id;
              
              return (
                <div key={comment.id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Avatar Column */}
                  <Avatar className="w-8 h-8 border border-white/10 mt-1">
                    <AvatarFallback className={cn("text-[10px] font-bold", isMe ? "bg-teal-500/20 text-teal-500" : "bg-[#262626] text-slate-400")}>
                      {comment.author ? getInitials(comment.author.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content Column */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-200">
                                {comment.author?.name || 'Unknown'}
                            </span>
                            {/* Mock Role Badge */}
                            {isMe && <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 border-teal-500/30 text-teal-500 bg-teal-500/5">You</Badge>}
                            <span className="text-[10px] text-slate-500">
                                {formatDateTime(comment.createdAt)}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                            <Reply className="w-3 h-3" />
                        </Button>
                    </div>
                    
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* 3. Input Area */}
      <div className="p-4 border-t border-white/5">
        <form 
          onSubmit={handleSubmit} 
          className="relative group bg-[#0B0E14] border border-white/10 rounded-xl focus-within:border-teal-500/50 focus-within:ring-1 focus-within:ring-teal-500/20 transition-all duration-200"
        >
          <Textarea
            placeholder="Type your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[48px] max-h-[120px] w-full resize-none border-0  shadow-none focus-visible:ring-0 px-4 py-3 text-sm text-white placeholder:text-slate"
            style={{ height: 'auto' }}
          />
          
          <div className="absolute right-2 bottom-2">
              <Button 
                type="submit" 
                size="icon"
                disabled={isSending || !newComment.trim()} 
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200", 
                  newComment.trim() 
                    ? "bg-teal-600 hover:bg-teal-700 text-white" 
                    : "bg-white/5 text-slate-600 hover:bg-white/10"
                )}
              >
                {isSending ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                   <Send className="w-4 h-4" />
                )}
              </Button>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
            <p className="text-[10px] text-slate-500">
                <span className="font-mono text-xs border border-white/10 rounded px-1 py-0.5 bg-white/5 mr-1">Shift + Enter</span> 
                for new line
            </p>
        </div>
      </div>
    </div>
  );
}