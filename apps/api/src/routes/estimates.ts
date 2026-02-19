import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { prisma } from '../db/client';
import { CreateEstimateInputSchema, CreateEstimateItemInputSchema } from '@aileader/shared';
import { ok, fail } from '../utils/response';
import { promises as fs } from 'fs';
import { join } from 'path';
import { IncomingMessage } from 'http';
import formidable from 'formidable';

export async function estimatesRoutes(app: FastifyInstance) {
  // POST /api/estimates
  app.post(
    '/api/estimates',
    {
      schema: {
        tags: ['Estimates'],
        summary: '견적 생성',
        security: [{ userId: [] }],
        body: {
          type: 'object',
          properties: {
            carId: { type: 'string' },
            source: { type: 'string', enum: ['manual', 'photo'] },
            shopName: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = CreateEstimateInputSchema.parse(request.body);
        const estimate = await prisma.estimate.create({
          data: {
            userId: request.userId,
            carId: body.carId,
            source: body.source ?? 'manual',
            shopName: body.shopName,
            status: 'draft',
            totalAmount: 0,
          },
        });
        return reply.status(201).send(ok(estimate));
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
        }
        throw err;
      }
    }
  );

  // GET /api/estimates/:id
  app.get(
    '/api/estimates/:id',
    {
      schema: {
        tags: ['Estimates'],
        summary: '견적 상세 조회',
        security: [{ userId: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const estimate = await prisma.estimate.findUnique({
        where: { id },
        include: {
          items: { orderBy: { createdAt: 'asc' } },
          car: true,
        },
      });

      if (!estimate) {
        return reply.status(404).send(fail('NOT_FOUND', '견적을 찾을 수 없습니다'));
      }

      return reply.send(ok(estimate));
    }
  );

  // POST /api/estimates/:id/items
  app.post(
    '/api/estimates/:id/items',
    {
      schema: {
        tags: ['Estimates'],
        summary: '견적 항목 추가',
        security: [{ userId: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['name', 'category', 'totalCost'],
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            laborCost: { type: 'number' },
            partsCost: { type: 'number' },
            totalCost: { type: 'number' },
            note: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const body = CreateEstimateItemInputSchema.parse(request.body);

        const estimate = await prisma.estimate.findUnique({ where: { id } });
        if (!estimate) {
          return reply.status(404).send(fail('NOT_FOUND', '견적을 찾을 수 없습니다'));
        }

        const item = await prisma.estimateItem.create({
          data: {
            estimateId: id,
            name: body.name,
            category: body.category,
            laborCost: body.laborCost,
            partsCost: body.partsCost,
            totalCost: body.totalCost,
            note: body.note,
          },
        });

        // 총액 업데이트
        const allItems = await prisma.estimateItem.findMany({ where: { estimateId: id } });
        const totalAmount = allItems.reduce((sum, i) => sum + i.totalCost, 0);
        await prisma.estimate.update({
          where: { id },
          data: { totalAmount, status: 'submitted' },
        });

        return reply.status(201).send(ok(item));
      } catch (err) {
        if (err instanceof ZodError) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
        }
        throw err;
      }
    }
  );

  // POST /api/estimates/upload-photo
  app.post(
    '/api/estimates/upload-photo',
    {
      schema: {
        tags: ['Estimates'],
        summary: '사진으로 견적 생성',
        security: [{ userId: [] }],
        consumes: ['multipart/form-data'],
        body: {
          type: 'object',
          properties: {
            photo: { type: 'string', format: 'binary' },
            carId: { type: 'string' },
            shopName: { type: 'string' },
          },
          required: ['photo'],
        },
      },
    },
    async (request, reply) => {
      try {
        const form = formidable({
          multiples: false,
          maxFileSize: 5 * 1024 * 1024, // 5MB
        });

        const [fields, files] = await form.parse(request.raw as IncomingMessage);

        const photoFile = files.photo?.[0];
        if (!photoFile) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '사진 파일이 필요합니다'));
        }

        // 파일 타입 확인
        const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
        if (!allowedTypes.includes(photoFile.mimetype || '')) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '지원하지 않는 파일 형식입니다'));
        }

        // 파일 저장
        const filename = `${Date.now()}-${photoFile.originalFilename}`;
        const filepath = join(process.cwd(), 'uploads', filename);
        await fs.rename(photoFile.filepath, filepath);

        // 견적 생성 (photo source)
        const estimate = await prisma.estimate.create({
          data: {
            userId: request.userId,
            carId: fields.carId?.[0],
            source: 'photo',
            shopName: fields.shopName?.[0],
            status: 'draft',
            totalAmount: 0,
          },
        });

        // TODO: AI 분석으로 항목 추출 및 추가

        return reply.status(201).send(ok({ estimate, photoPath: filename }));
      } catch (err) {
        console.error('Upload error:', err);
        if (err instanceof Error && err.message.includes('maxFileSize')) {
          return reply.status(400).send(fail('VALIDATION_ERROR', '파일 크기가 너무 큽니다 (최대 5MB)'));
        }
        return reply.status(500).send(fail('INTERNAL_ERROR', '파일 업로드 중 오류가 발생했습니다'));
      }
    }
  );
}
