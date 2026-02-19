import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: string;
  message: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon = '📋', message, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-gray-900 font-semibold text-lg">{message}</p>
      {description && <p className="text-gray-500 text-sm mt-2 max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
