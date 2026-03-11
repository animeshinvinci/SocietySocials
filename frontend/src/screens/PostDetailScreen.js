import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreHorizontal, Send, Loader2, MessageCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import axios from 'axios';
import { track } from '@/lib/amplitude';

import Avatar from '@/components/Avatar';
import ReactionButtons from '@/components/ReactionButtons';
import PollOptions from '@/components/PollOptions';
import ReportSheet from '@/components/ReportSheet';
import { formatTimeAgo, getPostTypeBadge } from '@/lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PostDetailScreen = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchPost(true);
    fetchComments();
  }, [postId]);

  const fetchPost = async (isInitial = false) => {
    try {
      const response = await axios.get(`${API}/posts/${postId}`, {
        params: { user_id: user.id }
      });
      setPost(response.data);
      if (isInitial) track('Post Viewed', { post_id: postId, post_type: response.data.post_type });
    } catch (error) {
      toast.error('Post not found');
      navigate('/feed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      await axios.post(`${API}/posts/${postId}/reactions`,
        { reaction_type: reactionType },
        { params: { user_id: user.id } }
      );
      track('Reaction Added', { post_id: postId, reaction_type: reactionType });
      fetchPost();
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleVote = async (optionId) => {
    try {
      await axios.post(`${API}/posts/${postId}/votes`, 
        { option_id: optionId },
        { params: { user_id: user.id } }
      );
      track('Poll Voted', { post_id: postId, option_id: optionId });
      fetchPost();
      toast.success('Vote recorded!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to vote');
    }
  };

  const handleClosePoll = async () => {
    try {
      await axios.post(`${API}/posts/${postId}/close-poll`, null, {
        params: { user_id: user.id }
      });
      track('Poll Closed', { post_id: postId });
      fetchPost();
      toast.success('Poll closed!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to close poll');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/posts/${postId}/comments`, 
        { body: newComment },
        { params: { user_id: user.id } }
      );
      track('Comment Submitted', { post_id: postId });
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async (reason) => {
    try {
      await axios.post(`${API}/reports`, 
        { target_type: 'post', target_id: postId, reason },
        { params: { user_id: user.id } }
      );
      track('Content Reported', { post_id: postId, reason });
      toast.success("Thanks, we'll review this");
      setShowReport(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to report');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const badge = getPostTypeBadge(post.post_type);
  const canClosePoll = post.post_type === 'poll' && 
                       post.author_id === user.id && 
                       !post.poll_closed_at;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 flex flex-col"
      data-testid="post-detail-screen"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            data-testid="back-btn"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <span className="text-white font-medium">Post</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="post-menu-btn"
                className="text-slate-400 hover:text-white"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem 
                onClick={() => setShowReport(true)}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                Report Post
              </DropdownMenuItem>
              {canClosePoll && (
                <DropdownMenuItem 
                  onClick={handleClosePoll}
                  className="text-amber-400 focus:text-amber-400 focus:bg-amber-500/10"
                >
                  Close Poll
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Post Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={post.author_name} color={post.author_color} size="md" />
            <div>
              <p className="font-medium text-white">{post.author_name}</p>
              <p className="text-xs text-slate-500">{formatTimeAgo(post.created_at)}</p>
            </div>
            <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {/* Title & Body */}
          <h1 className="text-xl font-semibold text-white mb-3" data-testid="post-title">
            {post.title}
          </h1>
          {post.body && (
            <p className="text-slate-300 leading-relaxed mb-4" data-testid="post-body">
              {post.body}
            </p>
          )}

          {/* Poll Options */}
          {post.post_type === 'poll' && post.poll_options && (
            <div className="mb-6">
              {post.poll_closed_at && (
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-3">
                  <Lock className="w-4 h-4" />
                  Poll closed
                </div>
              )}
              <PollOptions
                options={post.poll_options}
                userVotedOption={post.user_voted_option}
                pollVisibility={post.poll_visibility}
                pollClosed={!!post.poll_closed_at}
                onVote={handleVote}
              />
            </div>
          )}

          {/* Reactions */}
          <div className="border-t border-slate-800/50 pt-4 mb-6">
            <ReactionButtons
              reactions={post.reactions}
              userReaction={post.user_reaction}
              onReaction={handleReaction}
            />
          </div>

          {/* Comments Section */}
          <div className="border-t border-slate-800/50 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-white">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>

            {comments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                    <Avatar name={comment.author_name} color={comment.author_color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">{comment.author_name}</span>
                        <span className="text-xs text-slate-500">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{comment.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="sticky bottom-0 p-4 bg-slate-950/90 backdrop-blur-lg border-t border-white/5">
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            data-testid="comment-input"
            className="flex-1 bg-slate-900/50 border-slate-800 rounded-xl text-white placeholder:text-slate-600"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            data-testid="submit-comment-btn"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Report Sheet */}
      <ReportSheet
        open={showReport}
        onClose={() => setShowReport(false)}
        onReport={handleReport}
      />
    </motion.div>
  );
};

export default PostDetailScreen;
