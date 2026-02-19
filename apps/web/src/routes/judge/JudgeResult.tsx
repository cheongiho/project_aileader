import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card } from '@/components/ui/Card';
import { ResultSummaryCard } from '@/components/judge/ResultSummaryCard';
import { useJudgement, useFeedback } from '@/hooks/useJudgement';
import { getMockMode } from '@/lib/mockParams';
import type { Judgement } from '@/api/judgements';

// Skeleton for loading state
function ResultSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card className="py-8 text-center">
        <Skeleton className="h-16 w-20 mx-auto mb-2" />
        <Skeleton className="h-4 w-12 mx-auto mb-4" />
        <Skeleton className="h-6 w-24 mx-auto mb-3" />
        <Skeleton className="h-5 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </Card>
      <Card>
        <Skeleton className="h-5 w-28 mb-4" />
        {[1, 2].map((i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-full rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}

// Mock judgement data for ?mock=fail preview
const MOCK_JUDGEMENT: Judgement = {
  id: 'mock-id',
  estimateId: 'mock-estimate',
  version: 1,
  status: 'done',
  result: {
    label: 'CAUTION',
    confidence: 0.6,
    summary: '일부 항목이 적정 범위를 초과합니다. 정비소에 가격 근거를 확인해보세요.',
    badges: ['브레이크 패드 주의'],
  },
  items: [
    {
      itemId: 'item-1',
      name: '브레이크 패드',
      category: 'BRAKE',
      fairMin: 80_000,
      fairMax: 200_000,
      myPrice: 220_000,
      positionPct: 107,
      resultLabel: 'EXCESSIVE',
      reasonTags: ['HIGH_PART_PRICE'],
      notes: null,
    },
  ],
  createdAt: new Date().toISOString(),
};

// Feedback form
function FeedbackSection({ judgementId }: { judgementId: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const feedback = useFeedback(judgementId);

  const handleSubmit = async () => {
    if (!rating) return;
    try {
      await feedback.mutateAsync({ rating, comment: comment || undefined });
      setSubmitted(true);
    } catch {
      // silent fail for feedback
    }
  };

  if (submitted) {
    return (
      <Card className="text-center py-4">
        <p className="text-sm text-fair font-medium">피드백 감사합니다!</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">이 판단이 도움이 되었나요?</h3>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition-transform hover:scale-110 ${
              rating !== null && star <= rating ? 'opacity-100' : 'opacity-30'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {rating !== null && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="의견을 남겨주시면 서비스 개선에 도움이 됩니다 (선택)"
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          <Button
            size="sm"
            className="mt-2"
            onClick={handleSubmit}
            isLoading={feedback.isPending}
          >
            피드백 제출
          </Button>
        </>
      )}
    </Card>
  );
}

export function JudgeResult() {
  const { judgementId } = useParams<{ judgementId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mockMode = getMockMode(searchParams);

  const { data: judgement, isLoading, error, refetch } = useJudgement(
    mockMode ? 'disabled' : (judgementId ?? ''),
  );

  // Mock states
  if (mockMode === 'loading') return <ResultSkeleton />;
  if (mockMode === 'fail') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <ErrorState
          message="판단 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) return <ResultSkeleton />;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorState
          message="판단 결과를 불러오지 못했습니다."
          onRetry={() => refetch()}
        />
      </div>
    );
  }
  if (!judgement) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">판단 결과</h1>
      </div>

      <ResultSummaryCard judgement={judgement} />

      {judgement.status === 'done' && judgementId && (
        <FeedbackSection judgementId={judgementId} />
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/judge/manual')}
        >
          새 견적 판단하기
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => navigate('/my/judgements')}
        >
          판단 이력 보기
        </Button>
      </div>
    </div>
  );
}
