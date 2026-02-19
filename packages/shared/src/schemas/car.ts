import { z } from 'zod';

export const CarProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  plateNo: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const CreateCarInputSchema = z.object({
  make: z.string().min(1, '제조사를 입력하세요'),
  model: z.string().min(1, '모델명을 입력하세요'),
  year: z
    .number()
    .int()
    .min(1980, '1980년 이후 연식을 입력하세요')
    .max(new Date().getFullYear() + 1, '올바른 연식을 입력하세요'),
  plateNo: z.string().optional(),
});

export type CarProfile = z.infer<typeof CarProfileSchema>;
export type CreateCarInput = z.infer<typeof CreateCarInputSchema>;
