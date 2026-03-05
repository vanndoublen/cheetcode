import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { problemsRouter } from '@/features/problems/server/routers';
export const appRouter = createTRPCRouter({
  problems: problemsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;