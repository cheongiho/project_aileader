import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../api/cars';
import { setSelectedCarId } from '../lib/storage';
import type { CreateCarInput } from '@aileader/shared';

export const carKeys = {
  all: ['cars'] as const,
};

export function useCarList() {
  return useQuery({
    queryKey: carKeys.all,
    queryFn: carsApi.list,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarInput) => carsApi.create(data),
    onSuccess: (car) => {
      queryClient.invalidateQueries({ queryKey: carKeys.all });
      // 새로 만든 차를 선택된 차로 설정
      setSelectedCarId(car.id);
    },
  });
}
