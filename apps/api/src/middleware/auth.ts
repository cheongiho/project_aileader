import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';

// Express에 userId 속성 추가
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // /health와 /docs는 인증 불필요
  if (
    req.path === '/health' ||
    req.path.startsWith('/docs') ||
    req.path.startsWith('/documentation')
  ) {
    return next();
  }

  try {
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!userId) {
      // 개발 편의: x-user-id 없으면 기본 사용자 사용
      const defaultUser = await prisma.user.upsert({
        where: { email: 'default@aileader.dev' },
        update: {},
        create: {
          id: 'user_1',
          email: 'default@aileader.dev',
          name: '기본 사용자',
        },
      });
      req.userId = defaultUser.id;
      return next();
    }

    // userId로 User upsert (개발용: 자동 생성)
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@aileader.dev`,
        name: userId,
      },
    });

    req.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}
