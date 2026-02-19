import { http, HttpResponse, delay } from 'msw';
import { mockStore } from './store';
import shopsData from './data/shops.json';
import allCasesData from './data/all-cases.json';

// API 응답 형식 맞추기
const success = <T>(data: T) => HttpResponse.json({ ok: true, data });
const error = (message: string, status = 400) =>
  HttpResponse.json({ ok: false, error: { message } }, { status });

export const handlers = [
  // ==================== Cars ====================
  
  // GET /api/cars - 차량 목록 조회
  http.get('/api/cars', async () => {
    await delay(300);
    return success(mockStore.getCars());
  }),

  // POST /api/cars - 차량 등록
  http.post('/api/cars', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as {
      make: string;
      model: string;
      year: number;
      plateNo?: string;
    };
    const car = mockStore.createCar(body);
    return success(car);
  }),

  // ==================== Estimates ====================

  // POST /api/estimates - 견적 생성
  http.post('/api/estimates', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as {
      carId?: string;
      source: 'manual' | 'photo';
      shopName?: string;
    };
    const estimate = mockStore.createEstimate(body);
    return success(estimate);
  }),

  // POST /api/estimates/upload-photo - 사진 업로드로 견적 생성
  http.post('/api/estimates/upload-photo', async ({ request }) => {
    await delay(1500); // 사진 분석 시뮬레이션
    const formData = await request.formData();
    const carId = formData.get('carId') as string | null;
    const shopName = formData.get('shopName') as string | null;

    // 사진 분석 결과로 견적 생성 시뮬레이션
    const estimate = mockStore.createEstimate({
      carId: carId || undefined,
      source: 'photo',
      shopName: shopName || '사진에서 인식된 정비소',
    });

    // 사진에서 분석된 항목들 시뮬레이션
    const sampleItems = [
      { name: '엔진오일 교환', category: 'ENGINE_OIL', laborCost: 30000, partsCost: 70000 },
      { name: '에어필터 교환', category: 'ETC', laborCost: 10000, partsCost: 25000 },
      { name: '브레이크 점검', category: 'BRAKE', laborCost: 20000, partsCost: 0 },
    ];

    sampleItems.forEach((item) => {
      mockStore.addEstimateItem(estimate.id, item);
    });

    const updatedEstimate = mockStore.getEstimate(estimate.id);
    return success({ estimate: updatedEstimate });
  }),

  // GET /api/estimates/:id - 견적 조회
  http.get('/api/estimates/:id', async ({ params }) => {
    await delay(300);
    const estimate = mockStore.getEstimate(params.id as string);
    if (!estimate) {
      return error('견적을 찾을 수 없습니다.', 404);
    }
    return success(estimate);
  }),

  // POST /api/estimates/:estimateId/items - 견적 항목 추가
  http.post('/api/estimates/:estimateId/items', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as {
      name: string;
      category: string;
      laborCost: number;
      partsCost: number;
      note?: string;
    };
    const item = mockStore.addEstimateItem(params.estimateId as string, body);
    if (!item) {
      return error('견적을 찾을 수 없습니다.', 404);
    }
    return success(item);
  }),

  // ==================== Judgements ====================

  // POST /api/judgements - 진단 요청
  http.post('/api/judgements', async ({ request }) => {
    await delay(2000); // 진단 분석 시뮬레이션
    const body = (await request.json()) as { estimateId: string };
    
    // 견적 제출 상태로 변경
    mockStore.submitEstimate(body.estimateId);
    
    const judgement = mockStore.createJudgement(body.estimateId);
    return success(judgement);
  }),

  // GET /api/judgements/:id - 진단 결과 조회
  http.get('/api/judgements/:id', async ({ params }) => {
    await delay(300);
    const judgement = mockStore.getJudgement(params.id as string);
    if (!judgement) {
      return error('진단 결과를 찾을 수 없습니다.', 404);
    }
    return success(judgement);
  }),

  // GET /api/me/judgements - 내 진단 목록
  http.get('/api/me/judgements', async () => {
    await delay(300);
    return success(mockStore.getMyJudgements());
  }),

  // GET /api/judgements/recent-others - 다른 사람들의 최근 진단
  http.get('/api/judgements/recent-others', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    return success(mockStore.getRecentOthers(limit));
  }),

  // POST /api/judgements/:id/feedback - 피드백 제출
  http.post('/api/judgements/:id/feedback', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as { rating: number; comment?: string };
    const success_result = mockStore.submitFeedback(
      params.id as string,
      body.rating,
      body.comment
    );
    if (!success_result) {
      return error('진단 결과를 찾을 수 없습니다.', 404);
    }
    return HttpResponse.json({ ok: true });
  }),

  // ==================== Health ====================
  
  http.get('/api/health', () => {
    return success({ status: 'ok', mock: true });
  }),

  // ==================== Shops ====================

  // GET /api/shops - 정비소 목록 조회
  http.get('/api/shops', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '37.4979');
    const lng = parseFloat(url.searchParams.get('lng') || '127.0276');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const type = url.searchParams.get('type'); // official | franchise | private

    let shops = [...shopsData];

    // 타입 필터링
    if (type) {
      shops = shops.filter((shop) => shop.type === type);
    }

    // 거리 계산 및 정렬
    const R = 6371;
    const shopsWithDistance = shops.map((shop) => {
      const dLat = ((shop.lat - lat) * Math.PI) / 180;
      const dLng = ((shop.lng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((shop.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { ...shop, distance };
    });

    shopsWithDistance.sort((a, b) => a.distance - b.distance);

    return success(shopsWithDistance.slice(0, limit));
  }),

  // GET /api/shops/:id - 정비소 상세 조회
  http.get('/api/shops/:id', async ({ params }) => {
    await delay(200);
    const shop = shopsData.find((s) => s.id === params.id);
    if (!shop) {
      return error('정비소를 찾을 수 없습니다.', 404);
    }
    return success(shop);
  }),

  // ==================== All Cases ====================

  // GET /api/cases - 전체 판단 사례 조회
  http.get('/api/cases', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const resultLabel = url.searchParams.get('resultLabel'); // FAIR | CAUTION | EXCESSIVE
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cases = [...allCasesData] as any[];

    // 결과 라벨 필터링
    if (resultLabel) {
      cases = cases.filter((c) => c.result.label === resultLabel);
    }

    // 카테고리 필터링
    if (category) {
      cases = cases.filter((c) => c.mainCategory === category);
    }

    // 통계 계산
    const stats = {
      total: allCasesData.length,
      fair: allCasesData.filter((c) => c.result.label === 'FAIR').length,
      caution: allCasesData.filter((c) => c.result.label === 'CAUTION').length,
      excessive: allCasesData.filter((c) => c.result.label === 'EXCESSIVE').length,
    };

    // 페이지네이션
    const total = cases.length;
    const paginatedCases = cases.slice(offset, offset + limit);

    return success({
      cases: paginatedCases,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  }),
];
