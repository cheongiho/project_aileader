import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/lib/distance';
import shopsData from '@/mocks/data/shops.json';

interface Shop {
  id: string;
  name: string;
  type: 'official' | 'franchise' | 'private';
  brand: string | null;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  openHours: string;
  closedDays: string[];
  services: string[];
  priceLevel: number;
}

type FilterType = 'all' | 'official' | 'franchise' | 'private';
type SortType = 'distance' | 'rating' | 'reviewCount';

const TYPE_LABELS: Record<Shop['type'], string> = {
  official: '공식 서비스센터',
  franchise: '프랜차이즈',
  private: '일반 정비소',
};

const TYPE_COLORS: Record<Shop['type'], string> = {
  official: 'bg-blue-100 text-blue-700',
  franchise: 'bg-purple-100 text-purple-700',
  private: 'bg-gray-100 text-gray-700',
};

const PRICE_LABELS = ['', '저렴', '보통', '다소 높음', '프리미엄'];

export function NearbyShops() {
  const { loading, error, position, refresh, isUsingFallback } = useGeolocation();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [expandedShop, setExpandedShop] = useState<string | null>(null);

  const shopsWithDistance = useMemo(() => {
    if (!position) return [];

    return (shopsData as Shop[]).map((shop) => ({
      ...shop,
      distance: calculateDistance(position.lat, position.lng, shop.lat, shop.lng),
    }));
  }, [position]);

  const filteredAndSortedShops = useMemo(() => {
    let result = [...shopsWithDistance];

    // 필터링
    if (filterType !== 'all') {
      result = result.filter((shop) => shop.type === filterType);
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'reviewCount':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return result;
  }, [shopsWithDistance, filterType, sortBy]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigation = (shop: Shop & { distance: number }) => {
    // 카카오맵, 네이버맵 등으로 연결 가능
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(shop.name)},${shop.lat},${shop.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">주변 정비소</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading
            ? '위치를 확인하고 있습니다...'
            : isUsingFallback
            ? '기본 위치(강남역) 기준으로 표시합니다'
            : '현재 위치 기준으로 가까운 정비소를 찾습니다'}
        </p>
      </div>

      {/* 위치 오류 알림 */}
      {error && (
        <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-yellow-800">{error}</p>
              <button
                onClick={refresh}
                className="text-sm text-yellow-700 underline mt-1"
              >
                다시 시도
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* 필터 & 정렬 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">전체 유형</option>
          <option value="official">공식 서비스센터</option>
          <option value="franchise">프랜차이즈</option>
          <option value="private">일반 정비소</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="distance">거리순</option>
          <option value="rating">평점순</option>
          <option value="reviewCount">리뷰많은순</option>
        </select>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </Card>
          ))}
        </div>
      )}

      {/* 정비소 목록 */}
      {!loading && (
        <div className="space-y-3">
          {filteredAndSortedShops.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">조건에 맞는 정비소가 없습니다.</p>
            </Card>
          ) : (
            filteredAndSortedShops.map((shop) => (
              <Card
                key={shop.id}
                className="overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedShop(expandedShop === shop.id ? null : shop.id)
                  }
                >
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            TYPE_COLORS[shop.type]
                          }`}
                        >
                          {TYPE_LABELS[shop.type]}
                        </span>
                        {shop.brand && (
                          <span className="text-xs text-gray-500">
                            {shop.brand}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-brand font-semibold">
                        {formatDistance(shop.distance)}
                      </div>
                    </div>
                  </div>

                  {/* 주소 */}
                  <p className="text-sm text-gray-600 mb-2">{shop.address}</p>

                  {/* 평점 & 리뷰 */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-yellow-500">
                      ⭐ {shop.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">
                      리뷰 {shop.reviewCount}개
                    </span>
                    <span className="text-gray-400">
                      가격 {PRICE_LABELS[shop.priceLevel]}
                    </span>
                  </div>
                </div>

                {/* 확장된 상세 정보 */}
                {expandedShop === shop.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    {/* 영업시간 */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">영업시간:</span>{' '}
                        {shop.openHours}
                      </p>
                      {shop.closedDays.length > 0 && (
                        <p className="text-sm text-gray-500">
                          휴무: {shop.closedDays.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* 제공 서비스 */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        제공 서비스
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {shop.services.map((service) => (
                          <span
                            key={service}
                            className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCall(shop.phone)}
                        className="flex-1"
                      >
                        📞 전화하기
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigation(shop)}
                        className="flex-1"
                      >
                        🧭 길찾기
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 text-center">
          ℹ️ 정비소 정보는 참고용이며, 실제 영업 상황과 다를 수 있습니다.
          <br />
          방문 전 전화로 확인해주세요.
        </p>
      </div>
    </div>
  );
}
