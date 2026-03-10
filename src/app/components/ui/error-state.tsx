/**
 * Error State Component
 * 
 * Displays error messages with retry functionality
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import type { APIError } from '@/app/types/api';

interface ErrorStateProps {
  error: APIError | Error | string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = 'Unable to Load Data' }: ErrorStateProps) {
  // Parse error message
  let errorMessage = 'An unexpected error occurred. Please try again.';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if ('message' in error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="p-4 rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 text-center mb-6 max-w-md">
        {errorMessage}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Inline Error Message
 */
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}
