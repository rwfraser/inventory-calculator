
import { z } from 'zod';
import { insertHistorySchema, history } from './schema';

export const api = {
  history: {
    list: {
      method: 'GET' as const,
      path: '/api/history',
      responses: {
        200: z.array(z.custom<typeof history.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/history',
      input: insertHistorySchema,
      responses: {
        201: z.custom<typeof history.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/history',
      responses: {
        204: z.void(),
      },
    }
  }
};
