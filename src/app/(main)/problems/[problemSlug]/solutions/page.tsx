"use client"; 

import { useParams } from "next/navigation";

import { useProblemWorkspace } from "@/features/problems/hooks/use-problems";
import { AIResponse } from "@/features/problems/components/workspace/response";

const Page = () => {
    const { problemSlug } = useParams<{ problemSlug: string }>();
    const { data } = useProblemWorkspace(problemSlug);

    if (!data) return null;

    // If there is no solution in the database for this problem
    if (!data.solution) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No solution is currently available for this problem.
            </div>
        );
    }

    // Format the scraped solution string
    const formattedSolution = data.solution
        .replace("[TOC]", "## Table of Contents\n\n[TOC]")
        .replace(/---##/g, "---\n\n##")
        // STRIP plain text labels and keep the LaTeX block
        // This regex looks for "Time complexity: O(n)" and replaces it with "Time complexity: "
        .replace(/Time complexity: O\([^\)]+\)/gi, "Time complexity:")
        .replace(/Space complexity: O\([^\)]+\)/gi, "Space complexity:")
        .replace(/equals to target - x/gi, "equals to $$target - x$$") // Fixes raw text math
        .replace(
            /\*\*Implementation\*\*\*\*Complexity Analysis\*\*/g,
            "**Implementation**\n\n**Complexity Analysis**"
        );

    console.log(formattedSolution)
    return (
        <AIResponse className="text-sm space-y-4">
            {formattedSolution}
        </AIResponse>
    );
}

export default Page; 