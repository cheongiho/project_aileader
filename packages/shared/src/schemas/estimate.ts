import { z } from 'zod';

export const RepairCategoryValues = [
  'ENGINE_OIL',
  'BRAKE',
  'TIRE',
  'SUSPENSION',
  'BATTERY',
  'COOLING',
  'ELECTRICAL',
  'ETC',
] as const;

export const RepairCategorySchema = z.enum(RepairCategoryValues);

export const EstimateItemSchema = z.object({
  id: z.string().uuid(),
  estimateId: z.string().uuid(),
  name: z.string().min(1),
  category: RepairCategorySchema,
  laborCost: z.number().int().nonnegative(),
  partsCost: z.number().int().nonnegative(),
  totalCost: z.number().int().nonnegative(),
  note: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const EstimateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable().optional(),
  carId: z.string().uuid().nullable().optional(),
  source: z.enum(['manual', 'photo']),
  status: z.enum(['draft', 'submitted']),
  shopName: z.string().nullable().optional(),
  totalAmount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(EstimateItemSchema).optional(),
});

export const CreateEstimateInputSchema = z.object({
  carId: z.string().uuid().optional(),
  source: z.enum(['manual', 'photo']).default('manual'),
  shopName: z.string().optional(),
});

export const CreateEstimateItemInputSchema = z.object({
  name: z.string().min(1, '항목명을 입력하세요'),
  category: RepairCategorySchema,
  laborCost: z.number().int().nonnegative(),
  partsCost: z.number().int().nonnegative(),
  totalCost: z.number().int().nonnegative(),
  note: z.string().optional(),
});

export type RepairCategory = z.infer<typeof RepairCategorySchema>;
export type EstimateItem = z.infer<typeof EstimateItemSchema>;
export type Estimate = z.infer<typeof EstimateSchema>;
export type CreateEstimateInput = z.infer<typeof CreateEstimateInputSchema>;
export type CreateEstimateItemInput = z.infer<typeof CreateEstimateItemInputSchema>;
