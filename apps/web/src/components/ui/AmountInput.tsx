import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { formatAmountInput, parseAmount } from '@/lib/currency';

interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: number;
  onChange?: (value: number) => void;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ label, error, hint, value, onChange, className, id, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(
      value ? formatAmountInput(String(value)) : ''
    );
    const inputId = id ?? label;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatAmountInput(raw);
      setDisplayValue(formatted);
      const numeric = parseAmount(raw);
      onChange?.(numeric);
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm pr-8 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
              error
                ? 'border-excessive focus:ring-excessive'
                : 'border-gray-300 hover:border-gray-400',
              className
            )}
            {...props}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            원
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-excessive">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
AmountInput.displayName = 'AmountInput';
