import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Pencil, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import Avatar from '@/components/Avatar';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PersonaRevealScreen = () => {
  const navigate = useNavigate();
  const { user, updatePersona } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchSuggestions();
    }
  }, [user, navigate]);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await axios.get(`${API}/persona/suggestions`, {
        params: { count: 4 }
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const checkAvailability = async (name) => {
    if (!name || name.length < 5) {
      setIsAvailable(false);
      return;
    }
    setIsChecking(true);
    try {
      const response = await axios.get(`${API}/persona/check/${encodeURIComponent(name)}`);
      setIsAvailable(response.data.available);
    } catch (error) {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleEditStart = () => {
    setEditName(user.persona_name);
    setIsEditing(true);
    setIsAvailable(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName('');
    setIsAvailable(true);
  };

  const handleNameChange = (value) => {
    setEditName(value);
    // Debounce availability check
    const timer = setTimeout(() => {
      if (value !== user.persona_name) {
        checkAvailability(value);
      } else {
        setIsAvailable(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleSave = async () => {
    if (!isAvailable || editName.length < 5) {
      toast.error('Please choose a valid, available name (5-30 characters)');
      return;
    }
    
    setIsSaving(true);
    try {
      await updatePersona(editName);
      toast.success('Persona name updated!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSuggestion = async (name) => {
    setIsSaving(true);
    try {
      await updatePersona(name);
      toast.success('Persona name updated!');
      fetchSuggestions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="relative z-10 text-center w-full max-w-sm">
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
          
          {isEditing ? (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  value={editName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  data-testid="edit-persona-input"
                  className="text-center text-2xl font-bold bg-slate-800/50 border-slate-700 text-white h-14"
                  maxLength={30}
                />
                {isChecking && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                )}
              </div>
              
              {editName && editName !== user.persona_name && (
                <p className={`text-sm ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isChecking ? 'Checking...' : isAvailable ? 'Name available!' : 'Name already taken'}
                </p>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="ghost"
                  onClick={handleEditCancel}
                  className="text-slate-400"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isAvailable || editName.length < 5 || isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight persona-reveal">
                {user.persona_name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditStart}
                data-testid="edit-persona-btn"
                className="text-slate-400 hover:text-white"
              >
                <Pencil className="w-5 h-5" />
              </Button>
            </div>
          )}
          
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-4">
            This is your anonymous identity. You can change it now or keep this one.
          </p>
        </motion.div>

        {/* Suggestions */}
        {!isEditing && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <p className="text-slate-500 text-sm">Or choose another name:</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchSuggestions}
                disabled={isLoadingSuggestions}
                className="text-slate-500 hover:text-white h-6 w-6"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectSuggestion(name)}
                  disabled={isSaving}
                  data-testid={`suggestion-${name}`}
                  className="rounded-full border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-white"
                >
                  {name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 w-full"
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
