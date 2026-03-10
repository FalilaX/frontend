/**
 * Empty State Component
 * 
 * Displays empty state messages when no data is available
 */

import { AlertCircle, CheckCircle2, Droplet, Bell } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'droplet' | 'check' | 'alert' | 'bell';
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'droplet', title, message }: EmptyStateProps) {
  const icons = {
    droplet: <Droplet className="w-8 h-8 text-zinc-600" />,
    check: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
    alert: <AlertCircle className="w-8 h-8 text-amber-600" />,
    bell: <Bell className="w-8 h-8 text-zinc-600" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="p-4 rounded-full bg-zinc-900 mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-base font-medium text-zinc-400 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-zinc-600 text-center max-w-md">
          {message}
        </p>
      )}
    </div>
  );
}
