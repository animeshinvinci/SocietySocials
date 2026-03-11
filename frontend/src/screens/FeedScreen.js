import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Clock, RefreshCw, Loader2, MessageSquare, HelpCircle, BarChart3, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import axios from 'axios';
import { track } from '@/lib/amplitude';

import PostCard from '@/components/PostCard';
import CreatePostSheet from '@/components/CreatePostSheet';
import BottomNav from '@/components/BottomNav';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('latest');
  const [postTypeFilter, setPostTypeFilter] = useState(null);
  const [includeDummy, setIncludeDummy] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const navigate = useNavigate();
  const { user, currentSociety, isViewingDemo, viewDemoSociety, returnToOwnSociety } = useUser();

  const fetchPosts = useCallback(async (showLoader = true) => {
    if (!user?.society_id) return;
    
    if (showLoader) setIsLoading(true);
    try {
      const params = {
        society_id: user.society_id,
        user_id: user.id,
        sort,
        include_dummy: includeDummy
      };
      if (postTypeFilter) {
        params.post_type = postTypeFilter;
      }
      const response = await axios.get(`${API}/posts`, { params });
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, sort, postTypeFilter, includeDummy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (user?.society_id) {
      track('Feed Viewed', { society_id: user.society_id, is_demo: isViewingDemo });
    }
  }, []); // eslint-disable-line

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts(false);
  };

  const handlePostCreated = (newPost) => {
    track('Post Created', { post_type: newPost.post_type });
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
      track('Reaction Added', { post_id: postId, reaction_type: reactionType });
      fetchPosts(false);
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleViewDemo = async () => {
    try {
      await viewDemoSociety();
      track('Demo Society Viewed');
      toast.success('Viewing demo society');
    } catch (error) {
      toast.error('Failed to load demo');
    }
  };

  const handleReturnToOwn = async () => {
    await returnToOwnSociety();
    toast.success('Back to your society');
  };

  const postTypeFilters = [
    { value: null, label: 'All', icon: null },
    { value: 'discussion', label: 'Discussions', icon: MessageSquare },
    { value: 'question', label: 'Questions', icon: HelpCircle },
    { value: 'poll', label: 'Polls', icon: BarChart3 }
  ];

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
          {/* Society Name & Demo Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isViewingDemo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReturnToOwn}
                  data-testid="back-to-own-btn"
                  className="text-slate-400 hover:text-white -ml-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white" data-testid="society-name">
                    {currentSociety?.name || 'Feed'}
                  </h1>
                  {currentSociety?.total_units && (
                    <span className="text-xs text-slate-500">{currentSociety.total_units} units</span>
                  )}
                </div>
                {isViewingDemo && (
                  <span className="text-xs text-amber-400">Viewing Demo</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isViewingDemo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewDemo}
                  data-testid="view-demo-btn"
                  className="text-indigo-400 hover:text-indigo-300 text-xs"
                >
                  View Demo
                </Button>
              )}
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
          </div>

          {/* Back to Own Society Banner */}
          {isViewingDemo && (
            <div 
              onClick={handleReturnToOwn}
              className="mb-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/20 transition-colors"
              data-testid="back-to-society-banner"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-400 text-sm font-medium">You're viewing Demo Society</p>
                  <p className="text-slate-400 text-xs">Tap to go back to your society</p>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          )}

          {/* Sort Tabs */}
          <div className="flex gap-2 mb-3">
            <Button
              variant={sort === 'latest' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setSort('latest'); track('Feed Sort Changed', { sort: 'latest' }); }}
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
              onClick={() => { setSort('popular'); track('Feed Sort Changed', { sort: 'popular' }); }}
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

          {/* Post Type Filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {postTypeFilters.map(({ value, label, icon: Icon }) => (
              <Button
                key={label}
                variant={postTypeFilter === value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setPostTypeFilter(value); track('Feed Filter Changed', { filter: value || 'all' }); }}
                data-testid={`filter-${value || 'all'}`}
                className={`rounded-full shrink-0 ${
                  postTypeFilter === value 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 mr-1" />}
                {label}
              </Button>
            ))}
            
            {/* Dummy Filter */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIncludeDummy(!includeDummy)}
              data-testid="toggle-dummy-btn"
              className={`rounded-full shrink-0 ml-auto ${
                includeDummy 
                  ? 'text-slate-500 hover:text-white' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {includeDummy ? <Eye className="w-3.5 h-3.5 mr-1" /> : <EyeOff className="w-3.5 h-3.5 mr-1" />}
              {includeDummy ? 'Hide Samples' : 'Showing Real'}
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
      {!isViewingDemo && (
        <button
          onClick={() => setShowCreatePost(true)}
          data-testid="create-post-fab"
          className="fab-button bottom-24 right-4"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}

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
