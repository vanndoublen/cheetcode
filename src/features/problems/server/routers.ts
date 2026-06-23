import { PAGINATION } from "@/configs/constants";
import { Difficulty } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const problemsRouter = createTRPCRouter({
  getMany: baseProcedure
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
        type: z
          .literal(["NeetCode75", "NeetCode150"])
          .nullish()
          .transform((val) => val ?? undefined),
        tags: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // if (!ctx.auth.userId) {
      //   throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      // }
      const { page, pageSize, search, difficulty, category, type, tags } =
        input;
      const isNeetCode75 = type === "NeetCode75" ? true : undefined;
      const isNeetCode150 = type === "NeetCode150" ? true : undefined;
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
            isNeetCode75: true,
            isNeetCode150: true,
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
            isNeetCode75: isNeetCode75,
            isNeetCode150: isNeetCode150,
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
            isNeetCode75: isNeetCode75,
            isNeetCode150: isNeetCode150,
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

  getOne: baseProcedure
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
        include: {
          examples: true,
          hints: true,
          followUps: true,
          snippets: true,
        },
      });
    }),
});
