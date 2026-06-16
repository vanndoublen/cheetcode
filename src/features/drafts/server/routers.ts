import { PAGINATION } from "@/configs/constants";
import { Difficulty, Language } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const userCodeDraftsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        problemId: z.string(),
        language: z.enum(Object.values(Language) as [string, ...string[]]),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { problemId, language } = input;

      const draft = await prisma.userCodeDraft.findUnique({
        where: {
          userId_problemId_language: {
            userId: ctx.auth.userId,
            problemId,
            language: language as Language,
          },
        },
      });

      return draft;
    }),

  create: protectedProcedure
    .input(
      z.object({
        problemId: z.string(),
        language: z.enum(Object.values(Language) as [string, ...string[]]),
        code: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { problemId, language, code } = input;

      const draft = await prisma.userCodeDraft.upsert({
        where: {
          userId_problemId_language: {
            userId: ctx.auth.userId,
            problemId,
            language: language as Language,
          },
        },
        create: {
          userId: ctx.auth.userId,
          problemId,
          language: language as Language,
          code: code,
        },
        update: {
          code: code, 
        }
      });

      return draft;
    }),
});
