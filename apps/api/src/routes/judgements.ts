import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../db/client';
import { CreateJudgementInputSchema, FeedbackInputSchema } from '@aileader/shared';
import { ok, fail } from '../utils/response';
import { computeJudgement } from '../services/judgement.service';

export const judgementsRouter = Router();

// POST /api/judgements
judgementsRouter.post('/api/judgements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estimateId } = CreateJudgementInputSchema.parse(req.body);

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: { items: true },
    });

    if (!estimate) {
      return res.status(404).json(fail('NOT_FOUND', '견적을 찾을 수 없습니다'));
    }

    if (estimate.items.length === 0) {
      return res.status(400).json(fail('VALIDATION_ERROR', '견적 항목이 없습니다. 먼저 항목을 추가해주세요'));
    }

    // 버전 계산
    const existingCount = await prisma.judgement.count({ where: { estimateId } });
    const version = existingCount + 1;

    // 판단 계산
    const result = computeJudgement(estimate.items);

    // DB 저장
    const judgement = await prisma.judgement.create({
      data: {
        estimateId,
        version,
        status: 'done',
        resultLabel: result.resultLabel,
        confidence: result.confidence,
        summary: result.summary,
        items: {
          create: result.items.map((item) => ({
            estimateItemId: item.estimateItemId,
            fairMin: item.fairMin,
            fairMax: item.fairMax,
            myPrice: item.myPrice,
            positionPct: item.positionPct,
            resultLabel: item.resultLabel,
            reasonTags: item.reasonTags,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: { estimateItem: true },
        },
        estimate: { include: { car: true } },
      },
    });

    // badges 재계산
    const labelKo: Record<string, string> = { FAIR: '적정', CAUTION: '주의', EXCESSIVE: '과다' };
    const badges = judgement.items.map(
      (i) => `${i.estimateItem.name} ${labelKo[i.resultLabel] ?? i.resultLabel}`
    );

    const response = formatJudgementResponse(judgement, badges);
    res.status(201).json(ok(response));
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
    }
    next(err);
  }
});

// GET /api/judgements/recent-others (반드시 :id 라우트 위에 위치해야 함)
judgementsRouter.get('/api/judgements/recent-others', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = 10;

    const judgements = await prisma.judgement.findMany({
      where: {
        status: 'done',
        estimate: {
          userId: {
            not: req.userId,
          },
        },
      },
      include: {
        estimate: {
          include: {
            car: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const result = judgements.map((j) => ({
      id: j.id,
      estimateId: j.estimateId,
      version: j.version,
      result: j.resultLabel ? {
        label: j.resultLabel,
        confidence: j.confidence ?? 0,
        summary: j.summary ?? '',
      } : null,
      car: j.estimate.car ? {
        make: j.estimate.car.make,
        model: j.estimate.car.model,
        year: j.estimate.car.year,
      } : null,
      shopName: j.estimate.shopName,
      totalAmount: j.estimate.totalAmount,
      createdAt: j.createdAt.toISOString(),
    }));

    res.json(ok(result));
  } catch (err) {
    console.error('Recent others error:', err);
    res.status(500).json(fail('INTERNAL_ERROR', '타인의 판단 이력을 불러오지 못했습니다'));
  }
});

// GET /api/judgements/:id
judgementsRouter.get('/api/judgements/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const judgement = await prisma.judgement.findUnique({
      where: { id },
      include: {
        items: {
          include: { estimateItem: true },
        },
        estimate: { include: { car: true } },
      },
    });

    if (!judgement) {
      return res.status(404).json(fail('NOT_FOUND', '판단 결과를 찾을 수 없습니다'));
    }

    // badges 재계산
    const labelKo: Record<string, string> = { FAIR: '적정', CAUTION: '주의', EXCESSIVE: '과다' };
    const badges = judgement.items.map(
      (i) => `${i.estimateItem.name} ${labelKo[i.resultLabel] ?? i.resultLabel}`
    );

    const response = formatJudgementResponse(judgement, badges);
    res.json(ok(response));
  } catch (err) {
    next(err);
  }
});

// POST /api/judgements/:id/feedback
judgementsRouter.post('/api/judgements/:id/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = FeedbackInputSchema.parse(req.body);

    const judgement = await prisma.judgement.findUnique({ where: { id } });
    if (!judgement) {
      return res.status(404).json(fail('NOT_FOUND', '판단 결과를 찾을 수 없습니다'));
    }

    const feedback = await prisma.feedback.create({
      data: {
        judgementId: id,
        rating: body.rating,
        comment: body.comment,
      },
    });

    res.status(201).json(ok(feedback));
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
    }
    next(err);
  }
});

function formatJudgementResponse(
  judgement: {
    id: string;
    estimateId: string;
    version: number;
    status: string;
    resultLabel: string | null;
    confidence: number | null;
    overallScore: number | null;
    summary: string | null;
    createdAt: Date;
    items: Array<{
      id: string;
      estimateItemId: string;
      fairMin: number;
      fairMax: number;
      myPrice: number;
      positionPct: number;
      resultLabel: string;
      reasonTags: string[];
      notes: string | null;
      estimateItem?: { name: string; category: string };
    }>;
  },
  badges: string[]
) {
  return {
    id: judgement.id,
    estimateId: judgement.estimateId,
    version: judgement.version,
    status: judgement.status,
    result: judgement.resultLabel
      ? {
          label: judgement.resultLabel,
          confidence: judgement.confidence ?? 0,
          summary: judgement.summary ?? '',
          badges,
        }
      : null,
    items: judgement.items.map((item) => ({
      itemId: item.estimateItemId,
      name: item.estimateItem?.name ?? '',
      category: item.estimateItem?.category ?? '',
      fairMin: item.fairMin,
      fairMax: item.fairMax,
      myPrice: item.myPrice,
      positionPct: item.positionPct,
      resultLabel: item.resultLabel,
      reasonTags: item.reasonTags,
      notes: item.notes,
    })),
    createdAt: judgement.createdAt.toISOString(),
  };
}
