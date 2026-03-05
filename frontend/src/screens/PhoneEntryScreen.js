import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

const PhoneEntryScreen = () => {
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const { user, isNew } = await login(mobile);
      
      if (isNew || !user.society_id) {
        navigate('/select-society');
      } else {
        navigate('/feed');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-slate-950 flex flex-col px-6 py-12"
      data-testid="phone-entry-screen"
    >
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8">
            <Phone className="w-8 h-8 text-indigo-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Enter your mobile
          </h1>
          <p className="text-slate-400 mb-8">
            We'll create your anonymous identity
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              +91
            </div>
            <Input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
              data-testid="mobile-input"
              className="pl-14 py-6 text-lg bg-slate-900/50 border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
              maxLength={10}
            />
          </div>

          <Button
            type="submit"
            data-testid="continue-btn"
            disabled={mobile.length !== 10 || isLoading}
            className="w-full py-6 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-xl shadow-indigo-500/20 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-slate-600"
        >
          Your number is hashed and never shared with anyone
        </motion.p>
      </div>
    </motion.div>
  );
};

export default PhoneEntryScreen;
