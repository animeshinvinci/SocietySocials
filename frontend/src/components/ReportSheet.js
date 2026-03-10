import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportSheet = ({ open, onClose, onReport }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { value: 'abusive', label: 'Abusive or harassing', description: 'Personal attacks, threats, or bullying' },
    { value: 'spam', label: 'Spam', description: 'Irrelevant or promotional content' },
    { value: 'doxxing', label: 'Revealing identity', description: 'Sharing personal information' },
    { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
    { value: 'other', label: 'Other', description: 'Something else not listed above' }
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      await onReport(selectedReason);
      setSelectedReason(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-3xl"
            data-testid="report-sheet"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Report</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                data-testid="close-report-btn"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4">
              <p className="text-slate-400 text-sm mb-4">
                Why are you reporting this?
              </p>

              <div className="space-y-2">
                {reasons.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedReason(value)}
                    data-testid={`report-reason-${value}`}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      selectedReason === value
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    <p className={`font-medium ${
                      selectedReason === value ? 'text-red-400' : 'text-white'
                    }`}>
                      {label}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                data-testid="submit-report-btn"
                className="w-full py-6 mt-4 rounded-full bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportSheet;
