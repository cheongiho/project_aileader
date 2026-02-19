import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn('h-4 bg-gray-200 rounded animate-pulse', className)} />
  );
}

export function Skeleton({ lines = 3, className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <SkeletonLine className="w-1/3 h-6" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bg-white rounded-card shadow-card border border-gray-100 p-4 space-y-3">
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function InlineSkeleton({ className }: { className?: string }) {
  return <div className={cn('h-4 bg-gray-200 rounded animate-pulse', className)} />;
}
