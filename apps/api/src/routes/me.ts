import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { ok } from '../utils/response';

export async function meRoutes(app: FastifyInstance) {
  // GET /api/me/judgements
  app.get(
    '/api/me/judgements',
    {
      schema: {
        tags: ['Me'],
        summary: '내 판단 이력',
        security: [{ userId: [] }],
      },
    },
    async (request, reply) => {
      const judgements = await prisma.judgement.findMany({
        where: {
          estimate: { userId: request.userId },
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

      return reply.send(ok(formatted));
    }
  );
}
