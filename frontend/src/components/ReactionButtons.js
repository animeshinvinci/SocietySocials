import { ThumbsUp, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReactionButtons = ({ reactions, userReaction, onReaction, compact = false }) => {
  const reactionTypes = [
    { 
      type: 'agree', 
      icon: ThumbsUp, 
      label: 'Like',
      activeClass: 'reaction-agree active',
      inactiveClass: 'reaction-agree'
    },
    { 
      type: 'me_too', 
      icon: Heart, 
      label: 'Relate',
      activeClass: 'reaction-me-too active',
      inactiveClass: 'reaction-me-too'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {reactionTypes.map(({ type, icon: Icon }) => {
          const isActive = userReaction === type;
          
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
              <Icon className={cn("w-4 h-4", isActive && type === 'me_too' && "fill-current")} />
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
            <Icon className={cn("w-4 h-4", isActive && type === 'me_too' && "fill-current")} />
            <span>{label}</span>
            {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionButtons;
