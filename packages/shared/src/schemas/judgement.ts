import { z } from 'zod';

export const ResultLabelValues = ['FAIR', 'CAUTION', 'EXCESSIVE'] as const;
export const ResultLabelSchema = z.enum(ResultLabelValues);

export const JudgementStatusValues = ['queued', 'done', 'failed'] as const;
export const JudgementStatusSchema = z.enum(JudgementStatusValues);

export const JudgementItemSchema = z.object({
  itemId: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  fairMin: z.number().int().nonnegative(),
  fairMax: z.number().int().nonnegative(),
  myPrice: z.number().int().nonnegative(),
  positionPct: z.number(),
  resultLabel: ResultLabelSchema,
  reasonTags: z.array(z.string()),
  notes: z.string().nullable().optional(),
});

export const JudgementResultSchema = z.object({
  label: ResultLabelSchema,
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  badges: z.array(z.string()),
});

export const JudgementSchema = z.object({
  id: z.string().uuid(),
  estimateId: z.string().uuid(),
  version: z.number().int().min(1),
  status: JudgementStatusSchema,
  result: JudgementResultSchema.nullable().optional(),
  items: z.array(JudgementItemSchema),
  createdAt: z.string().datetime(),
});

export const CreateJudgementInputSchema = z.object({
  estimateId: z.string().uuid('올바른 견적 ID를 입력하세요'),
});

export const FeedbackInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type ResultLabel = z.infer<typeof ResultLabelSchema>;
export type JudgementStatus = z.infer<typeof JudgementStatusSchema>;
export type JudgementItem = z.infer<typeof JudgementItemSchema>;
export type JudgementResult = z.infer<typeof JudgementResultSchema>;
export type Judgement = z.infer<typeof JudgementSchema>;
export type CreateJudgementInput = z.infer<typeof CreateJudgementInputSchema>;
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;
