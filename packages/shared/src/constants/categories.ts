export const REPAIR_CATEGORIES = {
  ENGINE_OIL: { label: '엔진오일', icon: '🔧' },
  BRAKE: { label: '브레이크', icon: '🛑' },
  TIRE: { label: '타이어', icon: '⚙️' },
  SUSPENSION: { label: '서스펜션', icon: '🔩' },
  BATTERY: { label: '배터리', icon: '🔋' },
  COOLING: { label: '냉각/에어컨', icon: '❄️' },
  ELECTRICAL: { label: '전기/전자', icon: '⚡' },
  ETC: { label: '기타', icon: '📋' },
} as const;

export type RepairCategoryKey = keyof typeof REPAIR_CATEGORIES;

export function getCategoryLabel(key: string): string {
  return (REPAIR_CATEGORIES as Record<string, { label: string; icon: string }>)[key]?.label ?? key;
}

export function getCategoryIcon(key: string): string {
  return (REPAIR_CATEGORIES as Record<string, { label: string; icon: string }>)[key]?.icon ?? '📋';
}
