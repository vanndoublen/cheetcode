import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query";

export const TestRunPanel = ({ problemSlug }: { problemSlug: string }) => {
    

    const trpc = useTRPC();
    const testCases = useQuery(trpc.submissions.getPublicCases.queryOptions({
        problemSlug
    }))
    return (
        <div className="flex flex-col h-full">
            <div className="flex px-3 py-2 justify-between items-center border-b">
                <span className="text-sm">Testing</span>
                <Button variant="outline">Run Test</Button>
            </div>
            <div className="flex-1 h-20">
                {JSON.stringify(testCases, null, 2)}
            </div>
        </div>
    )
}