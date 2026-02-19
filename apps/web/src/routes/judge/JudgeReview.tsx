import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useEstimate } from '@/hooks/useEstimate';
import { useCreateJudgement } from '@/hooks/useJudgement';
import { formatKRW } from '@/lib/currency';
import { REPAIR_CATEGORIES } from '@aileader/shared';

function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Card>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>
      <Card>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </Card>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function JudgeReview() {
  const { estimateId } = useParams<{ estimateId: string }>();
  const navigate = useNavigate();
  const [isJudging, setIsJudging] = useState(false);
  const [judgeError, setJudgeError] = useState<string | null>(null);

  const { data: estimate, isLoading, error, refetch } = useEstimate(estimateId ?? '');
  const createJudgement = useCreateJudgement();

  const handleJudge = async () => {
    if (!estimateId) return;
    setIsJudging(true);
    setJudgeError(null);
    try {
      const judgement = await createJudgement.mutateAsync(estimateId);
      navigate(`/judge/result/${judgement.id}`);
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : '판단 요청에 실패했습니다');
      setIsJudging(false);
    }
  };

  if (isLoading) return <ReviewSkeleton />;
  if (error) return <ErrorState message="견적 정보를 불러오지 못했습니다." onRetry={() => refetch()} />;
  if (!estimate) return null;

  const items = estimate.items ?? [];
  const car = estimate.car;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">견적 확인</h1>
        <p className="text-sm text-gray-500 mt-1">입력한 견적 항목을 확인하고 AI 판단을 요청하세요</p>
      </div>

      <div className="space-y-4">
        {/* 기본 정보 */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">기본 정보</h2>
          <dl className="space-y-2 text-sm">
            {car && (
              <div className="flex justify-between">
                <dt className="text-gray-500">차량</dt>
                <dd className="font-medium text-gray-900">
                  {car.make} {car.model} ({car.year})
                </dd>
              </div>
            )}
            {estimate.shopName && (
              <div className="flex justify-between">
                <dt className="text-gray-500">정비소</dt>
                <dd className="font-medium text-gray-900">{estimate.shopName}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">입력 방식</dt>
              <dd className="font-medium text-gray-900">
                {estimate.source === 'manual' ? '직접 입력' : '사진 업로드'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">항목 수</dt>
              <dd className="font-medium text-gray-900">{items.length}개</dd>
            </div>
          </dl>
        </Card>

        {/* 항목 목록 */}
        {items.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-3">견적 항목</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const catMeta = REPAIR_CATEGORIES[item.category as keyof typeof REPAIR_CATEGORIES];
                return (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {catMeta ? `${catMeta.icon} ${catMeta.label}` : item.category}
                        </p>
                        {(item.laborCost > 0 || item.partsCost > 0) && (
                          <p className="text-xs text-gray-400 mt-1">
                            {item.laborCost > 0 && `공임 ${formatKRW(item.laborCost)}`}
                            {item.laborCost > 0 && item.partsCost > 0 && ' · '}
                            {item.partsCost > 0 && `부품 ${formatKRW(item.partsCost)}`}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm whitespace-nowrap ml-2">
                        {formatKRW(item.totalCost)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 총액 */}
        <Card className="bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">총 견적 금액</span>
            <span className="text-xl font-black text-gray-900">{formatKRW(estimate.totalAmount)}</span>
          </div>
        </Card>

        {judgeError && (
          <div className="p-3 bg-excessive-light border border-excessive-border rounded-lg text-sm text-excessive">
            {judgeError}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Button
            fullWidth
            size="lg"
            isLoading={isJudging}
            onClick={handleJudge}
          >
            AI 판단 요청 →
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate(-1)}
            disabled={isJudging}
          >
            이전으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
