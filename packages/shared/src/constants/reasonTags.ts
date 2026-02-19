export const REASON_TAGS = {
  HIGH_PART_PRICE: { severity: 'high' as const },
  HIGH_LABOR: { severity: 'high' as const },
  DUP_LABOR: { severity: 'medium' as const },
  UNNEEDED_REPLACEMENT: { severity: 'high' as const },
  UNCLEAR_ITEM: { severity: 'medium' as const },
  MARKET_VARIANCE: { severity: 'low' as const },
} as const;

export type ReasonTag = keyof typeof REASON_TAGS;
export type ReasonTagSeverity = 'high' | 'medium' | 'low';

export const REASON_TAG_LIST = Object.keys(REASON_TAGS) as ReasonTag[];
