"use client";
import CodeBlock from "@/features/problems/components/workspace/code-block";
import { AIResponse } from "@/features/problems/components/workspace/response";
import { getLanguageDisplayName, getShikiLanguage, getSubmissionStatusDisplayName } from "@/features/problems/utils";
import { useSubmissions } from "@/features/submissions/hooks/use-submissions";
import { ArrowLeft01FreeIcons, ArrowLeft02FreeIcons, LinerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import { codeToHtml } from 'shiki'


const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { problemSlug } = useParams<{ problemSlug: string }>();
    const { data: submissions } = useSubmissions(problemSlug);

    if (!submissions) {
        return null;
    }

    const indexParam = searchParams.get("submissionsIndex");
    const selectedIndex = indexParam !== null ? Number(indexParam) : null;

    const selectedSubmission =
        selectedIndex !== null &&
            !Number.isNaN(selectedIndex) &&
            selectedIndex >= 0 &&
            selectedIndex < submissions.length
            ? submissions[selectedIndex]
            : undefined;

    const passedCounts = selectedSubmission?.results.filter(r => r.passed).length || 0;
    const totalCounts = selectedSubmission?.results.length || 0;

    const handleClick = (i: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("submissionsIndex", String(i));
        router.push(`/problems/${problemSlug}/submissions?${params.toString()}`);
    };

    if (selectedSubmission) {
        return (

            <>


                <div className="h-full w-full flex flex-col text-sm gap-y-4">
                    <div className="border-b">
                        <button
                            className="text-xs hover:text-foreground text-muted-foreground flex items-center mb-4 gap-x-1"
                            onClick={() => router.push(`/problems/${problemSlug}/submissions`)}
                        >
                            <HugeiconsIcon icon={ArrowLeft02FreeIcons} strokeWidth={1} size={16} />
                            All Submissions
                        </button>
                    </div>
                    <div>
                        <div className="text-lg">{getSubmissionStatusDisplayName(selectedSubmission.status)}</div>
                        <div className="text-muted-foreground text-xs">{selectedSubmission.finishedAt?.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                        })}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs p-4">
                        <div className="flex flex-col items-center">
                            <span>Runtime</span>
                            <span className="text-muted-foreground">{selectedSubmission.runtimeMs} Ms</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span>Memory</span>
                            <span className="text-muted-foreground">{(selectedSubmission.memoryKb || 0) / 1000} MB</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span>Passed</span>
                            <span className="text-muted-foreground">{passedCounts} / {totalCounts}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span>Language</span>
                            <span className="text-muted-foreground">{getLanguageDisplayName(selectedSubmission.language)}</span>
                        </div>
                    </div>
                    <div className="border">
                        <CodeBlock lang={getShikiLanguage(selectedSubmission.language)}
                            code={selectedSubmission.sourceCode} />
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="h-full w-full flex flex-col text-sm">
            {submissions.map((sub, i) => (

                <div
                    key={sub.id}
                    className="grid grid-cols-4 justify-center items-center px-4 py-2 border text-xs m-1"

                >
                    <div>
                        <span className="text-muted-foreground pr-4">{i + 1}.</span>
                        <span>{getLanguageDisplayName(sub.language)}</span>
                    </div>
                    <div>
                        {getSubmissionStatusDisplayName(sub.status)}
                    </div>

                    <button
                        onClick={() => handleClick(i)}
                        className="hover:text-muted-foreground"
                    >
                        View
                    </button>

                    <div className="text-muted-foreground text-xs">{sub.finishedAt?.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    })}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Page; 