import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fail } from '../utils/response';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json(
      fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', err.flatten())
    );
  }

  console.error({ err, url: req.url }, 'Unhandled error');

  return res.status(err.statusCode ?? err.status ?? 500).json(
    fail('INTERNAL_ERROR', err.message ?? '서버 오류가 발생했습니다')
  );
}
