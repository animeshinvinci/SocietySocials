import { useNavigate } from 'react-router-dom';
import { Home, User } from 'lucide-react';

const BottomNav = ({ active }) => {
  const navigate = useNavigate();

  const items = [
    { id: 'feed', icon: Home, label: 'Feed', path: '/feed' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="bottom-nav pb-safe" data-testid="bottom-nav">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              data-testid={`nav-${item.id}`}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-indigo-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
