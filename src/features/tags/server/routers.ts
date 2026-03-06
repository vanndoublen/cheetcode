import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const tagsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async () => {
    return await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
});
