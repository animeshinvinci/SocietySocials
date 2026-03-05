import { ThumbsUp, Lightbulb, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReactionButtons = ({ reactions, userReaction, onReaction, compact = false }) => {
  const reactionTypes = [
    { 
      type: 'agree', 
      icon: ThumbsUp, 
      label: 'Agree',
      activeClass: 'reaction-agree active',
      inactiveClass: 'reaction-agree'
    },
    { 
      type: 'interesting', 
      icon: Lightbulb, 
      label: 'Interesting',
      activeClass: 'reaction-interesting active',
      inactiveClass: 'reaction-interesting'
    },
    { 
      type: 'me_too', 
      icon: Users, 
      label: 'Me Too',
      activeClass: 'reaction-me-too active',
      inactiveClass: 'reaction-me-too'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {reactionTypes.map(({ type, icon: Icon }) => {
          const isActive = userReaction === type;
          const count = reactions?.[type] || 0;
          
          return (
            <button
              key={type}
              onClick={() => onReaction(type)}
              data-testid={`reaction-${type}`}
              className={cn(
                'p-2 rounded-full transition-all',
                isActive 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {reactionTypes.map(({ type, icon: Icon, label, activeClass, inactiveClass }) => {
        const isActive = userReaction === type;
        const count = reactions?.[type] || 0;
        
        return (
          <button
            key={type}
            onClick={() => onReaction(type)}
            data-testid={`reaction-${type}`}
            className={cn(
              'reaction-btn',
              isActive ? activeClass : inactiveClass
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionButtons;
