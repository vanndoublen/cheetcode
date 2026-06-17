import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query";

export const useUserCodeDraft = ( problemId: string, language: string) => {
    const trpc = useTRPC(); 
    return useQuery(trpc.userCodeDrafts.getOne.queryOptions({problemId, language})); 
}