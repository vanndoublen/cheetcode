import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Prisma, SubmissionResult } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { RunResult } from "../server/routers";
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: RunResult | undefined;
}

export const ResultDialog = ({ open, onOpenChange, data }: Props) => {
    const passedCount = data?.results.filter(r => r.passed).length ?? 0;
    const totalCount = data?.results.length ?? 0;
    const allPassed = !!data && passedCount === totalCount;
    const firstFailing = data?.results.find(r => !r.passed);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Test Results</DialogTitle>
                    <DialogDescription>
                        {data?.createdAt?.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-6 py-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Test Cases</p>
                        <p className="text-sm font-medium">{passedCount} / {totalCount}</p>
                    </div>
                    {data?.runtimeMs && (
                        <div>
                            <p className="text-xs text-muted-foreground">Runtime</p>
                            <p className="text-sm font-medium">{data.runtimeMs} ms</p>
                        </div>
                    )}
                    {data?.memoryKb && (
                        <div>
                            <p className="text-xs text-muted-foreground">Memory</p>
                            <p className="text-sm font-medium">{(data.memoryKb / 1024).toFixed(1)} MB</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {data && data.results.map((result, i) => (
                        <div key={result.testCaseId} className={cn("size-8 border border-blue-400 flex items-center justify-center text-center", !result.passed && "border-destructive text-destructive")}>
                            <div>
                                {i + 1}
                            </div>
                        </div>
                    ))}
                </div>

                {allPassed ? (
                    <div className="border-t p-4 text-sm text-green-500">
                        🎉 All test cases passed
                    </div>
                ) : firstFailing && (
                    <div className="border-t p-3 text-xs font-mono whitespace-pre-wrap w-full">
                        <p className="text-muted-foreground mb-1">Output</p>
                        <span>{firstFailing.output ?? "—"}</span>
                    </div>
                )}


                <DialogFooter>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}