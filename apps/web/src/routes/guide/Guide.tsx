import { useState } from 'react';
import { Card } from '@/components/ui/Card';

type TabId = 'intro' | 'howto' | 'results' | 'faq' | 'tips';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'intro', label: '서비스 소개', icon: '🚗' },
  { id: 'howto', label: '사용 방법', icon: '📝' },
  { id: 'results', label: '결과 해석', icon: '📊' },
  { id: 'faq', label: 'FAQ', icon: '❓' },
  { id: 'tips', label: '정비 상식', icon: '🔧' },
];

const RESULT_LABELS = [
  {
    label: 'FAIR',
    korean: '적정',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: '시세에 맞는 합리적인 가격입니다. 안심하고 정비를 진행하세요.',
  },
  {
    label: 'CAUTION',
    korean: '주의',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: '일부 항목이 시세보다 높습니다. 해당 항목을 확인하고 정비소와 상담해보세요.',
  },
  {
    label: 'EXCESSIVE',
    korean: '과다',
    color: 'bg-red-100 text-red-800 border-red-200',
    description: '전반적으로 시세보다 높은 견적입니다. 다른 정비소 견적도 받아보시길 권장합니다.',
  },
];

const REASON_TAGS = [
  { tag: 'HIGH_LABOR', label: '공임 과다', description: '해당 작업의 공임이 일반적인 시세보다 높습니다.' },
  { tag: 'HIGH_PART_PRICE', label: '부품비 과다', description: '부품 가격이 시세보다 높습니다. 순정/비순정 여부를 확인하세요.' },
  { tag: 'DUP_LABOR', label: '중복 공임', description: '다른 작업에 이미 포함된 공임이 별도로 청구된 것으로 의심됩니다.' },
  { tag: 'UNNEEDED_REPLACEMENT', label: '불필요한 교체', description: '아직 교체 시기가 아닌 부품의 교체가 포함되어 있습니다.' },
  { tag: 'UNCLEAR_ITEM', label: '불명확한 항목', description: '항목 내용이 명확하지 않아 적정성 판단이 어렵습니다.' },
  { tag: 'MARKET_VARIANCE', label: '지역 편차', description: '지역에 따른 시세 차이가 있을 수 있습니다.' },
];

const FAQS = [
  {
    q: '진단 결과는 얼마나 정확한가요?',
    a: 'AI Leader는 수만 건의 실제 정비 데이터를 학습하여 약 85-90%의 정확도로 적정가를 판단합니다. 다만 특수한 상황(수입차 특수부품, 지역별 편차 등)에서는 오차가 있을 수 있습니다.',
  },
  {
    q: '어떤 데이터를 기반으로 판단하나요?',
    a: '전국 정비소의 실제 정비 내역, 부품 유통가, 공임 시세 등을 종합적으로 분석합니다. 차종, 연식, 부품 종류에 따른 세부 데이터를 활용합니다.',
  },
  {
    q: '개인정보는 어떻게 처리되나요?',
    a: '견적서 분석에 필요한 정보만 안전하게 처리되며, 개인 식별 정보는 저장하지 않습니다. 진단 기록은 암호화되어 보관됩니다.',
  },
  {
    q: '사진으로 견적서를 인식하면 정확한가요?',
    a: 'OCR 기술로 견적서의 텍스트를 인식합니다. 선명한 사진일수록 인식률이 높으며, 인식 결과는 직접 수정할 수 있습니다.',
  },
  {
    q: '결과가 "과다"로 나오면 어떻게 해야 하나요?',
    a: '해당 항목을 정비소에 문의하거나, 다른 정비소에서 비교 견적을 받아보세요. AI Leader의 결과를 근거로 협상할 수 있습니다.',
  },
];

const MAINTENANCE_TIPS = [
  {
    category: '엔진오일',
    interval: '10,000km 또는 1년',
    description: '엔진의 윤활과 냉각을 담당합니다. 주기적 교환이 엔진 수명에 중요합니다.',
  },
  {
    category: '브레이크 패드',
    interval: '30,000~50,000km',
    description: '마모 상태에 따라 다릅니다. 브레이크 소음이 나면 즉시 점검하세요.',
  },
  {
    category: '타이어',
    interval: '40,000~50,000km 또는 5년',
    description: '트레드 깊이 1.6mm 이하이면 교체가 필요합니다. 위치 교환도 중요합니다.',
  },
  {
    category: '냉각수',
    interval: '40,000km 또는 2년',
    description: '엔진 과열을 방지합니다. 색이 변하거나 부족하면 점검이 필요합니다.',
  },
  {
    category: '배터리',
    interval: '3~5년',
    description: '시동이 약해지거나 전압이 낮으면 교체를 고려하세요.',
  },
  {
    category: '에어컨 필터',
    interval: '15,000~20,000km 또는 1년',
    description: '실내 공기질에 영향을 줍니다. 미세먼지가 심한 계절에는 더 자주 교체하세요.',
  },
];

export function Guide() {
  const [activeTab, setActiveTab] = useState<TabId>('intro');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">이용 가이드</h1>
        <p className="text-sm text-gray-500 mt-1">AI Leader 서비스 이용 방법을 안내합니다</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 -mx-4 px-4 scrollbar-hide">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* 서비스 소개 */}
        {activeTab === 'intro' && (
          <>
            <Card className="p-6">
              <div className="text-center mb-6">
                <span className="text-5xl">🔧</span>
                <h2 className="text-lg font-bold text-gray-900 mt-4">AI Leader</h2>
                <p className="text-gray-600 mt-2">자동차 정비 견적, AI가 판단해드립니다</p>
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  자동차 정비를 받을 때 견적서를 보고 "이게 적정한 가격인가?"라는 고민을 해보신 적이 있으신가요?
                </p>
                <p>
                  <strong className="text-gray-900">AI Leader</strong>는 AI 기술을 활용하여 정비 견적서의 적정성을 분석해드립니다.
                  수만 건의 실제 정비 데이터를 바탕으로 각 항목별 시세와 비교하여 객관적인 판단을 제공합니다.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">이런 분들께 추천합니다</h3>
              <ul className="space-y-3">
                {[
                  '정비소 견적이 적정한지 확인하고 싶은 분',
                  '자동차 정비에 대한 지식이 부족한 분',
                  '여러 정비소 견적을 비교하고 싶은 분',
                  '정비소와 가격 협상 시 근거가 필요한 분',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-brand">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        {/* 사용 방법 */}
        {activeTab === 'howto' && (
          <>
            {[
              {
                step: 1,
                title: '견적서 입력',
                description: '정비소에서 받은 견적서를 입력합니다.',
                details: [
                  '📷 사진 업로드: 견적서를 촬영하여 자동 인식',
                  '✏️ 직접 입력: 항목별 금액을 수동으로 입력',
                ],
              },
              {
                step: 2,
                title: 'AI 진단 요청',
                description: '입력된 견적서를 AI가 분석합니다.',
                details: [
                  '차종, 연식에 맞는 시세 데이터 조회',
                  '각 항목별 적정가 범위 계산',
                  '종합적인 견적 적정성 판단',
                ],
              },
              {
                step: 3,
                title: '결과 확인',
                description: '분석 결과를 확인하고 활용합니다.',
                details: [
                  '전체 견적의 적정/주의/과다 판정',
                  '항목별 상세 분석 및 이유 확인',
                  '필요시 정비소와 협상에 활용',
                ],
              },
            ].map(({ step, title, description, details }) => (
              <Card key={step} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                    {step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                    <ul className="mt-3 space-y-1">
                      {details.map((detail, i) => (
                        <li key={i} className="text-sm text-gray-500">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* 결과 해석 */}
        {activeTab === 'results' && (
          <>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">진단 결과 유형</h3>
              <div className="space-y-3">
                {RESULT_LABELS.map(({ label, korean, color, description }) => (
                  <div
                    key={label}
                    className={`p-4 rounded-lg border ${color}`}
                  >
                    <div className="font-semibold">{korean} ({label})</div>
                    <p className="text-sm mt-1 opacity-80">{description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">주의 태그 설명</h3>
              <div className="space-y-3">
                {REASON_TAGS.map(({ tag, label, description }) => (
                  <div key={tag} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">자주 묻는 질문</h3>
            <div className="space-y-2">
              {FAQS.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                    <span className="text-gray-400">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 py-3 text-sm text-gray-600 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 정비 상식 */}
        {activeTab === 'tips' && (
          <>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">주요 소모품 교체 주기</h3>
              <div className="space-y-4">
                {MAINTENANCE_TIPS.map(({ category, interval, description }) => (
                  <div key={category} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-brand font-medium">{interval}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">정비소 선택 팁</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-brand">💡</span>
                  <span>공식 서비스센터와 일반 정비소의 장단점을 비교하세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">💡</span>
                  <span>시급하지 않은 정비는 2~3곳의 견적을 비교하는 것이 좋습니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">💡</span>
                  <span>순정부품과 호환부품의 가격 차이를 확인하세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">💡</span>
                  <span>정비 후 교체 부품을 확인하고, 명세서를 보관하세요.</span>
                </li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
