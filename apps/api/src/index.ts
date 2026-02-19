import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { healthRouter } from './routes/health';
import { carsRouter } from './routes/cars';
import { estimatesRouter } from './routes/estimates';
import { judgementsRouter } from './routes/judgements';
import { meRouter } from './routes/me';

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://project-aileader-55m05huuc-gihos-projects-53d5462b.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-id'],
  })
);

// OpenAPI / Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
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
  apis: ['./src/routes/*.ts'],
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 인증 미들웨어
app.use(authMiddleware);

// 라우트 등록
app.use(healthRouter);
app.use(carsRouter);
app.use(estimatesRouter);
app.use(judgementsRouter);
app.use(meRouter);

// 에러 핸들러 (반드시 라우트 뒤에 등록)
app.use(errorHandler);

const port = parseInt(process.env.PORT ?? '3001', 10);
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`
  ====================================
  AI Leader API 실행 중
  ====================================
  API:      http://localhost:${port}
  Docs:     http://localhost:${port}/docs
  Health:   http://localhost:${port}/health
  ====================================
    `);
  });
}

// Export for Vercel
export default app;
