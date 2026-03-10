import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, HelpCircle, BarChart3, Plus, Minus, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CreatePostSheet = ({ open, onClose, onPostCreated }) => {
  const [postType, setPostType] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollVisibility, setPollVisibility] = useState('realtime');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const postTypes = [
    { 
      type: 'discussion', 
      icon: MessageSquare, 
      label: 'Start a Discussion',
      description: 'Share thoughts or updates'
    },
    { 
      type: 'question', 
      icon: HelpCircle, 
      label: 'Ask a Question',
      description: 'Get help from neighbors'
    },
    { 
      type: 'poll', 
      icon: BarChart3, 
      label: 'Create a Poll',
      description: 'Gather community opinions'
    }
  ];

  const handleReset = () => {
    setPostType(null);
    setTitle('');
    setBody('');
    setPollOptions(['', '']);
    setPollVisibility('realtime');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('At least 2 poll options are required');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        post_type: postType,
        title: title.trim(),
        body: body.trim() || null,
        poll_options: postType === 'poll' ? pollOptions.filter(o => o.trim()) : null,
        poll_visibility: postType === 'poll' ? pollVisibility : 'realtime'
      };

      const response = await axios.post(`${API}/posts`, payload, {
        params: { user_id: user.id }
      });

      onPostCreated(response.data);
      handleReset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
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
            className="fixed inset-0 bg-black/60 z-[60]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-auto pb-safe"
            data-testid="create-post-sheet"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">
                {postType ? 'Create Post' : 'New Post'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                data-testid="close-sheet-btn"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4">
              {!postType ? (
                /* Post Type Selection */
                <div className="space-y-3">
                  {postTypes.map(({ type, icon: Icon, label, description }) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      data-testid={`select-${type}`}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{label}</p>
                        <p className="text-sm text-slate-400">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Post Form */
                <div className="space-y-4">
                  {/* Back button */}
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="text-slate-400 hover:text-white -ml-2"
                  >
                    ← Change type
                  </Button>

                  {/* Title */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Title <span className="text-slate-500">({title.length}/200)</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                      placeholder={
                        postType === 'question' 
                          ? 'What would you like to ask?' 
                          : postType === 'poll'
                          ? 'What do you want to poll about?'
                          : "What's on your mind?"
                      }
                      data-testid="post-title-input"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Body (optional for discussion/question) */}
                  {postType !== 'poll' && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">
                        Details (optional) <span className="text-slate-500">({body.length}/1000)</span>
                      </Label>
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value.slice(0, 1000))}
                        placeholder="Add more context..."
                        data-testid="post-body-input"
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                      />
                    </div>
                  )}

                  {/* Poll Options */}
                  {postType === 'poll' && (
                    <>
                      <div>
                        <Label className="text-slate-300 mb-2 block">
                          Options ({pollOptions.length}/4)
                        </Label>
                        <div className="space-y-2">
                          {pollOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value.slice(0, 100))}
                                placeholder={`Option ${index + 1}`}
                                data-testid={`poll-option-input-${index}`}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                              />
                              {pollOptions.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveOption(index)}
                                  className="text-slate-400 hover:text-red-400 shrink-0"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {pollOptions.length < 4 && (
                          <Button
                            variant="ghost"
                            onClick={handleAddOption}
                            data-testid="add-option-btn"
                            className="mt-2 text-indigo-400 hover:text-indigo-300"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Option
                          </Button>
                        )}
                      </div>

                      {/* Poll Visibility */}
                      <div>
                        <Label className="text-slate-300 mb-2 block">
                          Result Visibility
                        </Label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPollVisibility('realtime')}
                            data-testid="visibility-realtime"
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                              pollVisibility === 'realtime'
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">Real-time</span>
                          </button>
                          <button
                            onClick={() => setPollVisibility('on_close')}
                            data-testid="visibility-on-close"
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                              pollVisibility === 'on_close'
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <EyeOff className="w-4 h-4" />
                            <span className="text-sm">On Close</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {pollVisibility === 'realtime' 
                            ? 'Voters see results immediately'
                            : 'Results revealed when you close the poll'}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pb-8">
                    <Button
                      onClick={handleSubmit}
                      disabled={!title.trim() || isSubmitting}
                      data-testid="submit-post-btn"
                      className="w-full py-6 mt-4 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Post'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostSheet;
