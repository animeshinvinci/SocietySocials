import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import axios from 'axios';

import PostCard from '@/components/PostCard';
import CreatePostSheet from '@/components/CreatePostSheet';
import BottomNav from '@/components/BottomNav';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const fetchPosts = useCallback(async (showLoader = true) => {
    if (!user?.society_id) return;
    
    if (showLoader) setIsLoading(true);
    try {
      const response = await axios.get(`${API}/posts`, {
        params: {
          society_id: user.society_id,
          user_id: user.id,
          sort
        }
      });
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    toast.success('Post created!');
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await axios.post(`${API}/posts/${postId}/reactions`, 
        { reaction_type: reactionType },
        { params: { user_id: user.id } }
      );
      fetchPosts(false);
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 pb-24"
      data-testid="feed-screen"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-white/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Feed</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="refresh-btn"
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Sort Tabs */}
          <div className="flex gap-2">
            <Button
              variant={sort === 'latest' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSort('latest')}
              data-testid="sort-latest-btn"
              className={`rounded-full ${
                sort === 'latest' 
                  ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Latest
            </Button>
            <Button
              variant={sort === 'popular' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSort('popular')}
              data-testid="sort-popular-btn"
              className={`rounded-full ${
                sort === 'popular' 
                  ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Popular
            </Button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 mb-2">No posts yet</p>
            <p className="text-slate-600 text-sm">Be the first to start a conversation!</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    post={post}
                    onReaction={handleReaction}
                    onClick={() => navigate(`/post/${post.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreatePost(true)}
        data-testid="create-post-fab"
        className="fab-button bottom-24 right-4"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Create Post Sheet */}
      <CreatePostSheet
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Bottom Nav */}
      <BottomNav active="feed" />
    </motion.div>
  );
};

export default FeedScreen;
