import { cn } from '@/lib/utils';

const Avatar = ({ name, color, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-3xl'
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color || '#6366F1' }}
      data-testid={`avatar-${name}`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
