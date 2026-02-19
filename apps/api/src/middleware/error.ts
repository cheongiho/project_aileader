import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { fail } from '../utils/response';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send(
        fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', error.flatten())
      );
    }

    // Fastify validation error
    if (error.validation) {
      return reply.status(400).send(
        fail('VALIDATION_ERROR', '입력값이 올바르지 않습니다', error.validation)
      );
    }

    app.log.error({ err: error, url: request.url }, 'Unhandled error');

    return reply.status(error.statusCode ?? 500).send(
      fail('INTERNAL_ERROR', error.message ?? '서버 오류가 발생했습니다')
    );
  });
}
