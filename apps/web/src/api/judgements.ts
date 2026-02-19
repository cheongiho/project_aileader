import { apiFetch } from './client';

export interface JudgementItemResponse {
  itemId: string;
  name: string;
  category: string;
  fairMin: number;
  fairMax: number;
  myPrice: number;
  positionPct: number;
  resultLabel: 'FAIR' | 'CAUTION' | 'EXCESSIVE';
  reasonTags: string[];
  notes?: string | null;
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
  items: JudgementItemResponse[];
  car?: { make: string; model: string; year: number } | null;
  shopName?: string | null;
  totalAmount?: number;
  createdAt: string;
}

export const judgementsApi = {
  create: (estimateId: string) =>
    apiFetch<Judgement>('/api/judgements', {
      method: 'POST',
      body: JSON.stringify({ estimateId }),
    }),

  getById: (id: string) => apiFetch<Judgement>(`/api/judgements/${id}`),

  listMine: () => apiFetch<Judgement[]>('/api/me/judgements'),

  recentOthers: (limit = 10) =>
    apiFetch<Judgement[]>(`/api/judgements/recent-others?limit=${limit}`),

  feedback: (id: string, rating: number, comment?: string) =>
    apiFetch(`/api/judgements/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};
