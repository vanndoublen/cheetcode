"use client"; 

import { useParams } from "next/navigation";

import { useProblemWorkspace } from "@/features/problems/hooks/use-problems";
import { AIResponse } from "@/features/problems/components/workspace/response";

const Page = () => {
    const { problemSlug } = useParams<{ problemSlug: string }>();

    const { data } = useProblemWorkspace(problemSlug);

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

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="font-semibold text-lg">{data.title}</h1>

            <AIResponse className="text-sm space-y-4">
                {finalMarkdown}
            </AIResponse>
        </div>
    );
}

export default Page; 