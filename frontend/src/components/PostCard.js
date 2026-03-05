import { motion } from 'framer-motion';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import Avatar from './Avatar';
import ReactionButtons from './ReactionButtons';
import { formatTimeAgo, getPostTypeBadge, cn } from '@/lib/utils';

const PostCard = ({ post, onReaction, onClick, compact = false }) => {
  const badge = getPostTypeBadge(post.post_type);
  const totalReactions = (post.reactions?.agree || 0) + 
                         (post.reactions?.interesting || 0) + 
                         (post.reactions?.me_too || 0);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "post-card glass rounded-2xl p-4 cursor-pointer",
        compact && "py-3"
      )}
      data-testid={`post-card-${post.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.author_name} color={post.author_color} size="sm" />
          <div>
            <p className="font-medium text-white text-sm">{post.author_name}</p>
            <p className="text-xs text-slate-500">{formatTimeAgo(post.created_at)}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white mb-2 line-clamp-2">
        {post.title}
      </h3>

      {/* Body Preview */}
      {post.body && !compact && (
        <p className="text-slate-400 text-sm line-clamp-2 mb-3">
          {post.body}
        </p>
      )}

      {/* Poll indicator */}
      {post.post_type === 'poll' && post.poll_options && !compact && (
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
          <span>{post.poll_options.length} options</span>
          {post.poll_closed_at && (
            <span className="text-amber-400">· Closed</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
        <div className="flex items-center gap-4 text-slate-500 text-sm">
          {totalReactions > 0 && (
            <span>{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
          )}
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {post.comment_count}
          </span>
        </div>
        
        {!compact && onReaction && (
          <div onClick={(e) => e.stopPropagation()}>
            <ReactionButtons
              reactions={post.reactions}
              userReaction={post.user_reaction}
              onReaction={(type) => onReaction(post.id, type)}
              compact
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
