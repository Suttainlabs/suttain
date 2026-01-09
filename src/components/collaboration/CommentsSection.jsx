import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Reply, CheckCircle, MoreHorizontal, Trash2, Tag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function CommentsSection({ targetType, targetId, annotationSection = null }) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', targetType, targetId],
    queryFn: () => base44.entities.Comment.filter({ 
      target_type: targetType, 
      target_id: targetId 
    }),
    enabled: !!targetId
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', targetType, targetId]);
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment added');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', targetType, targetId]);
      toast.success('Comment deleted');
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.update(id, { is_resolved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', targetType, targetId]);
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      target_type: targetType,
      target_id: targetId,
      content: newComment,
      parent_id: replyingTo?.id || null,
      author_name: user?.full_name || user?.email,
      annotation: annotationSection ? { section: annotationSection } : null
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-slate-600" />
        <span className="font-medium text-sm text-slate-700">
          Comments ({comments.length})
        </span>
      </div>

      {/* Comment Input */}
      <div className="space-y-2">
        {replyingTo && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
            <Reply className="w-3 h-3" />
            Replying to {replyingTo.author_name}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-5 px-1 ml-auto"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment or annotation..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        <AnimatePresence>
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={() => setReplyingTo(comment)}
              onDelete={() => deleteCommentMutation.mutate(comment.id)}
              onResolve={() => resolveCommentMutation.mutate(comment.id)}
              isOwner={comment.created_by === user?.email}
              user={user}
            />
          ))}
        </AnimatePresence>
      </div>

      {comments.length === 0 && !isLoading && (
        <p className="text-center text-sm text-slate-400 py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}

function CommentItem({ comment, replies, onReply, onDelete, onResolve, isOwner, user }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${comment.is_resolved ? 'opacity-60' : ''}`}
    >
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs">
            {comment.author_name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-slate-900">
                {comment.author_name}
              </span>
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
              </span>
              {comment.annotation?.section && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Tag className="w-3 h-3" />
                  {comment.annotation.section}
                </Badge>
              )}
              {comment.is_resolved && (
                <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 mt-1 ml-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onReply}
              className="h-6 text-xs text-slate-500"
            >
              <Reply className="w-3 h-3 mr-1" /> Reply
            </Button>
            {(isOwner || user?.role === 'admin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {!comment.is_resolved && (
                    <DropdownMenuItem onClick={onResolve}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 ml-4 space-y-3 border-l-2 border-slate-200 pl-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-xs">
                      {reply.author_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs text-slate-900">
                          {reply.author_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}