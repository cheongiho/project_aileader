import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { ok } from '../utils/response';

export const meRouter = Router();

// GET /api/me/judgements
meRouter.get('/api/me/judgements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const judgements = await prisma.judgement.findMany({
      where: {
        estimate: { userId: req.userId },
      },
      include: {
        items: {
          include: { estimateItem: true },
        },
        estimate: {
          include: { car: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = judgements.map((j) => {
      const labelKo: Record<string, string> = { FAIR: '적정', CAUTION: '주의', EXCESSIVE: '과다' };
      const badges = j.items.map(
        (i) => `${i.estimateItem.name} ${labelKo[i.resultLabel] ?? i.resultLabel}`
      );

      return {
        id: j.id,
        estimateId: j.estimateId,
        version: j.version,
        status: j.status,
        result: j.resultLabel
          ? {
              label: j.resultLabel,
              confidence: j.confidence ?? 0,
              summary: j.summary ?? '',
              badges,
            }
          : null,
        car: j.estimate.car
          ? {
              make: j.estimate.car.make,
              model: j.estimate.car.model,
              year: j.estimate.car.year,
            }
          : null,
        shopName: j.estimate.shopName,
        totalAmount: j.estimate.totalAmount,
        createdAt: j.createdAt.toISOString(),
      };
    });

    res.json(ok(formatted));
  } catch (err) {
    next(err);
  }
});
