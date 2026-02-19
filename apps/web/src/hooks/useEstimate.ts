import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { estimatesApi } from '../api/estimates';
import type { CreateEstimateInput, CreateEstimateItemInput } from '@aileader/shared';

export const estimateKeys = {
  all: ['estimates'] as const,
  detail: (id: string) => ['estimates', id] as const,
};

export function useEstimate(id: string) {
  return useQuery({
    queryKey: estimateKeys.detail(id),
    queryFn: () => estimatesApi.getById(id),
    enabled: !!id && id !== 'mock-estimate-fail',
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEstimateInput) => estimatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.all });
    },
  });
}

export function useAddEstimateItem(estimateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEstimateItemInput) => estimatesApi.addItem(estimateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.detail(estimateId) });
    },
  });
}
