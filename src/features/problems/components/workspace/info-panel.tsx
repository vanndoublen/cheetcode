import { useProblemWorkspace } from "../../hooks/use-problems"
import { AIResponse } from "./response"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export const InfoPanel = ({ slug }: { slug: string }) => {
    return (
        <Tabs defaultValue="solution" className="w-full h-full flex flex-col">

            <TabsList className="sticky top-0 z-10 w-full h-12 bg-background/80 backdrop-blur-md rounded-none border-b p-1">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="flex-1 overflow-y-auto p-4">
                <DescriptionTab slug={slug} />
            </TabsContent>
            <TabsContent value="solution" className="flex-1 overflow-y-auto p-4">
                <SolutionTab slug={slug} />
            </TabsContent>
        </Tabs>
    )
}

const DescriptionTab = ({ slug }: { slug: string }) => {
    // Assuming your query includes: {examples: true, hints: true, followUps: true }
    const { data } = useProblemWorkspace(slug);

    if (!data) return null;

    // 1. BASE DESCRIPTION (Cleaned)
    const autoHighlight = (text: string) => {
        // Regex matches common LeetCode variables and wraps them in backticks
        return text.replace(/\b(nums|target|l1|l2|nums\[i\]|val|head|node)\b/g, "`$1`");
    };

    // Then use it in your mapping logic:
    const cleanDescription = autoHighlight(data.description.split(/Example 1:/i)[0].trim());

    // 2. EXAMPLES
    // Inside your DescriptionPanel component
    const examplesMarkdown = data.examples
        ?.sort((a, b) => a.order - b.order)
        .map((ex) => {
            // Use a regex to separate the labels from the content
            // This puts the labels in an array and the content in between
            const parts = ex.content.split(/(Input:|Output:|Explanation:)/g).filter(Boolean);

            let formatted = `**Example ${ex.order}:**\n\n`;

            for (let i = 0; i < parts.length; i += 2) {
                const label = parts[i].trim();
                const value = parts[i + 1]?.trim() || "";

                // We append the label as bold text, 
                // and the value in backticks to trigger the code styling!
                formatted += `**${label}** \`${value}\`\n\n`;
            }

            return formatted;
        })
        .join("\n---\n\n"); // Adds a nice horizontal line between examples

    const fixConstraints = (text: string) => {
        // 1. Replace 109 -> 10^9 and 104 -> 10^4
        // We add $$ around it so Katex knows to render it as math
        return text.replace(/10([49])\b/g, "$$10^{$1}$$");
    };
    // 3. CONSTRAINTS
    let constraintsMarkdown = "";
    if (data.constraints) {
        try {
            const parsed = JSON.parse(data.constraints);
            if (Array.isArray(parsed)) {
                constraintsMarkdown = `**Constraints:**\n\n${parsed.map((c: string) => {
                    const cleanText = c.replace(/^\d+\.\s*/, '');
                    const formattedConstraint = fixConstraints(cleanText);

                    // If the constraint contains a formula ($$), don't use backticks.
                    // If it's plain text, use backticks.
                    return formattedConstraint.includes("$$")
                        ? `- ${formattedConstraint}`
                        : `- \`${formattedConstraint}\``;
                }).join("\n")}`;
            }
        } catch {
            const list = data.constraints.split('\n').filter(Boolean);
            constraintsMarkdown = `**Constraints:**\n\n${list.map((c) => {
                const cleanText = c.replace(/^\d+\.\s*/, '').replace(/^- /g, '');
                return `- \`${cleanText}\``;
            }).join("\n")}`;
        }
    }



    // 4. FOLLOW-UPS (If the problem has them, e.g., "Can you do it in O(n) time?")
    const followUpsMarkdown = data.followUps && data.followUps.length > 0
        ? `**Follow-up:** ${data.followUps.map(f => f.content).join(" ")}`
        : "";

    // 5. HINTS (Rendered as Markdown Blockquotes or Lists)
    const hintsMarkdown = data.hints && data.hints.length > 0
        ? `**Hints:**\n\n${data.hints
            .sort((a, b) => a.order - b.order)
            .map((h) => `<details><summary>Hint ${h.order}</summary>\n\n${h.content}\n\n</details>`)
            .join('\n\n')}`
        : "";

    // STITCH EVERYTHING TOGETHER
    const finalMarkdown = [
        cleanDescription,
        examplesMarkdown,
        constraintsMarkdown,
        followUpsMarkdown,
        hintsMarkdown
    ].filter(Boolean).join("\n\n---\n\n"); // Adds a nice Leetcode-style divider line between sections!
    console.log(finalMarkdown)
    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="font-semibold text-lg">{data.title}</h1>

            <AIResponse className="text-sm space-y-4">
                {finalMarkdown}
            </AIResponse>
        </div>
    );
};

const SolutionTab = ({ slug }: { slug: string }) => {
    const { data } = useProblemWorkspace(slug);

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
};