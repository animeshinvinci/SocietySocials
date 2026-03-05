import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, MapPin, Users, ChevronRight, Loader2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SocietySelectScreen = () => {
  const [search, setSearch] = useState('');
  const [societies, setSocieties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', locality: '', city: '', total_units: '' });
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, selectSociety } = useUser();

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async (query = '') => {
    try {
      const response = await axios.get(`${API}/societies`, {
        params: query ? { search: query } : {}
      });
      setSocieties(response.data);
    } catch (error) {
      toast.error('Failed to load societies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchSocieties(value);
  };

  const handleSelect = (society) => {
    setSelected(selected?.id === society.id ? null : society);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    
    setIsSubmitting(true);
    try {
      await selectSociety(selected.id);
      navigate('/persona-reveal');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to select society');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSubmit = async () => {
    if (!requestForm.name || !requestForm.locality || !requestForm.city) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsRequestSubmitting(true);
    try {
      await axios.post(`${API}/societies/request`, {
        name: requestForm.name,
        locality: requestForm.locality,
        city: requestForm.city,
        total_units: requestForm.total_units ? parseInt(requestForm.total_units) : null
      }, {
        params: user ? { user_id: user.id } : {}
      });
      toast.success('Request submitted! Admin will review and add your society.');
      setShowRequestForm(false);
      setRequestForm({ name: '', locality: '', city: '', total_units: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsRequestSubmitting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-950 flex flex-col"
      data-testid="society-select-screen"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            Select your society
          </h1>
          <p className="text-slate-400 text-sm">
            Choose the community you belong to
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search societies..."
            data-testid="society-search"
            className="pl-12 py-5 bg-slate-900/50 border-slate-800 rounded-xl text-white placeholder:text-slate-600"
          />
        </motion.div>
      </div>

      {/* Society List */}
      <ScrollArea className="flex-1 px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : societies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 mb-4">No societies found</p>
            <Button
              onClick={() => setShowRequestForm(true)}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request New Society
            </Button>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3 pb-32"
          >
            {/* Request New Society Card */}
            <motion.div
              variants={item}
              onClick={() => setShowRequestForm(true)}
              data-testid="request-society-card"
              className="society-card cursor-pointer border-dashed hover:border-indigo-500/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-indigo-400">Can't find your society?</p>
                  <p className="text-sm text-slate-500">Request to add it</p>
                </div>
              </div>
            </motion.div>

            {societies.map((society) => (
              <motion.div
                key={society.id}
                variants={item}
                onClick={() => handleSelect(society)}
                data-testid={`society-card-${society.id}`}
                className={`society-card cursor-pointer ${
                  selected?.id === society.id ? 'selected' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {society.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{society.locality}, {society.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{society.total_units} units</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected?.id === society.id 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-slate-700'
                  }`}>
                    {selected?.id === society.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </ScrollArea>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <Button
          onClick={handleConfirm}
          disabled={!selected || isSubmitting}
          data-testid="confirm-society-btn"
          className="w-full py-6 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-xl shadow-indigo-500/20 transition-all duration-300"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Confirm Society
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Request New Society Dialog */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Request New Society</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-slate-300">Society Name *</Label>
              <Input
                value={requestForm.name}
                onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                placeholder="e.g., Prestige Lakeside"
                data-testid="request-name-input"
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Locality *</Label>
              <Input
                value={requestForm.locality}
                onChange={(e) => setRequestForm({ ...requestForm, locality: e.target.value })}
                placeholder="e.g., Whitefield"
                data-testid="request-locality-input"
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">City *</Label>
              <Input
                value={requestForm.city}
                onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })}
                placeholder="e.g., Bengaluru"
                data-testid="request-city-input"
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Total Units (optional)</Label>
              <Input
                type="number"
                value={requestForm.total_units}
                onChange={(e) => setRequestForm({ ...requestForm, total_units: e.target.value })}
                placeholder="e.g., 500"
                data-testid="request-units-input"
                className="mt-1 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button
              onClick={handleRequestSubmit}
              disabled={isRequestSubmitting}
              data-testid="submit-request-btn"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isRequestSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Submit Request'
              )}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Your request will be reviewed by admin before the society is added.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SocietySelectScreen;
