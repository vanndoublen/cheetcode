import "dotenv/config";
import prisma from "@/lib/db";

/**
 * Flags test cases whose inputs violate the problem's integer contract:
 * an `int`-signature problem must not have values outside int32 range
 * (fixed-int languages like C++/Java/Rust can't represent them).
 *
 * Non-destructive: sets isValid=false; judging queries filter to isValid=true.
 * Re-runnable (resets the int32 flag first).
 */

const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;
const REASON = "int32-overflow";

function isIntSignature(sig: string | null): boolean {
  const s = sig ?? "";
  return /\bint\b|\bint\[\]/.test(s) && !/long|double|float/.test(s);
}

function hasOverflow(stdin: string): boolean {
  for (const m of stdin.matchAll(/-?\d+/g)) {
    const n = Number(m[0]);
    if (n > INT32_MAX || n < INT32_MIN) return true;
  }
  return false;
}

async function main() {
  // Reset any previous int32 flags so this is idempotent.
  const reset = await prisma.testCase.updateMany({
    where: { invalidReason: REASON },
    data: { isValid: true, invalidReason: null },
  });

  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, inputSignature: true },
  });
  const intProblems = problems.filter((p) => isIntSignature(p.inputSignature));

  let flagged = 0;
  let affectedProblems = 0;
  for (const p of intProblems) {
    const tcs = await prisma.testCase.findMany({
      where: { problemId: p.id, stdin: { not: null } },
      select: { id: true, stdin: true },
    });
    const badIds = tcs.filter((t) => hasOverflow(t.stdin!)).map((t) => t.id);
    if (badIds.length === 0) continue;
    await prisma.testCase.updateMany({
      where: { id: { in: badIds } },
      data: { isValid: false, invalidReason: REASON },
    });
    flagged += badIds.length;
    affectedProblems++;
  }

  console.log(`Reset ${reset.count} previously-flagged cases.`);
  console.log(
    `Flagged ${flagged} int32-overflow test cases across ${affectedProblems} problems (of ${intProblems.length} int-signature problems).`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
