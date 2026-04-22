import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { problemsRouter } from '@/features/problems/server/routers';
import { tagsRouter } from '@/features/tags/server/routers';
import { submissionsRouter } from '@/features/submissions/server/routers';
export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  problems: problemsRouter,
  submissions: submissionsRouter, 
});
// export type definition of API
export type AppRouter = typeof appRouter;