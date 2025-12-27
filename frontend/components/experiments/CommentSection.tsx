'use client';

import { useEffect, useState, useRef } from 'react';
import { commentsAPI } from '@/lib/api';
import { Comment } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  MessageCircle 
} from 'lucide-react';
import { formatDateTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
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
  
  // Ref for auto-scrolling to bottom of chat
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [experimentId]);

  // Real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join-experiment', experimentId);

      const handleCommentAdded = (comment: Comment) => {
        setComments((prev) => [...prev, comment]);
        // Optional: Scroll to bottom on new message
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      };

      const handleCommentUpdated = (updatedComment: Comment) => {
        setComments((prev) =>
          prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
        );
      };

      const handleCommentDeleted = ({ commentId }: { commentId: string }) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      };

      socket.on('comment-added', handleCommentAdded);
      socket.on('comment-updated', handleCommentUpdated);
      socket.on('comment-deleted', handleCommentDeleted);

      return () => {
        socket.emit('leave-experiment', experimentId);
        socket.off('comment-added', handleCommentAdded);
        socket.off('comment-updated', handleCommentUpdated);
        socket.off('comment-deleted', handleCommentDeleted);
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
      await commentsAPI.createComment({
        content: newComment,
        experimentId,
      });
      setNewComment('');
      // Scroll to bottom after sending
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post comment');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading discussion...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border border-border/60 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Discussion Thread
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              {comments.length}
            </span>
          </h3>
        </div>
        
        {/* Connection Status Indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
               <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-colors border",
                  isConnected 
                    ? "bg-teald-500/10 text-teald-600 border-teald-500/20" 
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isConnected ? 'Live' : 'Connecting'}</span>
               </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Real-time collaboration is {isConnected ? 'active' : 'inactive'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Comments List Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No discussions yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Start a conversation about the methodology or results.
            </p>
          </div>
        ) : (
          comments.map((comment, index) => {
             const isMe = user?.id === comment.author?.id; // Assuming user object has id
             return (
              <div 
                key={comment.id} 
                className={cn(
                  "flex gap-3 max-w-[85%]", 
                  isMe ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <Avatar className="w-8 h-8 border border-border/50 shadow-sm mt-1">
                  <AvatarImage src="https://static.vecteezy.com/system/resources/thumbnails/015/407/577/small/doctor-round-avatar-medicine-flat-avatar-with-male-doctor-medical-clinic-team-round-icon-medical-collection-illustration-vector.jpg" />
                  <AvatarFallback className={cn("text-[10px]", isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {comment.author ? getInitials(comment.author.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "group flex flex-col space-y-1", 
                  isMe ? "items-end" : "items-start"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground/80">
                      {comment.author?.name || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed",
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 border border-border/50 rounded-tl-none"
                  )}>
                    {comment.content}
                  </div>
                </div>
              </div>
             )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border/50">
        <form 
          onSubmit={handleSubmit} 
          className="relative flex items-end gap-2 p-2 rounded-xl border border-border/60 bg-muted/20 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-200"
        >
          <Textarea
            placeholder="Type your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            className="min-h-[40px] max-h-[120px] w-full resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-3 py-2.5 text-sm"
            style={{ height: 'auto' }}
            // Auto-resize logic would typically go here
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={isSending || !newComment.trim()} 
            className={cn(
              "h-8 w-8 mb-1 transition-all rounded-lg", 
              newComment.trim() ? "opacity-100 scale-100" : "opacity-50 scale-90"
            )}
          >
            {isSending ? (
               <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
               <Send className="w-4 h-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
          <strong>Shift + Enter</strong> for new line
        </p>
      </div>
    </div>
  );
}