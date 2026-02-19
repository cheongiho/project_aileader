import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { prisma } from '../db/client';
import { CreateCarInputSchema } from '@aileader/shared';
import { ok, fail } from '../utils/response';

export async function carsRoutes(app: FastifyInstance) {
  // GET /api/cars
  app.get(
    '/api/cars',
    {
      schema: {
        tags: ['Cars'],
        summary: '내 차량 목록',
        security: [{ userId: [] }],
      },
    },
    async (request, reply) => {
      const cars = await prisma.carProfile.findMany({
        where: { userId: request.userId },
        orderBy: { createdAt: 'desc' },
      });
      return reply.send(ok(cars));
    }
  );

  // POST /api/cars
  app.post(
    '/api/cars',
    {
      schema: {
        tags: ['Cars'],
        summary: '차량 등록',
        security: [{ userId: [] }],
        body: {
          type: 'object',
          required: ['make', 'model', 'year'],
          properties: {
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'number' },
            plateNo: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = CreateCarInputSchema.parse(request.body);
        const car = await prisma.carProfile.create({
          data: {
            userId: request.userId,
            make: body.make,
            model: body.model,
            year: body.year,
            plateNo: body.plateNo,
          },
        });
        return reply.status(201).send(ok(car));
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
        }
        throw err;
      }
    }
  );
}
