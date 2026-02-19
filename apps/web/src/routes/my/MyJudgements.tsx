import { Link } from 'react-router-dom';
import { useMyJudgements, useRecentOthersJudgements } from '@/hooks/useJudgement';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatKRW } from '@/lib/currency';
import type { Judgement } from '@/api/judgements';

interface JudgementCardProps {
  judgement: Judgement;
  isMine: boolean;
}

function JudgementCard({ judgement: j, isMine }: JudgementCardProps) {
  return (
    <Link to={isMine ? `/judge/result/${j.id}` : '#'} className={isMine ? '' : 'pointer-events-none'}>
      <Card className={`transition-shadow ${isMine ? 'hover:shadow-card-hover cursor-pointer' : 'opacity-75'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {j.car && (
                <span className="text-sm font-semibold text-gray-900">
                  {j.car.make} {j.car.model} {j.car.year}년
                </span>
              )}
              {j.version > 1 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  재판단 #{j.version}
                </span>
              )}
            </div>
            {j.shopName && (
              <p className="text-xs text-gray-400 mb-1">{j.shopName}</p>
            )}
            {j.totalAmount !== undefined && j.totalAmount > 0 && (
              <p className="text-sm text-gray-600">총 {formatKRW(j.totalAmount)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(j.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            {j.result?.label && <Badge variant={j.result.label} />}
          </div>
        </div>
        {j.result?.summary && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">{j.result.summary}</p>
        )}
      </Card>
    </Link>
  );
}

export function MyJudgements() {
  const { data: myJudgements, isLoading: myLoading, error: myError, refetch: refetchMine } = useMyJudgements();
  const { data: othersJudgements, isLoading: othersLoading, error: othersError } = useRecentOthersJudgements(10);

  const isLoading = myLoading || othersLoading;
  const hasError = myError || othersError;

  if (isLoading) return <div className="max-w-6xl mx-auto"><Skeleton lines={4} /></div>;
  if (hasError) return <ErrorState message="판단 이력을 불러오지 못했습니다" onRetry={refetchMine} />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">판단 이력</h1>
        <Link to="/judge/new">
          <Button size="sm">새 판단</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 내 판단 이력 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">내 판단 이력</h2>
          {!myJudgements || myJudgements.length === 0 ? (
            <EmptyState
              icon="🔍"
              message="판단 이력이 없습니다"
              description="견적서를 입력하고 적정 여부를 확인해보세요."
              action={
                <Link to="/judge/manual">
                  <Button>견적 입력하기</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {myJudgements.slice(0, 10).map((j) => (
                <JudgementCard key={j.id} judgement={j} isMine />
              ))}
            </div>
          )}
        </div>

        {/* 타인의 최근 판단 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">커뮤니티 최근 판단</h2>
          {!othersJudgements || othersJudgements.length === 0 ? (
            <EmptyState
              icon="👥"
              message="최근 판단이 없습니다"
              description="다른 사용자들의 판단 결과를 곧 확인할 수 있습니다."
            />
          ) : (
            <div className="space-y-3">
              {othersJudgements.map((j) => (
                <JudgementCard key={j.id} judgement={j} isMine={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
