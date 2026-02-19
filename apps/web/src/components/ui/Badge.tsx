import { cn } from '@/lib/cn';

type BadgeVariant = 'FAIR' | 'CAUTION' | 'EXCESSIVE' | 'default' | 'info';

const variantMap: Record<BadgeVariant, string> = {
  FAIR: 'bg-fair-light text-fair border border-fair-border',
  CAUTION: 'bg-caution-light text-caution border border-caution-border',
  EXCESSIVE: 'bg-excessive-light text-excessive border border-excessive-border',
  default: 'bg-gray-100 text-gray-700 border border-gray-200',
  info: 'bg-brand-50 text-brand border border-brand-100',
};

const labelMap: Record<BadgeVariant, string> = {
  FAIR: '적정',
  CAUTION: '주의',
  EXCESSIVE: '과다',
  default: '-',
  info: '정보',
};

interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant = 'default', label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
        variantMap[variant],
        className
      )}
    >
      {label ?? labelMap[variant]}
    </span>
  );
}
