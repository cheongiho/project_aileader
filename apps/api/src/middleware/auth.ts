import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '../db/client';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

async function authPlugin(app: FastifyInstance) {
  app.decorateRequest('userId', '');

  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // /health와 /docs는 인증 불필요
    if (
      request.url === '/health' ||
      request.url.startsWith('/docs') ||
      request.url.startsWith('/documentation')
    ) {
      return;
    }

    const userId = request.headers['x-user-id'] as string | undefined;

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
      request.userId = defaultUser.id;
      return;
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

    request.userId = user.id;
  });
}

export default fp(authPlugin);
