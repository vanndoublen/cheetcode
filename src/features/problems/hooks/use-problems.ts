import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useProblemsParams } from "./use-problems-params";

export const useSuspenseProblems = () => {
  const trpc = useTRPC();
  const [params] = useProblemsParams();

  return useSuspenseQuery(trpc.problems.getMany.queryOptions(params));
};
