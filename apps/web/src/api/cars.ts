import { apiFetch } from './client';
import type { CreateCarInput } from '@aileader/shared';

export interface CarProfile {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  plateNo?: string | null;
  createdAt: string;
}

export const carsApi = {
  list: () => apiFetch<CarProfile[]>('/api/cars'),

  create: (data: CreateCarInput) =>
    apiFetch<CarProfile>('/api/cars', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
