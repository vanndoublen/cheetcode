import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.problems.getMany>;

export const prefetchProblems = (params: Input) => {
  return prefetch(trpc.problems.getMany.queryOptions(params));
};

export const prefetchProblemWorkspace = (slug: string) => {
  return prefetch(trpc.problems.getOne.queryOptions({ slug }));
};
