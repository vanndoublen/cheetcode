import { Language } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": process.env.JUDGE0_RAPIDAPI_KEY!,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
};

export const submissionsRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        problemSlug: z.string(),
        sourceCode: z.string(),
        language: z.enum(Object.values(Language) as [string, ...string[]]),
        isHidden: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("KEY EXISTS:", !!process.env.JUDGE0_RAPIDAPI_KEY);
        console.log("KEY LENGTH:", process.env.JUDGE0_RAPIDAPI_KEY?.length);
        const { problemSlug, sourceCode } = input;

        const problem = await prisma.problem.findUnique({
          where: { slug: problemSlug },
        });

        if (!problem || !problem.pythonPrompt || !problem.entryPoint) {
          return;
        }

        const testCases = await prisma.testCase.findMany({
          where: {
            problemId: problem.id,
            stdin: { not: null },
          },
          take: 20, // cap during dev to keep costs low
        });

        const fullScript = `${problem.pythonPrompt}\n\n${sourceCode}\n\nimport sys\n_data = sys.stdin.read().splitlines()\n_args = [eval(line) for line in _data if line.strip()]\nprint(${problem.entryPoint}(*_args))`;

        const submissions = testCases.map((t) => ({
          source_code: fullScript,
          language_id: 71,
          stdin: t.stdin,
          expected_output: t.expected,
        }));

        const BATCH_SIZE = 20;
        const allTokens: { token: string }[] = [];

        for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
          const chunk = submissions.slice(i, i + BATCH_SIZE);
          const batchResponse = await fetch(
            `${JUDGE0_URL}/submissions/batch?base64_encoded=false`,
            {
              method: "POST",
              headers: JUDGE0_HEADERS,
              body: JSON.stringify({ submissions: chunk }),
            },
          );

          const rawText = await batchResponse.text();
          if (!batchResponse.ok) {
            throw new Error(
              `Judge0 batch failed (${batchResponse.status}): ${rawText}`,
            );
          }

          const chunkTokens: { token: string }[] = JSON.parse(rawText);
          allTokens.push(...chunkTokens);
        }

        const allResults: any[] = [];

        for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
          const tokenChunk = allTokens.slice(i, i + BATCH_SIZE);
          const tokenString = tokenChunk.map((t) => t.token).join(",");

          while (true) {
            const pollResponse = await fetch(
              `${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=false&fields=token,status,stdout,stderr,expected_output,time,memory`,
              { headers: JUDGE0_HEADERS },
            );

            const data = await pollResponse.json();
            const chunkResults = data.submissions;

            const allDone = chunkResults.every((r: any) => r.status.id > 2);
            if (allDone) {
              allResults.push(...chunkResults);
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        return allResults;
      } catch (err) {
        console.error("SUBMIT ERROR:", err);
        throw err;
      }
    }),
});
