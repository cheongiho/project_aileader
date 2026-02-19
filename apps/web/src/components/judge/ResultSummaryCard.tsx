import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ItemRangeRow } from './ItemRangeRow';
import { formatKRW } from '@/lib/currency';
import type { Judgement } from '@/api/judgements';

const STATUS_CONFIG = {
  FAIR: {
    title: '적정한 견적입니다',
    description: '모든 항목이 시장 평균 범위 내에 있습니다.',
    emoji: '✓',
    scoreColor: 'text-fair',
    bgColor: 'bg-fair-light',
  },
  CAUTION: {
    title: '일부 항목을 확인하세요',
    description: '일부 항목이 적정 범위를 초과합니다.',
    emoji: '!',
    scoreColor: 'text-caution',
    bgColor: 'bg-caution-light',
  },
  EXCESSIVE: {
    title: '과다한 견적입니다',
    description: '다른 정비소와 비교 견적을 받아보시기 바랍니다.',
    emoji: '✕',
    scoreColor: 'text-excessive',
    bgColor: 'bg-excessive-light',
  },
};

interface ResultSummaryCardProps {
  judgement: Judgement;
}

export function ResultSummaryCard({ judgement }: ResultSummaryCardProps) {
  const { result, items } = judgement;
  if (!result) return null;

  const config = STATUS_CONFIG[result.label];

  // 전체 평균 대비 계산
  const totalMyPrice = items.reduce((sum, item) => sum + item.myPrice, 0);
  const totalAvgPrice = items.reduce((sum, item) => sum + (item.fairMin + item.fairMax) / 2, 0);
  const totalDiffPercent = totalAvgPrice > 0 
    ? Math.round(((totalMyPrice - totalAvgPrice) / totalAvgPrice) * 100) 
    : 0;
  const totalDiffSign = totalDiffPercent > 0 ? '+' : '';
  const totalDiffColorClass = totalDiffPercent > 20 
    ? 'text-excessive' 
    : totalDiffPercent > 0 
      ? 'text-caution' 
      : 'text-fair';

  return (
    <div className="space-y-4">
      {/* 전체 결과 헤더 카드 */}
      <Card className={`text-center py-8 ${config.bgColor}`}>
        <div className={`text-6xl font-black mb-1 ${config.scoreColor}`}>
          {/* overallScore가 없으면 confidence로 대체 */}
          {Math.round(result.confidence * 100)}
        </div>
        <div className="text-gray-500 text-sm mb-4">점</div>

        <div className="flex justify-center mb-3">
          <Badge variant={result.label} className="text-sm px-4 py-1" />
        </div>

        <p className={`font-bold text-xl ${config.scoreColor}`}>{config.title}</p>
        <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
          {result.summary}
        </p>

        {/* 평균 대비 총합 비교 */}
        {items.length > 0 && totalAvgPrice > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <div className="flex justify-center items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">평균가 합계</span>
                <p className="font-semibold text-gray-700">{formatKRW(totalAvgPrice)}</p>
              </div>
              <div className={`text-2xl font-bold ${totalDiffColorClass}`}>
                {totalDiffSign}{totalDiffPercent}%
              </div>
              <div>
                <span className="text-gray-500">내 견적 합계</span>
                <p className="font-semibold text-gray-900">{formatKRW(totalMyPrice)}</p>
              </div>
            </div>
            <p className={`mt-2 text-xs ${totalDiffColorClass}`}>
              {totalDiffPercent > 0 
                ? `평균보다 ${formatKRW(totalMyPrice - totalAvgPrice)} 높습니다` 
                : totalDiffPercent < 0 
                  ? `평균보다 ${formatKRW(totalAvgPrice - totalMyPrice)} 낮습니다`
                  : '평균과 동일합니다'}
            </p>
          </div>
        )}

        {/* confidence */}
        <div className="mt-4 text-xs text-gray-400">
          판단 신뢰도: {Math.round(result.confidence * 100)}%
        </div>
      </Card>

      {/* 항목별 분석 */}
      {items.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-1">항목별 분석</h3>
          <p className="text-xs text-gray-400 mb-4">
            막대의 초록 구간이 적정 범위입니다. 점의 위치로 내 견적을 확인하세요.
          </p>
          {items.map((item) => (
            <ItemRangeRow key={item.itemId} item={item} />
          ))}
        </Card>
      )}

      {/* 버전 정보 */}
      <p className="text-center text-xs text-gray-400">
        판단 #{judgement.version}회차 · {new Date(judgement.createdAt).toLocaleDateString('ko-KR')}
      </p>
    </div>
  );
}
