import { computeJudgement } from '../src/services/judgement.service';

// EstimateItem의 필요한 필드만 포함한 타입 (Prisma 모델 모킹)
type MockItem = {
  id: string;
  estimateId: string;
  name: string;
  category: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  note: string | null;
  createdAt: Date;
};

function makeItem(overrides: Partial<MockItem> & { name: string; totalCost: number }): MockItem {
  return {
    id: `item-${Math.random().toString(36).slice(2)}`,
    estimateId: 'estimate-test',
    category: 'ETC',
    laborCost: 0,
    partsCost: overrides.totalCost,
    note: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('computeJudgement', () => {
  describe('항목별 분류', () => {
    it('금액이 fairMax 이하이면 FAIR로 분류된다', () => {
      // 엔진오일 교환: avg=50,000, max=80,000
      const item = makeItem({ name: '엔진오일 교환', laborCost: 10_000, partsCost: 35_000, totalCost: 45_000 });
      const result = computeJudgement([item as any]);

      expect(result.items[0].resultLabel).toBe('FAIR');
      expect(result.resultLabel).toBe('FAIR');
    });

    it('금액이 fairMax 초과, fairMax*1.2 미만이면 CAUTION으로 분류된다', () => {
      // 엔진오일 교환: max=80,000, max*1.2=96,000
      // 90,000 → max 초과, max*1.2 미만 → CAUTION
      const item = makeItem({ name: '엔진오일 교환', laborCost: 20_000, partsCost: 70_000, totalCost: 90_000 });
      const result = computeJudgement([item as any]);

      expect(result.items[0].resultLabel).toBe('CAUTION');
      expect(result.resultLabel).toBe('CAUTION');
    });

    it('금액이 fairMax*1.2 이상이면 EXCESSIVE로 분류된다', () => {
      // 브레이크 패드: max=200,000, max*1.2=240,000
      // 280,000 → EXCESSIVE
      const item = makeItem({ name: '브레이크 패드', laborCost: 80_000, partsCost: 200_000, totalCost: 280_000 });
      const result = computeJudgement([item as any]);

      expect(result.items[0].resultLabel).toBe('EXCESSIVE');
      expect(result.resultLabel).toBe('EXCESSIVE');
    });
  });

  describe('전체 라벨 결정 규칙', () => {
    it('EXCESSIVE 항목이 1개라도 있으면 전체 라벨은 EXCESSIVE', () => {
      const items = [
        makeItem({ name: '엔진오일 교환', totalCost: 45_000 }), // FAIR
        makeItem({ name: '브레이크 패드', laborCost: 80_000, partsCost: 200_000, totalCost: 280_000 }), // EXCESSIVE
      ];
      const result = computeJudgement(items as any);

      expect(result.resultLabel).toBe('EXCESSIVE');
    });

    it('EXCESSIVE 없고 CAUTION이 1개라도 있으면 전체 라벨은 CAUTION', () => {
      const items = [
        makeItem({ name: '엔진오일 교환', totalCost: 45_000 }), // FAIR
        makeItem({ name: '엔진오일 교환', totalCost: 90_000 }), // CAUTION (max=80k 초과, max*1.2=96k 미만)
      ];
      const result = computeJudgement(items as any);

      expect(result.resultLabel).toBe('CAUTION');
    });

    it('모든 항목이 FAIR이면 전체 라벨은 FAIR', () => {
      const items = [
        makeItem({ name: '엔진오일 교환', totalCost: 45_000 }),
        makeItem({ name: '와이퍼 교체', totalCost: 15_000 }),
      ];
      const result = computeJudgement(items as any);

      expect(result.resultLabel).toBe('FAIR');
    });
  });

  describe('알 수 없는 항목 처리', () => {
    it('참고 데이터가 없는 항목명은 DEFAULT_PRICE_RANGE를 사용하고 예외를 던지지 않는다', () => {
      const item = makeItem({ name: '알 수 없는 특수 수리', totalCost: 100_000 });
      expect(() => computeJudgement([item as any])).not.toThrow();
    });

    it('참고 데이터가 없는 항목은 UNCLEAR_ITEM 태그를 가진다', () => {
      const item = makeItem({ name: '알 수 없는 특수 수리', totalCost: 100_000 });
      const result = computeJudgement([item as any]);

      expect(result.items[0].reasonTags).toContain('UNCLEAR_ITEM');
    });
  });

  describe('confidence 값', () => {
    it('FAIR 판단의 confidence는 0.9', () => {
      const item = makeItem({ name: '엔진오일 교환', totalCost: 45_000 });
      const result = computeJudgement([item as any]);

      expect(result.confidence).toBe(0.9);
    });

    it('CAUTION 판단의 confidence는 0.6', () => {
      const item = makeItem({ name: '엔진오일 교환', totalCost: 90_000 });
      const result = computeJudgement([item as any]);

      expect(result.confidence).toBe(0.6);
    });

    it('EXCESSIVE 판단의 confidence는 0.3', () => {
      const item = makeItem({ name: '브레이크 패드', laborCost: 80_000, partsCost: 200_000, totalCost: 280_000 });
      const result = computeJudgement([item as any]);

      expect(result.confidence).toBe(0.3);
    });
  });

  describe('positionPct', () => {
    it('금액이 범위 내에 있으면 positionPct는 0~100 사이', () => {
      const item = makeItem({ name: '브레이크 패드', totalCost: 130_000 }); // avg
      const result = computeJudgement([item as any]);

      expect(result.items[0].positionPct).toBeGreaterThanOrEqual(0);
      expect(result.items[0].positionPct).toBeLessThanOrEqual(100);
    });

    it('금액이 fairMax를 크게 초과하면 positionPct는 100 초과 가능 (최대 150)', () => {
      const item = makeItem({ name: '브레이크 패드', totalCost: 400_000 }); // 훨씬 초과
      const result = computeJudgement([item as any]);

      expect(result.items[0].positionPct).toBeLessThanOrEqual(150);
    });
  });
});
