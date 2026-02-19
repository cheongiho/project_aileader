const KRW = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

export function formatKRW(amount: number): string {
  return KRW.format(amount);
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

export function formatRange(min: number, max: number): string {
  return `${formatNumber(min)}원 ~ ${formatNumber(max)}원`;
}

export function parseAmount(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
}

export function formatAmountInput(value: string): string {
  const numeric = value.replace(/[^0-9]/g, '');
  if (!numeric) return '';
  return parseInt(numeric, 10).toLocaleString('ko-KR');
}
