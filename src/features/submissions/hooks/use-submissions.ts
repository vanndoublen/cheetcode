import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useSubmissions = (problemSlug: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.submissions.getAll.queryOptions({ problemSlug }));
};