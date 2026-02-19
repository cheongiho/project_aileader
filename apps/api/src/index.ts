import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import authPlugin from './middleware/auth';
import { registerErrorHandler } from './middleware/error';
import { healthRoutes } from './routes/health';
import { carsRoutes } from './routes/cars';
import { estimatesRoutes } from './routes/estimates';
import { judgementsRoutes } from './routes/judgements';
import { meRoutes } from './routes/me';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

async function main() {
  // CORS
  await app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://project-aileader-55m05huuc-gihos-projects-53d5462b.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-id'],
  });

  // OpenAPI
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'AI Leader API',
        description: '차량 정비 견적 적정 범위 판단 서비스 API (v1)',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          userId: {
            type: 'apiKey',
            in: 'header',
            name: 'x-user-id',
            description: '개발용 사용자 ID (예: user_1)',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });

  // 에러 핸들러
  registerErrorHandler(app);

  // 인증 플러그인
  await app.register(authPlugin);

  // 라우트 등록
  await app.register(healthRoutes);
  await app.register(carsRoutes);
  await app.register(estimatesRoutes);
  await app.register(judgementsRoutes);
  await app.register(meRoutes);

  // For Vercel deployment
  await app.register(require('@fastify/express'));
  await app.ready();

  const port = parseInt(process.env.PORT ?? '3001', 10);
  if (require.main === module) {
    await app.listen({ port, host: '0.0.0.0' });

    console.log(`
  ====================================
  AI Leader API 실행 중
  ====================================
  API:      http://localhost:${port}
  Docs:     http://localhost:${port}/docs
  Health:   http://localhost:${port}/health
  ====================================
  `);
  }

  // Export for Vercel
  export default app;

main().catch((err) => {
  console.error('서버 시작 실패:', err);
  process.exit(1);
});

// Export for Vercel
export default app;
