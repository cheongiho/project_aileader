import { EstimateItem, Judgement, ResultLabel } from '@prisma/client';
import { findPriceRange, DEFAULT_PRICE_RANGE, clamp } from '../utils/priceRange';

export interface JudgementItemResult {
  estimateItemId: string;
  fairMin: number;
  fairMax: number;
  myPrice: number;
  positionPct: number;
  resultLabel: ResultLabel;
  reasonTags: string[];
  notes: string | null;
}

export interface JudgementComputeResult {
  resultLabel: ResultLabel;
  confidence: number;
  overallScore: number;
  summary: string;
  badges: string[];
  items: JudgementItemResult[];
}

function classifyItem(myPrice: number, fairMax: number): ResultLabel {
  if (myPrice >= fairMax * 1.2) return 'EXCESSIVE';
  if (myPrice > fairMax) return 'CAUTION';
  return 'FAIR';
}

function assignReasonTags(
  item: EstimateItem,
  ref: ReturnType<typeof findPriceRange> | typeof DEFAULT_PRICE_RANGE,
  label: ResultLabel
): string[] {
  const tags: string[] = [];

  if (!findPriceRange(item.name)) {
    tags.push('UNCLEAR_ITEM');
    return tags;
  }

  const priceRef = ref as NonNullable<ReturnType<typeof findPriceRange>>;

  if (item.partsCost > priceRef.avgPartsCost * 1.3) tags.push('HIGH_PART_PRICE');
  if (item.laborCost > priceRef.avgLaborCost * 1.3) tags.push('HIGH_LABOR');
  if (item.laborCost > 0 && item.partsCost > 0 && item.laborCost > item.partsCost * 2)
    tags.push('DUP_LABOR');
  if (priceRef.variance === 'high' && label !== 'FAIR') tags.push('MARKET_VARIANCE');

  return tags;
}

function buildSummary(label: ResultLabel, excessiveNames: string[], cautionNames: string[]): string {
  if (label === 'FAIR') {
    return '전반적으로 적정한 견적입니다. 안심하고 정비를 진행하셔도 됩니다.';
  }
  if (label === 'CAUTION') {
    const names = cautionNames.slice(0, 2).join(', ');
    return `${names} 항목이 적정 범위를 초과합니다. 정비소에 가격 근거를 확인해보세요.`;
  }
  const names = excessiveNames.slice(0, 2).join(', ');
  return `${names} 항목의 가격이 과다합니다. 다른 정비소와 비교 견적을 받아보시기 바랍니다.`;
}

function buildBadges(items: JudgementItemResult[]): string[] {
  const labelMap: Record<ResultLabel, string> = {
    FAIR: '적정',
    CAUTION: '주의',
    EXCESSIVE: '과다',
  };
  return items.map((item) => {
    // 아이템 이름은 EstimateItem에서 직접 가져오므로 여기서는 itemId만 있음
    return `${labelMap[item.resultLabel]}`;
  });
}

export function computeJudgement(items: EstimateItem[]): JudgementComputeResult {
  const itemResults: JudgementItemResult[] = items.map((item) => {
    const ref = findPriceRange(item.name);
    const fairMin = ref ? ref.minPrice : DEFAULT_PRICE_RANGE.minPrice;
    const fairMax = ref ? ref.maxPrice : DEFAULT_PRICE_RANGE.maxPrice;
    const myPrice = item.totalCost;

    const positionPct = clamp(
      fairMax > fairMin ? ((myPrice - fairMin) / (fairMax - fairMin)) * 100 : 50,
      0,
      150
    );

    const resultLabel = classifyItem(myPrice, fairMax);
    const reasonTags = assignReasonTags(item, ref ?? DEFAULT_PRICE_RANGE, resultLabel);

    return {
      estimateItemId: item.id,
      fairMin,
      fairMax,
      myPrice,
      positionPct,
      resultLabel,
      reasonTags,
      notes: null,
    };
  });

  // 전체 라벨 결정: HIGH가 1개라도 → EXCESSIVE, CAUTION → CAUTION, else → FAIR
  let overallLabel: ResultLabel = 'FAIR';
  const excessiveItems = itemResults.filter((i) => i.resultLabel === 'EXCESSIVE');
  const cautionItems = itemResults.filter((i) => i.resultLabel === 'CAUTION');

  if (excessiveItems.length > 0) {
    overallLabel = 'EXCESSIVE';
  } else if (cautionItems.length > 0) {
    overallLabel = 'CAUTION';
  }

  // 점수 계산 (0~100)
  const totalAmount = items.reduce((sum, i) => sum + i.totalCost, 0);
  let weightedScore = 0;

  for (const itemResult of itemResults) {
    const item = items.find((i) => i.id === itemResult.estimateItemId)!;
    const weight = totalAmount > 0 ? item.totalCost / totalAmount : 1 / items.length;

    let itemScore: number;
    if (itemResult.resultLabel === 'FAIR') {
      itemScore = 90;
    } else if (itemResult.resultLabel === 'CAUTION') {
      const overRatio = Math.min((itemResult.myPrice - itemResult.fairMax) / itemResult.fairMax, 0.2);
      itemScore = 60 - overRatio * 100;
    } else {
      const overRatio = Math.min(
        (itemResult.myPrice - itemResult.fairMax * 1.2) / (itemResult.fairMax * 1.2),
        1
      );
      itemScore = Math.max(0, 30 - overRatio * 30);
    }

    weightedScore += itemScore * weight;
  }

  const overallScore = Math.round(clamp(weightedScore, 0, 100));

  // confidence
  const confidenceMap: Record<ResultLabel, number> = {
    FAIR: 0.9,
    CAUTION: 0.6,
    EXCESSIVE: 0.3,
  };
  const confidence = confidenceMap[overallLabel];

  // 항목명 목록 (badges용)
  const excessiveNames = excessiveItems.map((i) => {
    const item = items.find((it) => it.id === i.estimateItemId);
    return item?.name ?? '항목';
  });
  const cautionNames = cautionItems.map((i) => {
    const item = items.find((it) => it.id === i.estimateItemId);
    return item?.name ?? '항목';
  });

  const summary = buildSummary(overallLabel, excessiveNames, cautionNames);

  // badges: 각 항목의 이름 + 라벨
  const labelKo: Record<ResultLabel, string> = {
    FAIR: '적정',
    CAUTION: '주의',
    EXCESSIVE: '과다',
  };
  const badges = itemResults.map((ir) => {
    const itemName = items.find((i) => i.id === ir.estimateItemId)?.name ?? '항목';
    return `${itemName} ${labelKo[ir.resultLabel]}`;
  });

  return {
    resultLabel: overallLabel,
    confidence,
    overallScore,
    summary,
    badges,
    items: itemResults,
  };
}
