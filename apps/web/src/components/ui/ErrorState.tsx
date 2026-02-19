import { cn } from '@/lib/cn';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = '오류가 발생했습니다',
  description = '잠시 후 다시 시도해주세요.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <span className="text-5xl mb-4">⚠️</span>
      <p className="text-gray-900 font-semibold text-lg">{message}</p>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
