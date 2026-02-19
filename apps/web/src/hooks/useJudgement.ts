import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { judgementsApi } from '../api/judgements';

export const judgementKeys = {
  all: ['judgements'] as const,
  mine: ['judgements', 'mine'] as const,
  recentOthers: ['judgements', 'recent-others'] as const,
  detail: (id: string) => ['judgements', id] as const,
};

export function useJudgement(id: string) {
  return useQuery({
    queryKey: judgementKeys.detail(id),
    queryFn: () => judgementsApi.getById(id),
    enabled: !!id && id !== 'any-id',
  });
}

export function useMyJudgements() {
  return useQuery({
    queryKey: judgementKeys.mine,
    queryFn: judgementsApi.listMine,
  });
}

export function useRecentOthersJudgements(limit = 10) {
  return useQuery({
    queryKey: [...judgementKeys.recentOthers, limit],
    queryFn: () => judgementsApi.recentOthers(limit),
  });
}

export function useCreateJudgement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (estimateId: string) => judgementsApi.create(estimateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgementKeys.mine });
    },
  });
}

export function useFeedback(judgementId: string) {
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      judgementsApi.feedback(judgementId, rating, comment),
  });
}
