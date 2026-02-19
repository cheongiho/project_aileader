import { Link } from 'react-router-dom';
import { useMyJudgements } from '@/hooks/useJudgement';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatKRW } from '@/lib/currency';
import type { Judgement } from '@/api/judgements';

function JudgementCard({ judgement }: { judgement: Judgement }) {
  const car = judgement.car;
  const label = judgement.result?.label;

  return (
    <Link to={`/judge/result/${judgement.id}`}>
      <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {car && (
                <span className="text-sm font-semibold text-gray-900">
                  {car.make} {car.model}
                </span>
              )}
              {judgement.shopName && (
                <span className="text-xs text-gray-400">{judgement.shopName}</span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(judgement.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {judgement.version > 1 && ` · 재판단 #${judgement.version}회`}
            </p>
            {judgement.totalAmount !== undefined && judgement.totalAmount > 0 && (
              <p className="text-sm font-medium text-gray-700 mt-1">
                총 {formatKRW(judgement.totalAmount)}
              </p>
            )}
          </div>
          {label && <Badge variant={label} className="flex-shrink-0 ml-3" />}
        </div>
        {judgement.result?.summary && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">{judgement.result.summary}</p>
        )}
      </Card>
    </Link>
  );
}

export function Home() {
  const { data: judgements, isLoading } = useMyJudgements();
  const recent = judgements?.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center py-8 mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          내 견적, 적정한가요?
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          차량 정비 견적서를 입력하면
          <br />
          항목별로 적정 범위를 판단해드립니다.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/judge/manual">
            <Button size="lg">직접 입력</Button>
          </Link>
          <Link to="/judge/photo">
            <Button variant="secondary" size="lg">사진 업로드</Button>
          </Link>
        </div>
      </div>

      {/* 최근 판단 이력 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">최근 판단 이력</h2>
          {(judgements?.length ?? 0) > 0 && (
            <Link to="/my/judgements" className="text-sm text-brand hover:underline">
              전체 보기
            </Link>
          )}
        </div>

        {isLoading ? (
          <Skeleton lines={2} />
        ) : !recent || recent.length === 0 ? (
          <EmptyState
            icon="🔍"
            message="아직 판단 이력이 없습니다"
            description="견적서를 입력해서 첫 번째 판단을 받아보세요."
            action={
              <Link to="/judge/manual">
                <Button>견적 입력하기</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((j) => (
              <JudgementCard key={j.id} judgement={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
