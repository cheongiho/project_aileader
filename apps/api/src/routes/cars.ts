import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../db/client';
import { CreateCarInputSchema } from '@aileader/shared';
import { ok, fail } from '../utils/response';

export const carsRouter = Router();

// GET /api/cars
carsRouter.get('/api/cars', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cars = await prisma.carProfile.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ok(cars));
  } catch (err) {
    next(err);
  }
});

// POST /api/cars
carsRouter.post('/api/cars', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateCarInputSchema.parse(req.body);
    const car = await prisma.carProfile.create({
      data: {
        userId: req.userId,
        make: body.make,
        model: body.model,
        year: body.year,
        plateNo: body.plateNo,
      },
    });
    res.status(201).json(ok(car));
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json(fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten()));
    }
    next(err);
  }
});
