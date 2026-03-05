import { PAGINATION } from "@/configs/constants";
import { Difficulty } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const problemsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        difficulty: z
          .enum(Object.values(Difficulty) as [string, ...string[]])
          .nullish() // accepts null, undefined, or valid enum
          .transform((val) => val ?? undefined), // convert null → undefined for prisma
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, search, difficulty } = input;

      const [items, totalCount] = await Promise.all([
        prisma.problem.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            title: {
              contains: search,
              mode: "insensitive",
            },
            difficulty: difficulty,
          },
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            category: {
              select: {
                name: true,
              },
            },
            tags: {
              select: {
                tag: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        }),
        prisma.problem.count({
          where: {
            title: {
              contains: search,
              mode: "insensitive",
            },
            difficulty: difficulty,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
