import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import Avatar from '@/components/Avatar';

const PersonaRevealScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative overflow-hidden"
      data-testid="persona-reveal-screen"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <Avatar
              name={user.persona_name}
              color={user.persona_color}
              size="xl"
              className="w-32 h-32 text-4xl shadow-2xl"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-slate-400 text-lg mb-2">You are</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight persona-reveal">
            {user.persona_name}
          </h1>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            This is your anonymous identity. It's permanent and unique to you.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-sm"
        >
          <Button
            onClick={() => navigate('/feed')}
            data-testid="enter-society-btn"
            className="w-full py-6 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            Enter Society
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PersonaRevealScreen;
