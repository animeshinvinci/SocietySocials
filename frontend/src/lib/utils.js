import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function getPostTypeBadge(postType) {
  switch (postType) {
    case 'discussion':
      return {
        label: 'Discussion',
        className: 'bg-indigo-500/20 text-indigo-400'
      };
    case 'question':
      return {
        label: 'Question',
        className: 'bg-amber-500/20 text-amber-400'
      };
    case 'poll':
      return {
        label: 'Poll',
        className: 'bg-emerald-500/20 text-emerald-400'
      };
    default:
      return {
        label: 'Post',
        className: 'bg-slate-500/20 text-slate-400'
      };
  }
}
