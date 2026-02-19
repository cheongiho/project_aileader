import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';

const OPTIONS = [
  {
    to: '/judge/manual',
    icon: '✏️',
    title: '직접 입력',
    description: '견적서의 항목과 금액을 직접 입력합니다',
    badge: '추천',
  },
  {
    to: '/judge/photo',
    icon: '📷',
    title: '사진 업로드',
    description: '견적서 사진을 찍어 업로드합니다 (준비 중)',
    badge: '준비 중',
    disabled: true,
  },
];

export function JudgeNew() {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">견적 입력 방식 선택</h1>
        <p className="text-sm text-gray-500 mt-1">입력 방식을 선택해주세요</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ to, icon, title, description, badge, disabled }) => (
          <Link key={to} to={disabled ? '#' : to}>
            <Card
              className={`cursor-pointer hover:shadow-card-hover transition-shadow ${
                disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{title}</p>
                    {badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          badge === '추천'
                            ? 'bg-brand-50 text-brand'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
                {!disabled && (
                  <span className="text-gray-400 self-center">→</span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
