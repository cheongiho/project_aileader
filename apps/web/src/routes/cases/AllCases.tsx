import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatKRW } from '@/lib/currency';

type ResultLabel = 'FAIR' | 'CAUTION' | 'EXCESSIVE';

interface CaseItem {
  id: string;
  estimateId: string;
  version: number;
  status: string;
  result: {
    label: ResultLabel;
    confidence: number;
    summary: string;
    badges: string[];
  };
  car: { make: string; model: string; year: number };
  shopName: string;
  totalAmount: number;
  createdAt: string;
  mainCategory: string;
}

interface CasesResponse {
  cases: CaseItem[];
  stats: {
    total: number;
    fair: number;
    caution: number;
    excessive: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface StatCardProps {
  label: string;
  count: number;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({ label, count, color, isActive, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl transition-all text-left ${
        isActive
          ? `${color} ring-2 ring-offset-2 ring-blue-500`
          : `${color} opacity-80 hover:opacity-100`
      }`}
    >
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </button>
  );
}

function CaseCard({ caseItem }: { caseItem: CaseItem }) {
  const c = caseItem;
  return (
    <Card className="transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {c.car.make} {c.car.model} {c.car.year}년
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {c.mainCategory}
            </span>
            {c.version > 1 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                재판단 #{c.version}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-1">{c.shopName}</p>
          {c.totalAmount > 0 && (
            <p className="text-sm text-gray-600">총 {formatKRW(c.totalAmount)}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(c.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <Badge variant={c.result.label} />
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{c.result.summary}</p>
      {c.result.badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {c.result.badges.map((badge, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

export function AllCases() {
  const [filter, setFilter] = useState<ResultLabel | null>(null);

  const { data, isLoading, error, refetch } = useQuery<CasesResponse>({
    queryKey: ['all-cases', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter) params.append('resultLabel', filter);
      params.append('limit', '50');
      const res = await apiFetch<CasesResponse>(`/api/cases?${params.toString()}`);
      return res;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton lines={6} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="판단 사례를 불러오지 못했습니다"
        onRetry={refetch}
      />
    );
  }

  const stats = data?.stats || { total: 0, fair: 0, caution: 0, excessive: 0 };
  const cases = data?.cases || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">전체 판단 사례</h1>
          <p className="text-sm text-gray-500 mt-1">
            다른 사용자들의 판단 결과를 확인하고 참고하세요
          </p>
        </div>
        <Link to="/judge/new">
          <Button size="sm">내 견적 판단하기</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-3 mb-6">
        <StatCard
          label="전체"
          count={stats.total}
          color="bg-gray-100"
          isActive={filter === null}
          onClick={() => setFilter(null)}
        />
        <StatCard
          label="적정"
          count={stats.fair}
          color="bg-green-100"
          isActive={filter === 'FAIR'}
          onClick={() => setFilter('FAIR')}
        />
        <StatCard
          label="주의"
          count={stats.caution}
          color="bg-yellow-100"
          isActive={filter === 'CAUTION'}
          onClick={() => setFilter('CAUTION')}
        />
        <StatCard
          label="과다"
          count={stats.excessive}
          color="bg-red-100"
          isActive={filter === 'EXCESSIVE'}
          onClick={() => setFilter('EXCESSIVE')}
        />
      </div>

      {/* Filter Info */}
      {filter && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filter === 'FAIR' && '적정 판단'}
            {filter === 'CAUTION' && '주의 판단'}
            {filter === 'EXCESSIVE' && '과다 판단'}
            {' '}사례만 표시중
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilter(null)}
          >
            필터 초기화
          </Button>
        </div>
      )}

      {/* Cases List */}
      {cases.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-600">해당 필터에 맞는 사례가 없습니다</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <CaseCard key={c.id} caseItem={c} />
          ))}
        </div>
      )}

      {/* Load More */}
      {data?.pagination.hasMore && (
        <div className="mt-6 text-center">
          <Button variant="secondary" onClick={() => refetch()}>
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}
