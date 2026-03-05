import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ChevronRight, Loader2, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import axios from 'axios';

import Avatar from '@/components/Avatar';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import CreatePostSheet from '@/components/CreatePostSheet';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfileScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`${API}/users/${user.id}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    toast.success('Post created!');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 pb-24"
      data-testid="profile-screen"
    >
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.persona_name} color={user.persona_color} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white" data-testid="persona-name">
              {user.persona_name}
            </h1>
            <p className="text-slate-400 text-sm">Your anonymous identity</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-4 mb-6">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{posts.length}</p>
                <p className="text-slate-500 text-sm">Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => setShowLogoutDialog(true)}
          data-testid="logout-btn"
          className="w-full justify-between py-4 px-4 bg-slate-900/50 hover:bg-slate-800/50 rounded-xl text-red-400 hover:text-red-300"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* User Posts */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-white mb-4">Your Posts</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400">You haven't posted anything yet</p>
            <Button
              onClick={() => setShowCreatePost(true)}
              data-testid="create-first-post-btn"
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first post
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/post/${post.id}`)}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Logout?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You'll need to enter your mobile number again to log back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Post Sheet */}
      <CreatePostSheet
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Bottom Nav */}
      <BottomNav active="profile" />
    </motion.div>
  );
};

export default ProfileScreen;
