import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, MessageCircle, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loginDemo } = useUser();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    if (user?.society_id) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    if (user && !user.society_id) {
      navigate('/select-society');
    } else {
      navigate('/login');
    }
  };

  const handleTryDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
      toast.success('Welcome to the demo!');
      navigate('/feed');
    } catch (error) {
      toast.error('Failed to load demo');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen splash-gradient flex flex-col items-center justify-center px-6 relative overflow-hidden"
      data-testid="splash-screen"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Logo & Branding */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
          <Shield className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          SocietySocials
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-sm mx-auto leading-relaxed">
          Your anonymous voice in the community
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 grid grid-cols-3 gap-4 max-w-sm w-full relative z-10"
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-800/50 flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-500">Anonymous</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-800/50 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-500">Community</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-800/50 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs text-slate-500">Honest</span>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 w-full max-w-sm relative z-10 space-y-3"
      >
        <Button
          onClick={handleGetStarted}
          data-testid="get-started-btn"
          className="w-full py-6 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          Get Started
        </Button>
        
        <Button
          onClick={handleTryDemo}
          disabled={isDemoLoading}
          data-testid="try-demo-btn"
          variant="outline"
          className="w-full py-5 text-base font-medium rounded-full bg-transparent border-2 border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-300 hover:text-white transition-all duration-300"
        >
          {isDemoLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Play className="w-4 h-4 mr-2 fill-current" />
              Try Demo
            </>
          )}
        </Button>
        
        <p className="mt-4 text-center text-sm text-slate-600">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
