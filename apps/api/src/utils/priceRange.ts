export interface PriceRange {
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  avgLaborCost: number;
  avgPartsCost: number;
  variance: 'low' | 'medium' | 'high';
}

// 참고 가격 데이터 (KRW 기준, 2024년 국내 평균)
export const PRICE_REFERENCE: Record<string, PriceRange> = {
  '브레이크 패드': {
    name: '브레이크 패드',
    category: 'BRAKE',
    minPrice: 80_000,
    maxPrice: 200_000,
    averagePrice: 130_000,
    avgLaborCost: 40_000,
    avgPartsCost: 90_000,
    variance: 'medium',
  },
  '엔진오일 교환': {
    name: '엔진오일 교환',
    category: 'ENGINE_OIL',
    minPrice: 30_000,
    maxPrice: 80_000,
    averagePrice: 50_000,
    avgLaborCost: 10_000,
    avgPartsCost: 40_000,
    variance: 'low',
  },
  '타이어 교체': {
    name: '타이어 교체',
    category: 'TIRE',
    minPrice: 60_000,
    maxPrice: 150_000,
    averagePrice: 90_000,
    avgLaborCost: 15_000,
    avgPartsCost: 75_000,
    variance: 'high',
  },
  '배터리 교체': {
    name: '배터리 교체',
    category: 'BATTERY',
    minPrice: 80_000,
    maxPrice: 180_000,
    averagePrice: 120_000,
    avgLaborCost: 20_000,
    avgPartsCost: 100_000,
    variance: 'medium',
  },
  '점화플러그 교체': {
    name: '점화플러그 교체',
    category: 'ENGINE_OIL',
    minPrice: 50_000,
    maxPrice: 120_000,
    averagePrice: 80_000,
    avgLaborCost: 30_000,
    avgPartsCost: 50_000,
    variance: 'medium',
  },
  '에어필터 교체': {
    name: '에어필터 교체',
    category: 'ENGINE_OIL',
    minPrice: 15_000,
    maxPrice: 40_000,
    averagePrice: 25_000,
    avgLaborCost: 5_000,
    avgPartsCost: 20_000,
    variance: 'low',
  },
  '에어컨 점검': {
    name: '에어컨 점검',
    category: 'COOLING',
    minPrice: 50_000,
    maxPrice: 150_000,
    averagePrice: 90_000,
    avgLaborCost: 30_000,
    avgPartsCost: 60_000,
    variance: 'high',
  },
  '변속기 오일 교환': {
    name: '변속기 오일 교환',
    category: 'TIRE',
    minPrice: 60_000,
    maxPrice: 150_000,
    averagePrice: 100_000,
    avgLaborCost: 20_000,
    avgPartsCost: 80_000,
    variance: 'medium',
  },
  '서스펜션 점검': {
    name: '서스펜션 점검',
    category: 'SUSPENSION',
    minPrice: 100_000,
    maxPrice: 300_000,
    averagePrice: 180_000,
    avgLaborCost: 60_000,
    avgPartsCost: 120_000,
    variance: 'high',
  },
  '와이퍼 교체': {
    name: '와이퍼 교체',
    category: 'ETC',
    minPrice: 10_000,
    maxPrice: 30_000,
    averagePrice: 18_000,
    avgLaborCost: 3_000,
    avgPartsCost: 15_000,
    variance: 'low',
  },
};

export const DEFAULT_PRICE_RANGE: Omit<PriceRange, 'name' | 'category'> = {
  minPrice: 30_000,
  maxPrice: 500_000,
  averagePrice: 150_000,
  avgLaborCost: 50_000,
  avgPartsCost: 100_000,
  variance: 'high',
};

export function findPriceRange(itemName: string): PriceRange | null {
  const normalized = itemName.trim();

  // 정확 매칭
  if (PRICE_REFERENCE[normalized]) return PRICE_REFERENCE[normalized];

  // 부분 매칭 (참고 데이터 키가 입력에 포함되거나 반대)
  const key = Object.keys(PRICE_REFERENCE).find(
    (k) => normalized.includes(k) || k.includes(normalized)
  );

  return key ? PRICE_REFERENCE[key] : null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
