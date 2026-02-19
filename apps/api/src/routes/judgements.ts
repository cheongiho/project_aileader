import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { prisma } from '../db/client';
import { CreateJudgementInputSchema, FeedbackInputSchema } from '@aileader/shared';
import { ok, fail } from '../utils/response';
import { computeJudgement } from '../services/judgement.service';

export async function judgementsRoutes(app: FastifyInstance) {
  // POST /api/judgements
  app.post(
    '/api/judgements',
    {
      schema: {
        tags: ['Judgements'],
        summary: '�Ǵ� ��û',
        security: [{ userId: [] }],
        body: {
          type: 'object',
          required: ['estimateId'],
          properties: {
            estimateId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { estimateId } = CreateJudgementInputSchema.parse(request.body);

        const estimate = await prisma.estimate.findUnique({
          where: { id: estimateId },
          include: { items: true },
        });

        if (!estimate) {
          return reply.status(404).send(fail('NOT_FOUND', '견적을 찾을 수 없습니다'));
        }

        if (estimate.items.length === 0) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '견적 항목이 없습니다. 먼저 항목을 추가해주세요'));
        }

        // ���� ����
        const existingCount = await prisma.judgement.count({ where: { estimateId } });
        const version = existingCount + 1;

        // �Ǵ� ���
        const result = computeJudgement(estimate.items);

        // DB ����
        const judgement = await prisma.judgement.create({
          data: {
            estimateId,
            version,
            status: 'done',
            resultLabel: result.label,
            confidence: result.confidence,
            summary: result.summary,
            items: {
              create: result.items.map((item) => ({
                estimateItemId: item.itemId,
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
        return reply.status(201).send(ok(response));
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
        }
        throw err;
      }
    }
  );

  // GET /api/judgements/:id
  app.get(
    '/api/judgements/:id',
    {
      schema: {
        tags: ['Judgements'],
        summary: '�Ǵ� ��� ��',
        security: [{ userId: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

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
        return reply.status(404).send(fail('NOT_FOUND', '판단 결과를 찾을 수 없습니다'));
      }

      // badges 재계산
      const labelKo: Record<string, string> = { FAIR: '적정', CAUTION: '주의', EXCESSIVE: '과다' };
      const badges = judgement.items.map(
        (i) => `${i.estimateItem.name} ${labelKo[i.resultLabel] ?? i.resultLabel}`
      );

      const response = formatJudgementResponse(judgement, badges);
      return reply.send(ok(response));
    }
  );

  // POST /api/judgements/:id/feedback
  app.post(
    '/api/judgements/:id/feedback',
    {
      schema: {
        tags: ['Judgements'],
        summary: '�ǵ�� ����',
        security: [{ userId: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'number', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const body = FeedbackInputSchema.parse(request.body);

        const judgement = await prisma.judgement.findUnique({ where: { id } });
        if (!judgement) {
          return reply.status(404).send(fail('NOT_FOUND', '판단 결과를 찾을 수 없습니다'));
        }

        const feedback = await prisma.feedback.create({
          data: {
            judgementId: id,
            rating: body.rating,
            comment: body.comment,
          },
        });

        return reply.status(201).send(ok(feedback));
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
        }
        throw err;
      }
    }
  );

  // GET /api/judgements/recent-others
  app.get(
    '/api/judgements/recent-others',
    {
      schema: {
        tags: ['Judgements'],
        summary: 'Ÿ���� �ֱ� �Ǵ� �̷�',
        security: [{ userId: [] }],
      },
    },
    async (request, reply) => {
      try {
        const limit = 10;

        const judgements = await prisma.judgement.findMany({
          where: {
            status: 'done',
            estimate: {
              userId: {
                not: request.userId,
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

        return reply.send(ok(result));
      } catch (err) {
        console.error('Recent others error:', err);
        return reply.status(500).send(fail('INTERNAL_ERROR', 'Ÿ���� �Ǵ� �̷��� �ҷ����� ���߽��ϴ�'));
      }
    }
  );
}

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
