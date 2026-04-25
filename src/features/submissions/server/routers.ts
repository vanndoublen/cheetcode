import { Language } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { getCDriver } from "./c-driver";

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
        const { problemSlug, sourceCode } = input;

        const problem = await prisma.problem.findUnique({
          where: { slug: problemSlug },
          include: {
            snippets: {
              select: {
                entryPoint: true,
              },
              where: {
                language: input.language as Language,
              },
              take: 1,
            },
          },
        });

        if (!problem || !problem.snippets[0].entryPoint) {
          return;
        }

        const languageConfig = await prisma.languageConfig.findUnique({
          where: { language: input.language as Language },
        });

        if (!languageConfig) {
          return;
        }

        const { prompt, driver } = languageConfig;
        
        let finalDriver = driver
          .replace(/{{ENTRY_POINT}}/g, problem.snippets[0].entryPoint)
          .replace(/{{INPUT_SIG}}/g, problem.inputSignature ?? "")
          .replace(/{{OUTPUT_SIG}}/g, problem.outputSignature ?? "");

        // Override for C — use signature-specific driver
        if (input.language === Language.C) {
          const cDriver = getCDriver(
            problem.inputSignature ?? "",
            problem.outputSignature ?? "",
          );
          if (!cDriver) {
            throw new Error(
              `C is not supported for this problem signature: (${problem.inputSignature}) -> ${problem.outputSignature}`,
            );
          }
          finalDriver = cDriver.replace(
            /{{ENTRY_POINT}}/g,
            problem.snippets[0].entryPoint,
          );
        }

        const fullScript = `${prompt}\n\n${sourceCode}\n\n${finalDriver}`;

        // const fullScript = `${prompt}\n\n${sourceCode}\n\nimport sys\n_data = sys.stdin.read().splitlines()\n_args = [eval(line) for line in _data if line.strip()]\nprint(${problem.entryPoint}(*_args))`;

        const testCases = await prisma.testCase.findMany({
          where: {
            problemId: problem.id,
            stdin: { not: null },
          },
          take: 10,
        });

        const submissions = testCases.map((t) => ({
          source_code: Buffer.from(fullScript).toString("base64"),
          language_id: languageConfig.judge0Id,
          stdin: t.stdin ? Buffer.from(t.stdin).toString("base64") : "",
          expected_output: Buffer.from(t.expected).toString("base64"),
        }));

        const BATCH_SIZE = 10;
        const allTokens: { token: string }[] = [];

        for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
          const chunk = submissions.slice(i, i + BATCH_SIZE);
          const batchResponse = await fetch(
            `${JUDGE0_URL}/submissions/batch?base64_encoded=true`,
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
              `${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=token,status,stdout,stderr,compile_output,expected_output,time,memory`,

              { headers: JUDGE0_HEADERS },
            );

            const data = await pollResponse.json();
            console.log("Poll data:", JSON.stringify(data, null, 2));
            const chunkResults = data.submissions;

            const decoded = chunkResults.map((r: any) => ({
              ...r,
              stdout: r.stdout
                ? Buffer.from(r.stdout, "base64").toString("utf-8")
                : null,
              stderr: r.stderr
                ? Buffer.from(r.stderr, "base64").toString("utf-8")
                : null,
              compile_output: r.compile_output
                ? Buffer.from(r.compile_output, "base64").toString("utf-8")
                : null,
              expected_output: r.expected_output
                ? Buffer.from(r.expected_output, "base64").toString("utf-8")
                : null,
            }));

            const allDone = decoded.every((r: any) => r.status.id > 2);
            if (allDone) {
              allResults.push(...decoded);
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
