import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useProblemsParams } from "./use-problems-params";

export const useSuspenseProblems = () => {
  const trpc = useTRPC();
  const [params] = useProblemsParams();

  return useSuspenseQuery(trpc.problems.getMany.queryOptions(params));
};

export const useProblemWorkspace = (slug: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.problems.getOne.queryOptions({ slug }));
};
