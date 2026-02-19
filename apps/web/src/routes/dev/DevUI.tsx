import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Select } from '@/components/ui/Select';
import { Skeleton, InlineSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ItemRangeRow } from '@/components/judge/ItemRangeRow';
import { ResultSummaryCard } from '@/components/judge/ResultSummaryCard';
import type { Judgement } from '@/api/judgements';

const MOCK_JUDGEMENT_FAIR: Judgement = {
  id: 'mock-fair',
  estimateId: 'est-1',
  version: 1,
  status: 'done',
  result: {
    label: 'FAIR',
    confidence: 0.9,
    summary: '모든 항목이 시장 평균 범위 내에 있습니다. 적정한 견적입니다.',
    badges: ['브레이크 패드 적정', '엔진오일 적정'],
  },
  items: [
    {
      itemId: 'item-1',
      name: '브레이크 패드',
      category: 'BRAKE',
      fairMin: 80_000,
      fairMax: 200_000,
      myPrice: 120_000,
      positionPct: 33,
      resultLabel: 'FAIR',
      reasonTags: [],
    },
    {
      itemId: 'item-2',
      name: '엔진오일 교환',
      category: 'ENGINE_OIL',
      fairMin: 30_000,
      fairMax: 80_000,
      myPrice: 45_000,
      positionPct: 30,
      resultLabel: 'FAIR',
      reasonTags: [],
    },
  ],
  createdAt: new Date().toISOString(),
};

const MOCK_JUDGEMENT_EXCESSIVE: Judgement = {
  id: 'mock-excessive',
  estimateId: 'est-2',
  version: 1,
  status: 'done',
  result: {
    label: 'EXCESSIVE',
    confidence: 0.3,
    summary: '다른 정비소와 비교 견적을 받아보시기 바랍니다.',
    badges: ['브레이크 패드 과다'],
  },
  items: [
    {
      itemId: 'item-3',
      name: '브레이크 패드',
      category: 'BRAKE',
      fairMin: 80_000,
      fairMax: 200_000,
      myPrice: 280_000,
      positionPct: 140,
      resultLabel: 'EXCESSIVE',
      reasonTags: ['HIGH_PART_PRICE', 'HIGH_LABOR'],
    },
  ],
  createdAt: new Date().toISOString(),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 items-center">{children}</div>
    </div>
  );
}

export function DevUI() {
  const [amountValue, setAmountValue] = useState(0);
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">UI 컴포넌트 미리보기</h1>
        <p className="text-sm text-gray-500 mt-1">개발용 페이지 · /dev/ui</p>
      </div>

      {/* Badges */}
      <Section title="Badge">
        <Row label="variants">
          <Badge variant="FAIR" />
          <Badge variant="CAUTION" />
          <Badge variant="EXCESSIVE" />
        </Row>
        <Row label="custom className">
          <Badge variant="FAIR" className="text-sm px-4 py-1" />
          <Badge variant="CAUTION" className="text-sm px-4 py-1" />
          <Badge variant="EXCESSIVE" className="text-sm px-4 py-1" />
        </Row>
      </Section>

      {/* Buttons */}
      <Section title="Button">
        <Row label="variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row label="sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row label="states">
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Row>
        <Row label="fullWidth">
          <div className="w-full">
            <Button fullWidth>Full Width Button</Button>
          </div>
        </Row>
      </Section>

      {/* Inputs */}
      <Section title="Input">
        <div className="max-w-sm space-y-3">
          <Input
            label="텍스트 입력"
            placeholder="예: 브레이크 패드"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            label="에러 상태"
            placeholder="필수 입력"
            error="이 필드는 필수입니다"
          />
          <AmountInput
            label="금액 입력 (AmountInput)"
            value={amountValue}
            onChange={setAmountValue}
            placeholder="0"
          />
          <p className="text-xs text-gray-500">입력 값: {amountValue.toLocaleString('ko-KR')}원</p>
          <Select
            label="카테고리 선택"
            options={[
              { value: 'BRAKE', label: '🛑 브레이크' },
              { value: 'ENGINE_OIL', label: '🔧 엔진오일' },
              { value: 'BATTERY', label: '🔋 배터리' },
            ]}
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          />
        </div>
      </Section>

      {/* Skeleton */}
      <Section title="Skeleton">
        <div className="space-y-3 max-w-sm">
          <InlineSkeleton className="h-6 w-48" />
          <InlineSkeleton className="h-4 w-full" />
          <InlineSkeleton className="h-4 w-3/4" />
          <InlineSkeleton className="h-32 w-full rounded-xl" />
          <p className="text-xs text-gray-400">Card skeleton (lines=2):</p>
          <Skeleton lines={2} />
        </div>
      </Section>

      {/* Empty & Error States */}
      <Section title="EmptyState / ErrorState">
        <div className="space-y-4">
          <EmptyState
            message="등록된 차량이 없습니다."
            action={<Button size="sm">차량 추가</Button>}
          />
          <ErrorState
            message="데이터를 불러오지 못했습니다."
            onRetry={() => alert('retry clicked')}
          />
        </div>
      </Section>

      {/* ItemRangeRow */}
      <Section title="ItemRangeRow">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-1">항목별 분석</h3>
          <p className="text-xs text-gray-400 mb-4">
            막대의 초록 구간이 적정 범위입니다. 점의 위치로 내 견적을 확인하세요.
          </p>
          {MOCK_JUDGEMENT_FAIR.items.map((item) => (
            <ItemRangeRow key={item.itemId} item={item} />
          ))}
          {MOCK_JUDGEMENT_EXCESSIVE.items.map((item) => (
            <ItemRangeRow key={item.itemId} item={item} />
          ))}
        </Card>
      </Section>

      {/* ResultSummaryCard */}
      <Section title="ResultSummaryCard">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">FAIR</p>
            <ResultSummaryCard judgement={MOCK_JUDGEMENT_FAIR} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">EXCESSIVE</p>
            <ResultSummaryCard judgement={MOCK_JUDGEMENT_EXCESSIVE} />
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section title="Color Tokens">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'fair', bg: 'bg-fair', text: 'text-white' },
            { name: 'fair-light', bg: 'bg-fair-light', text: 'text-fair' },
            { name: 'caution', bg: 'bg-caution', text: 'text-white' },
            { name: 'caution-light', bg: 'bg-caution-light', text: 'text-caution' },
            { name: 'excessive', bg: 'bg-excessive', text: 'text-white' },
            { name: 'excessive-light', bg: 'bg-excessive-light', text: 'text-excessive' },
            { name: 'brand', bg: 'bg-brand', text: 'text-white' },
            { name: 'brand-50', bg: 'bg-brand-50', text: 'text-brand' },
          ].map(({ name, bg, text }) => (
            <div
              key={name}
              className={`rounded-lg p-3 ${bg}`}
            >
              <span className={`text-xs font-medium ${text}`}>{name}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
