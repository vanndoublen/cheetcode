import { DotSwarm } from "@/components/customs/OrganicLoaders";
import { Button } from "@/components/ui/button"
import { RunResult } from "@/features/submissions/server/routers";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client"
import { BadgeX, CheckCircle, CheckListIcon, Copy, CroissantFreeIcons, Crosshair } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const TestRunPanel = ({ problemSlug, sourceCode, language }: { problemSlug: string, sourceCode: string, language: string }) => {
    const [tab, setTab] = useState(0);
    const [successCases, setSuccessCases] = useState<string[]>([]);
    const [runResults, setRunResults] = useState<RunResult>();
    const [isRanTest, setIsRanTest] = useState(false);

    const trpc = useTRPC();
    const { data } = useQuery(trpc.submissions.getPublicCases.queryOptions({
        problemSlug
    }));

    const testCase = data ? data[tab] : null;
    const result = runResults?.results[tab];


    const runtestMutate = useMutation(trpc.submissions.run.mutationOptions({
        onSuccess(data) {
            setSuccessCases(data.results.filter((t) => t.passed).map((t) => t.testCaseId));
            setRunResults(data);
            setIsRanTest(true);
        }
    }));

    const handleRuntest = async (problemSlug: string, sourceCode: string, language: string) => {
        await runtestMutate.mutateAsync({
            problemSlug,
            sourceCode,
            language,
            isHidden: false,
            isSave: false,
        });
    }



    if (testCase === null || !data) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex px-3 py-2 justify-between items-center border-b">
                <div className="flex text-xs">
                    {data?.map((t, i) => (
                        <button
                            key={i}
                            onClick={() => setTab(i)}
                            className={cn("py-1 px-8 cursor-pointer flex items-center justify-center gap-2",
                                tab === i ?
                                    "bg-muted" :
                                    "text-muted-foreground bg-transparent ",


                            )}
                        >
                            Case {i + 1}
                            {successCases.includes(t.id) ?
                                (<HugeiconsIcon icon={CheckCircle} strokeWidth={2} className="size-3 text-blue-400" />) :
                                (isRanTest && <HugeiconsIcon icon={BadgeX} strokeWidth={2} className="size-3 text-red-400" />)
                            }
                        </button>
                    ))}
                </div>
                <Button
                    className="w-20"
                    onClick={() => handleRuntest(problemSlug, sourceCode, language)}
                    disabled={runtestMutate.isPending}
                    variant="outline">
                    {runtestMutate.isPending ? (
                        <div>
                            <DotSwarm size={28} color="#ffffff" />
                        </div>
                    ) : (
                        <div>
                            Run Test
                        </div>
                    )}
                </Button>
            </div>
            <div className="flex-1 h-full overflow-auto px-4 py-3 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Input</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => navigator.clipboard.writeText(testCase.input)}
                        >
                            <HugeiconsIcon icon={Copy} strokeWidth={2} data-icon="inline-start" className="h-2 w-2" />


                        </Button>
                    </div>
                    <pre className="bg-muted rounded-md px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
                        {testCase.input}
                    </pre>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Expected</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => navigator.clipboard.writeText(testCase.expected)}
                        >

                            <HugeiconsIcon icon={Copy} strokeWidth={2} data-icon="inline-start" className="h-2 w-2" />
                        </Button>
                    </div>
                    <pre className="bg-muted rounded-md px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
                        {testCase.expected}
                    </pre>
                </div>

                {testCase.stdin && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">stdin</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => navigator.clipboard.writeText(testCase.stdin ?? "")}
                            >
                                <HugeiconsIcon icon={Copy} strokeWidth={2} data-icon="inline-start" className="h-2 w-2" />
                            </Button>
                        </div>
                        <pre className="bg-muted rounded-md px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
                            {testCase.stdin}
                        </pre>
                    </div>
                )}

                {isRanTest && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className={"text-xs font-medium text-muted-foreground"}>Result</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => navigator.clipboard.writeText(result?.output ?? "")}
                            >
                                <HugeiconsIcon icon={Copy} strokeWidth={2} data-icon="inline-start" className="h-2 w-2" />
                            </Button>
                        </div>
                        <pre className="bg-muted rounded-md px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
                            {successCases.includes(testCase.id) ? (
                                <>
                                    <div className="text-blue-400">Passed:</div>
                                    <div>{result?.output}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-red-400">Failed:</div>
                                    <div>{result?.output}</div>
                                </>
                            )}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}