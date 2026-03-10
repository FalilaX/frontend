/**
 * Loading State Component
 * 
 * Displays loading indicators for async data fetching
 */

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <Loader2 className={`${sizeClasses[size]} text-amber-400 animate-spin`} />
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  );
}

/**
 * Inline Loading Spinner
 */
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} text-amber-400 animate-spin`} />
  );
}

/**
 * Skeleton Loader for Cards
 */
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-zinc-800 rounded w-full"></div>
        <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
        <div className="h-3 bg-zinc-800 rounded w-4/6"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for Parameter Cards
 */
export function SkeletonParameter() {
  return (
    <div className="p-4 rounded bg-zinc-800/30 border border-zinc-800 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-zinc-800 rounded w-24"></div>
        <div className="h-6 bg-zinc-800 rounded w-16"></div>
      </div>
      <div className="h-8 bg-zinc-800 rounded w-20 mb-2"></div>
      <div className="h-2 bg-zinc-800 rounded w-full"></div>
    </div>
  );
}
