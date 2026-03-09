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
          .transform((val) => val ?? undefined) as z.ZodType<
          Difficulty | undefined
        >, // convert null → undefined for prisma
        category: z
          .literal([
            "Algorithms",
            "Graph Theory",
            "Data Structures",
            "Concurrency",
            "Database",
          ])
          .nullish()
          .transform((val) => val ?? undefined),
        tags: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize, search, difficulty, category, tags } = input;
      const [items, totalCount] = await Promise.all([
        prisma.problem.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: [
            {
              externalId: "asc",
            },
          ],
          select: {
            slug: true,
            title: true,
            difficulty: true,

            category: {
              select: { name: true },
            },

            tags: {
              select: {
                tag: {
                  select: { name: true },
                },
              },
            },
          },

          where: {
            difficulty: difficulty,
            category: {
              name: category,
            },
            title: {
              contains: search,
              mode: "insensitive",
            },
            tags: tags?.length
              ? {
                  some: {
                    tag: {
                      name: { in: tags },
                    },
                  },
                }
              : undefined,
          },
        }),
        prisma.problem.count({
          where: {
            difficulty: difficulty,
            category: {
              name: category,
            },
            title: {
              contains: search,
              mode: "insensitive",
            },
            tags: tags?.length
              ? {
                  some: {
                    tag: {
                      name: { in: tags },
                    },
                  },
                }
              : undefined,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      if (hasNextPage) items.pop();

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

  getOne: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await prisma.problem.findUnique({
        where: {
          slug: input.slug,
        },
        include:{
          examples: true,
          hints: true,
          followUps: true
        }
      });
    }),
});
