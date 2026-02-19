// 목업 데이터 인메모리 스토어
// 세션 동안 mutations(생성, 수정)이 유지됩니다

import carsData from './data/cars.json';
import estimatesData from './data/estimates.json';
import judgementsData from './data/judgements.json';
import myJudgementsData from './data/my-judgements.json';
import recentOthersData from './data/recent-others.json';

export interface CarProfile {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  plateNo: string | null;
  createdAt: string;
}

export interface EstimateItem {
  id: string;
  estimateId: string;
  name: string;
  category: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  note: string | null;
  createdAt: string;
}

export interface Estimate {
  id: string;
  userId: string | null;
  carId: string | null;
  source: 'manual' | 'photo';
  status: 'draft' | 'submitted';
  shopName: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  car: { make: string; model: string; year: number } | null;
  items: EstimateItem[];
}

export interface JudgementItem {
  itemId: string;
  name: string;
  category: string;
  fairMin: number;
  fairMax: number;
  myPrice: number;
  positionPct: number;
  resultLabel: 'FAIR' | 'CAUTION' | 'EXCESSIVE';
  reasonTags: string[];
  notes: string | null;
}

export interface JudgementResult {
  label: 'FAIR' | 'CAUTION' | 'EXCESSIVE';
  confidence: number;
  summary: string;
  badges: string[];
}

export interface Judgement {
  id: string;
  estimateId: string;
  version: number;
  status: 'queued' | 'done' | 'failed';
  result: JudgementResult | null;
  items: JudgementItem[];
  car: { make: string; model: string; year: number } | null;
  shopName: string | null;
  totalAmount: number;
  createdAt: string;
}

// 인메모리 스토어
class MockStore {
  cars: CarProfile[] = [...carsData] as CarProfile[];
  estimates: Estimate[] = [...estimatesData] as Estimate[];
  judgements: Judgement[] = [...judgementsData] as Judgement[];
  myJudgements: Judgement[] = [...myJudgementsData] as Judgement[];
  recentOthers: Judgement[] = [...recentOthersData] as Judgement[];

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cars
  getCars(): CarProfile[] {
    return this.cars;
  }

  createCar(data: { make: string; model: string; year: number; plateNo?: string }): CarProfile {
    const car: CarProfile = {
      id: this.generateId('car'),
      userId: 'mock-user-001',
      make: data.make,
      model: data.model,
      year: data.year,
      plateNo: data.plateNo || null,
      createdAt: new Date().toISOString(),
    };
    this.cars.push(car);
    return car;
  }

  // Estimates
  getEstimate(id: string): Estimate | undefined {
    return this.estimates.find((e) => e.id === id);
  }

  createEstimate(data: {
    carId?: string;
    source: 'manual' | 'photo';
    shopName?: string;
  }): Estimate {
    const car = data.carId ? this.cars.find((c) => c.id === data.carId) : null;
    const estimate: Estimate = {
      id: this.generateId('est'),
      userId: 'mock-user-001',
      carId: data.carId || null,
      source: data.source,
      status: 'draft',
      shopName: data.shopName || null,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      car: car ? { make: car.make, model: car.model, year: car.year } : null,
      items: [],
    };
    this.estimates.push(estimate);
    return estimate;
  }

  addEstimateItem(
    estimateId: string,
    data: {
      name: string;
      category: string;
      laborCost: number;
      partsCost: number;
      note?: string;
    }
  ): EstimateItem | null {
    const estimate = this.estimates.find((e) => e.id === estimateId);
    if (!estimate) return null;

    const item: EstimateItem = {
      id: this.generateId('item'),
      estimateId,
      name: data.name,
      category: data.category,
      laborCost: data.laborCost,
      partsCost: data.partsCost,
      totalCost: data.laborCost + data.partsCost,
      note: data.note || null,
      createdAt: new Date().toISOString(),
    };

    estimate.items.push(item);
    estimate.totalAmount = estimate.items.reduce((sum, i) => sum + i.totalCost, 0);
    estimate.updatedAt = new Date().toISOString();

    return item;
  }

  submitEstimate(id: string): Estimate | null {
    const estimate = this.estimates.find((e) => e.id === id);
    if (!estimate) return null;
    estimate.status = 'submitted';
    estimate.updatedAt = new Date().toISOString();
    return estimate;
  }

  // Judgements
  getJudgement(id: string): Judgement | undefined {
    return this.judgements.find((j) => j.id === id);
  }

  getMyJudgements(): Judgement[] {
    return this.myJudgements;
  }

  getRecentOthers(limit: number = 5): Judgement[] {
    return this.recentOthers.slice(0, limit);
  }

  createJudgement(estimateId: string): Judgement {
    const estimate = this.estimates.find((e) => e.id === estimateId);
    
    // 진단 결과 시뮬레이션 - 랜덤하게 결과 생성
    const labels: Array<'FAIR' | 'CAUTION' | 'EXCESSIVE'> = ['FAIR', 'CAUTION', 'EXCESSIVE'];
    const randomLabel = labels[Math.floor(Math.random() * 3)];
    
    const summaries = {
      FAIR: '전반적으로 적정한 가격의 견적입니다.',
      CAUTION: '일부 항목에서 시세보다 높은 가격이 있습니다.',
      EXCESSIVE: '전체적으로 시세보다 높은 견적입니다. 다른 정비소 견적을 받아보세요.',
    };

    const items: JudgementItem[] = (estimate?.items || []).map((item) => {
      const itemLabel = labels[Math.floor(Math.random() * 3)];
      const fairMin = Math.round(item.totalCost * 0.7);
      const fairMax = Math.round(item.totalCost * 1.1);
      const positionPct = Math.round(((item.totalCost - fairMin) / (fairMax - fairMin)) * 100);

      return {
        itemId: item.id,
        name: item.name,
        category: item.category,
        fairMin,
        fairMax,
        myPrice: item.totalCost,
        positionPct: Math.min(100, Math.max(0, positionPct)),
        resultLabel: itemLabel,
        reasonTags: itemLabel === 'EXCESSIVE' ? ['HIGH_LABOR'] : [],
        notes: null,
      };
    });

    const judgement: Judgement = {
      id: this.generateId('jdg'),
      estimateId,
      version: 1,
      status: 'done',
      result: {
        label: randomLabel,
        confidence: 0.75 + Math.random() * 0.2,
        summary: summaries[randomLabel],
        badges: randomLabel === 'FAIR' ? ['적정 견적'] : randomLabel === 'CAUTION' ? ['주의 필요'] : ['과다 견적'],
      },
      items,
      car: estimate?.car || null,
      shopName: estimate?.shopName || null,
      totalAmount: estimate?.totalAmount || 0,
      createdAt: new Date().toISOString(),
    };

    this.judgements.push(judgement);
    this.myJudgements.unshift(judgement);

    return judgement;
  }

  submitFeedback(judgementId: string, rating: number, comment?: string): boolean {
    const judgement = this.judgements.find((j) => j.id === judgementId);
    if (!judgement) return false;
    // 피드백은 저장만 하고 별도 반환 없음
    console.log(`[Mock] Feedback submitted for ${judgementId}: rating=${rating}, comment=${comment}`);
    return true;
  }

  // 스토어 리셋 (테스트용)
  reset(): void {
    this.cars = [...carsData] as CarProfile[];
    this.estimates = [...estimatesData] as Estimate[];
    this.judgements = [...judgementsData] as Judgement[];
    this.myJudgements = [...myJudgementsData] as Judgement[];
    this.recentOthers = [...recentOthersData] as Judgement[];
  }
}

export const mockStore = new MockStore();
