import { Language, SubmissionStatus } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { getCDriver } from "./c-driver";
import { buildCppDriver } from "./cpp-driver";
import { getSupportedLanguages } from "./supported-languages";
import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { judge, type JudgeMode } from "./judge";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": process.env.JUDGE0_RAPIDAPI_KEY!,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
};

type Judge0Result = {
  token: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
};

// We no longer send expected_output — Judge0 only executes; judge() decides
// correctness. So status 3 means "ran", not "correct".
type Judge0Input = {
  source_code: string;
  language_id: number | undefined;
  stdin: string;
};

/**
 * Java/C# assemble the script as `prompt + userCode + driver`. The prompt
 * already declares all imports and a `public class`, so user code with its own
 * `import` lines or `public class Solution` won't compile. Strip them.
 */
const sanitizeUserCode = (language: string, code: string): string => {
  if (language === Language.JAVA || language === Language.CSHARP) {
    return code
      .replace(/^\s*import\s+[^;]+;\s*$/gm, "")
      .replace(/^(\s*)public\s+(class|enum|interface)\b/m, "$1$2");
  }
  return code;
};

const isCompileError = (id: number) => id === 6;
const isTimeLimit = (id: number) => id === 5;
const isRuntimeError = (id: number) => id >= 7; // 7..12 runtime, 13/14 internal

/** Roll up per-test outcomes into one submission status. */
const aggregateStatus = (
  results: Judge0Result[],
  passed: boolean[],
): SubmissionStatus => {
  if (passed.every(Boolean)) return "ACCEPTED";
  if (results.some((r) => isCompileError(r.status.id))) return "COMPILE_ERROR";
  if (results.some((r) => isTimeLimit(r.status.id)))
    return "TIME_LIMIT_EXCEEDED";
  if (results.some((r) => isRuntimeError(r.status.id))) return "RUNTIME_ERROR";
  return "WRONG_ANSWER";
};

const createScript = async (
  problemSlug: string,
  language: string,
  sourceCode: string,
) => {
  const problem = await prisma.problem.findUnique({
    where: { slug: problemSlug },
    include: {
      snippets: {
        select: {
          entryPoint: true,
        },
        where: {
          language: language as Language,
        },
        take: 1,
      },
    },
  });

  if (!problem || !problem.snippets[0]?.entryPoint) {
    throw new Error(`Problem not found or missing entry point: ${problemSlug}`);
  }

  const languageConfig = await prisma.languageConfig.findUnique({
    where: { language: language as Language },
  });

  if (!languageConfig) {
    throw new Error(`No language config for: ${language}`);
  }

  const { prompt, driver } = languageConfig;

  let finalDriver = driver
    .replace(/{{ENTRY_POINT}}/g, problem.snippets[0].entryPoint)
    .replace(/{{INPUT_SIG}}/g, problem.inputSignature ?? "")
    .replace(/{{OUTPUT_SIG}}/g, problem.outputSignature ?? "");

  // Override for C — use signature-specific driver
  if (language === Language.C) {
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

  // Override for C++ — generic codegen driver from the signature.
  if (language === Language.CPP) {
    const cppDriver = buildCppDriver(
      problem.inputSignature ?? "",
      problem.outputSignature ?? "",
      problem.snippets[0].entryPoint,
    );
    if (!cppDriver) {
      throw new Error(
        `C++ is not supported for this problem signature: (${problem.inputSignature}) -> ${problem.outputSignature}`,
      );
    }
    finalDriver = cppDriver;
  }

  const cleanCode = sanitizeUserCode(language, sourceCode);
  const fullScript = `${prompt}\n\n${cleanCode}\n\n${finalDriver}`;

  return {
    problemId: problem.id,
    languageConfig,
    fullScript,
    judgeMode: problem.judgeMode as JudgeMode,
    checkerKey: problem.checkerKey,
  };
};

const runJudge0 = async (batchSize: number, submissions: Judge0Input[]) => {
  const BATCH_SIZE = batchSize;
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

  const allResults: Judge0Result[] = [];

  for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
    const tokenChunk = allTokens.slice(i, i + BATCH_SIZE);
    const tokenString = tokenChunk.map((t) => t.token).join(",");

    while (true) {
      const pollResponse = await fetch(
        `${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=token,status,stdout,stderr,compile_output,time,memory`,

        { headers: JUDGE0_HEADERS },
      );

      const data = await pollResponse.json();
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
      }));

      const allDone = decoded.every((r: any) => r.status.id > 2);
      if (allDone) {
        allResults.push(...decoded);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Averages over executed runs (status 3 = ran successfully).
  const ranTimes = allResults
    .filter((r) => r.status.id === 3 && r.time)
    .map((r) => parseFloat(r.time!) * 1000);
  const avgRuntimeMs = ranTimes.length
    ? Math.round(ranTimes.reduce((a, b) => a + b, 0) / ranTimes.length)
    : null;

  const memoryKbs = allResults.filter((r) => r.memory).map((r) => r.memory!);
  const avgMemoryKb = memoryKbs.length
    ? Math.round(memoryKbs.reduce((a, b) => a + b, 0) / memoryKbs.length)
    : null;

  return { avgMemoryKb, avgRuntimeMs, allResults };
};

export type RunResult = {
  status: SubmissionStatus;
  runtimeMs: number | null;
  memoryKb: number | null;
  createdAt: Date | null;
  results: {
    testCaseId: string;
    passed: boolean;
    output: string | null;
    error: string | null;
    runtimeMs: number | null;
  }[];
};

export const submissionsRouter = createTRPCRouter({
  run: protectedProcedure
    .input(
      z.object({
        problemSlug: z.string(),
        sourceCode: z.string(),
        language: z.enum(Object.values(Language) as [string, ...string[]]),
        isHidden: z.boolean().default(false),
        isSave: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<RunResult> => {
      try {
        const { problemSlug, sourceCode } = input;

        const user = await prisma.user.findUnique({
          where: { clerkId: ctx.auth.userId },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "No user found",
          });
        }

        const { problemId, languageConfig, fullScript, judgeMode, checkerKey } =
          await createScript(problemSlug, input.language, input.sourceCode);

        const testCases = await prisma.testCase.findMany({
          where: {
            problemId: problemId,
            isHidden: input.isHidden,
            stdin: { not: null },
            isValid: true,
          },
          orderBy: { order: "asc" },
          take: 30,
        });

        const submissions = testCases.map((t) => ({
          source_code: Buffer.from(fullScript || "").toString("base64"),
          language_id: languageConfig.judge0Id,
          stdin: t.stdin ? Buffer.from(t.stdin).toString("base64") : "",
        }));

        const { avgMemoryKb, avgRuntimeMs, allResults } = await runJudge0(
          10,
          submissions,
        );

        // Decide correctness in-app for each executed test case.
        const passedFlags = allResults.map(
          (r, i) =>
            r.status.id === 3 &&
            judge({
              mode: judgeMode,
              expected: testCases[i].expected,
              actual: r.stdout ?? "",
              stdin: testCases[i].stdin ?? "",
              checkerKey,
            }),
        );
        const status = aggregateStatus(allResults, passedFlags);

        if (input.isSave) {
          await prisma.submission.create({
            data: {
              userId: user.id,
              problemId: problemId,
              language: input.language as Language,
              sourceCode,
              status: status,
              runtimeMs: avgRuntimeMs,
              memoryKb: avgMemoryKb,
              finishedAt: new Date(),
              results: {
                create: allResults.map((r, i) => ({
                  testCaseId: testCases[i].id,
                  passed: passedFlags[i],
                  runtimeMs: r.time
                    ? Math.round(parseFloat(r.time) * 1000)
                    : null,
                  memoryKb: r.memory ?? null,
                  output: r.stdout ?? null,
                  error: r.stderr ?? r.compile_output ?? null,
                })),
              },
            },
          });
        }

        return {
          status,
          runtimeMs: avgRuntimeMs,
          memoryKb: avgMemoryKb,
          createdAt: input.isSave ? new Date() : null,
          results: allResults.map((r, i) => ({
            testCaseId: testCases[i].id,
            passed: passedFlags[i],
            output: r.stdout ?? null,
            error: r.stderr ?? r.compile_output ?? null,
            runtimeMs: r.time ? Math.round(parseFloat(r.time) * 1000) : null,
          })),
        };
      } catch (err) {
        console.error("SUBMIT ERROR:", err);
        throw err;
      }
    }),

  runOneTest: protectedProcedure
    .input(
      z.object({
        problemSlug: z.string(),
        sourceCode: z.string(),
        language: z.enum(Object.values(Language) as [string, ...string[]]),
        stdin: z.string(),
        expected: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { languageConfig, fullScript, judgeMode, checkerKey } =
        await createScript(input.problemSlug, input.language, input.sourceCode);

      const submissions = [
        {
          source_code: Buffer.from(fullScript || "").toString("base64"),
          language_id: languageConfig.judge0Id,
          stdin: input.stdin ? Buffer.from(input.stdin).toString("base64") : "",
        },
      ];

      const { allResults } = await runJudge0(10, submissions);
      const result = allResults[0];

      const passed =
        result.status.id === 3 &&
        judge({
          mode: judgeMode,
          expected: input.expected,
          actual: result.stdout ?? "",
          stdin: input.stdin,
          checkerKey,
        });

      return {
        passed,
        output: result.stdout ?? null,
        error: result.stderr ?? result.compile_output ?? null,
        runtimeMs: result.time
          ? Math.round(parseFloat(result.time) * 1000)
          : null,
        memoryKb: result.memory ?? null,
      };
    }),

  getSupportedLanguages: protectedProcedure
    .input(z.object({ problemSlug: z.string() }))
    .query(async ({ input }) => {
      const problem = await prisma.problem.findUnique({
        where: { slug: input.problemSlug },
        select: { inputSignature: true, outputSignature: true },
      });
      if (!problem) return [];
      return getSupportedLanguages(
        problem.inputSignature,
        problem.outputSignature,
      );
    }),

  getPublicCases: protectedProcedure
    .input(
      z.object({
        problemSlug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const testCases = await prisma.testCase.findMany({
        where: {
          problem: { slug: input.problemSlug },
          isHidden: false,
          stdin: { not: null },
          isValid: true,
        },
        orderBy: { order: "asc" },
        take: 5,
      });
      return testCases;
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        problemSlug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { clerkId: ctx.auth.userId },
      });

      if (!user)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "No user found" });

      const submissions = await prisma.submission.findMany({
        where: {
          problem: { slug: input.problemSlug },
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
        include: {
          results: true,
        },
      });

      return submissions; 
    }),
});
