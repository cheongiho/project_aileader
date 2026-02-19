import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { formatKRW } from '@/lib/currency';
import { getReasonTagCopy, REASON_TAG_COPY } from '@aileader/shared';
import type { JudgementItemResponse } from '@/api/judgements';

interface ItemRangeRowProps {
  item: JudgementItemResponse;
}

export function ItemRangeRow({ item }: ItemRangeRowProps) {
  const { fairMin, fairMax, myPrice, positionPct } = item;

  // 평균값 계산 및 차이 퍼센트
  const avgPrice = (fairMin + fairMax) / 2;
  const diffPercent = avgPrice > 0 ? Math.round(((myPrice - avgPrice) / avgPrice) * 100) : 0;
  const diffSign = diffPercent > 0 ? '+' : '';
  const diffColorClass = diffPercent > 20 
    ? 'text-excessive' 
    : diffPercent > 0 
      ? 'text-caution' 
      : 'text-fair';

  // 화면 표시용 범위 계산 (fairMin~fairMax*1.5 사이)
  const displayMax = fairMax * 1.5;
  const displayMin = Math.max(0, fairMin * 0.5);
  const range = displayMax - displayMin;

  const toPercent = (val: number) =>
    Math.min(100, Math.max(0, ((val - displayMin) / range) * 100));

  const fairMinPct = toPercent(fairMin);
  const fairMaxPct = toPercent(fairMax);
  const myPct = toPercent(myPrice);

  const dotColorClass = {
    FAIR: 'bg-fair',
    CAUTION: 'bg-caution',
    EXCESSIVE: 'bg-excessive',
  }[item.resultLabel];

  const excessiveLine = positionPct > 120 ? toPercent(fairMax * 1.2) : null;

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      {/* 항목명 + 금액 + 배지 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-gray-900">{item.name}</span>
          {item.category && (
            <span className="ml-2 text-xs text-gray-400">{item.category}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900">{formatKRW(myPrice)}</span>
            {diffPercent !== 0 && (
              <span className={`ml-1.5 text-xs font-medium ${diffColorClass}`}>
                ({diffSign}{diffPercent}%)
              </span>
            )}
          </div>
          <Badge variant={item.resultLabel} />
        </div>
      </div>

      {/* 평균가 안내 */}
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
        <span>평균가: {formatKRW(avgPrice)}</span>
        {diffPercent !== 0 && (
          <span className={diffColorClass}>
            {diffPercent > 0 ? '평균보다 높음' : '평균보다 낮음'}
          </span>
        )}
      </div>

      {/* 범위 바 */}
      <div className="relative h-2 bg-gray-100 rounded-full my-4">
        {/* 적정 구간 (fairMin ~ fairMax) */}
        <div
          className="absolute h-full bg-fair-light rounded-full"
          style={{
            left: `${fairMinPct}%`,
            width: `${fairMaxPct - fairMinPct}%`,
          }}
        />
        {/* EXCESSIVE 기준선 (fairMax * 1.2) */}
        {excessiveLine !== null && (
          <div
            className="absolute w-px h-4 bg-excessive/40 top-1/2 -translate-y-1/2"
            style={{ left: `${excessiveLine}%` }}
          />
        )}
        {/* 내 금액 마커 */}
        <div
          className={cn(
            'absolute w-4 h-4 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2',
            'border-2 border-white shadow-md transition-all',
            dotColorClass
          )}
          style={{ left: `${myPct}%` }}
        />
      </div>

      {/* 범위 레이블 */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatKRW(fairMin)}</span>
        <span className="text-gray-500">적정 범위</span>
        <span>{formatKRW(fairMax)}</span>
      </div>

      {/* Reason Tags */}
      {item.reasonTags.length > 0 && (
        <div className="mt-3 space-y-2">
          {item.reasonTags.map((tag) => {
            const copy = getReasonTagCopy(tag);
            if (!copy) return null;
            return (
              <div key={tag} className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm">
                <span className="font-medium text-amber-700 text-xs">{copy.label}</span>
                <p className="text-gray-600 mt-1 text-xs">{copy.description}</p>
                {copy.questions.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {copy.questions.map((q, i) => (
                      <li key={i} className="text-gray-500 text-xs flex gap-1">
                        <span className="text-amber-500 flex-shrink-0">Q.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
