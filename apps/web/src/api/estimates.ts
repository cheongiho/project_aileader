import { apiFetch, ApiError } from './client';
import type { CreateEstimateInput, CreateEstimateItemInput } from '@aileader/shared';

export interface EstimateItem {
  id: string;
  estimateId: string;
  name: string;
  category: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  note?: string | null;
  createdAt: string;
}

export interface Estimate {
  id: string;
  userId?: string | null;
  carId?: string | null;
  source: 'manual' | 'photo';
  status: 'draft' | 'submitted';
  shopName?: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: EstimateItem[];
  car?: { make: string; model: string; year: number } | null;
}

export const estimatesApi = {
  create: (data: CreateEstimateInput) =>
    apiFetch<Estimate>('/api/estimates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadPhoto: async (file: File, carId?: string, shopName?: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    if (carId) formData.append('carId', carId);
    if (shopName) formData.append('shopName', shopName);

    const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/estimates/upload-photo`, {
      method: 'POST',
      headers: {
        'x-user-id': import.meta.env.VITE_USER_ID ?? 'user_1',
      },
      body: formData,
    });

    const json = await res.json().catch(() => ({ ok: false, error: { code: 'PARSE_ERROR', message: res.statusText } }));

    if (!res.ok || json.ok === false) {
      const error = json.error ?? { code: 'API_ERROR', message: '요청에 실패했습니다' };
      throw new ApiError(res.status, error.code, error.message, error.details);
    }

    return json.data ?? json;
  },

  getById: (id: string) => apiFetch<Estimate>(`/api/estimates/${id}`),

  addItem: (estimateId: string, data: CreateEstimateItemInput) =>
    apiFetch<EstimateItem>(`/api/estimates/${estimateId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
