import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../db/client';
import { CreateEstimateInputSchema, CreateEstimateItemInputSchema } from '@aileader/shared';
import { ok, fail } from '../utils/response';
import { promises as fs } from 'fs';
import { join } from 'path';
import { IncomingMessage } from 'http';
import formidable from 'formidable';

export const estimatesRouter = Router();

// POST /api/estimates
estimatesRouter.post('/api/estimates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateEstimateInputSchema.parse(req.body);
    const estimate = await prisma.estimate.create({
      data: {
        userId: req.userId,
        carId: body.carId,
        source: body.source ?? 'manual',
        shopName: body.shopName,
        status: 'draft',
        totalAmount: 0,
      },
    });
    res.status(201).json(ok(estimate));
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
    }
    next(err);
  }
});

// GET /api/estimates/:id
estimatesRouter.get('/api/estimates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        items: { orderBy: { createdAt: 'asc' } },
        car: true,
      },
    });

    if (!estimate) {
      return res.status(404).json(fail('NOT_FOUND', '견적을 찾을 수 없습니다'));
    }

    res.json(ok(estimate));
  } catch (err) {
    next(err);
  }
});

// POST /api/estimates/:id/items
estimatesRouter.post('/api/estimates/:id/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = CreateEstimateItemInputSchema.parse(req.body);

    const estimate = await prisma.estimate.findUnique({ where: { id } });
    if (!estimate) {
      return res.status(404).json(fail('NOT_FOUND', '견적을 찾을 수 없습니다'));
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

    res.status(201).json(ok(item));
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
    }
    next(err);
  }
});

// POST /api/estimates/upload-photo
estimatesRouter.post('/api/estimates/upload-photo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = formidable({
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await form.parse(req as unknown as IncomingMessage);

    const photoFile = files.photo?.[0];
    if (!photoFile) {
      return res.status(400).json(fail('VALIDATION_ERROR', '사진 파일이 필요합니다'));
    }

    // 파일 타입 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!allowedTypes.includes(photoFile.mimetype || '')) {
      return res.status(400).json(fail('VALIDATION_ERROR', '지원하지 않는 파일 형식입니다'));
    }

    // 파일 저장
    const filename = `${Date.now()}-${photoFile.originalFilename}`;
    const filepath = join(process.cwd(), 'uploads', filename);
    await fs.rename(photoFile.filepath, filepath);

    // 견적 생성 (photo source)
    const estimate = await prisma.estimate.create({
      data: {
        userId: req.userId,
        carId: fields.carId?.[0],
        source: 'photo',
        shopName: fields.shopName?.[0],
        status: 'draft',
        totalAmount: 0,
      },
    });

    // TODO: AI 분석으로 항목 추출 및 추가

    res.status(201).json(ok({ estimate, photoPath: filename }));
  } catch (err) {
    console.error('Upload error:', err);
    if (err instanceof Error && err.message.includes('maxFileSize')) {
      return res.status(400).json(fail('VALIDATION_ERROR', '파일 크기가 너무 큽니다 (최대 5MB)'));
    }
    return res.status(500).json(fail('INTERNAL_ERROR', '파일 업로드 중 오류가 발생했습니다'));
  }
});
