import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query";

export const useTags = () => {
    const trpc = useTRPC();
    return useQuery(trpc.tags.getMany.queryOptions()); 
}