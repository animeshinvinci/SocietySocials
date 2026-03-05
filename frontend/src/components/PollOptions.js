import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PollOptions = ({ 
  options, 
  userVotedOption, 
  pollVisibility, 
  pollClosed, 
  onVote 
}) => {
  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
  const hasVoted = !!userVotedOption;
  const showResults = pollVisibility === 'realtime' || pollClosed || hasVoted;

  return (
    <div className="space-y-2" data-testid="poll-options">
      {options.map((option) => {
        const isSelected = userVotedOption === option.id;
        const percentage = totalVotes > 0 
          ? Math.round((option.vote_count / totalVotes) * 100) 
          : 0;

        return (
          <button
            key={option.id}
            onClick={() => !hasVoted && !pollClosed && onVote(option.id)}
            disabled={hasVoted || pollClosed}
            data-testid={`poll-option-${option.id}`}
            className={cn(
              'poll-option w-full text-left px-4 py-3',
              isSelected && 'selected',
              (hasVoted || pollClosed) && 'cursor-default'
            )}
          >
            {/* Progress bar */}
            {showResults && (
              <div 
                className="progress-bar"
                style={{ width: `${percentage}%` }}
              />
            )}
            
            {/* Content */}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className={cn(
                  'text-sm',
                  isSelected ? 'text-white font-medium' : 'text-slate-300'
                )}>
                  {option.option_text}
                </span>
              </div>
              
              {showResults && (
                <span className="text-sm text-slate-400">
                  {percentage}%
                </span>
              )}
            </div>
          </button>
        );
      })}
      
      {showResults && (
        <p className="text-xs text-slate-500 text-center mt-2">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default PollOptions;
