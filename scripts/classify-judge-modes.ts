import "dotenv/config";
import prisma from "@/lib/db";

/**
 * Assigns Problem.judgeMode / checkerKey and recomputes canSubmit.
 *
 * Strategy (see memory: judging-architecture):
 *   - NORMALIZED is the default for every submittable problem.
 *   - A small, hand-verified set of ambiguous problems use CHECKER mode.
 *   - Problems that aren't submittable (design problems etc.) -> UNSUPPORTED.
 *
 * Be conservative with checkers: a wrong checker causes FALSE POSITIVES
 * (accepting wrong answers). Only add slugs you've verified. Auto-detecting
 * ambiguity generically is future work.
 */

// slug -> checkerKey (must exist in checkers.ts REGISTRY)
const CHECKER_MAP: Record<string, string> = {
  "two-sum": "two-sum-indices",
  "3sum": "set-of-tuples",
  "4sum": "set-of-tuples",
};

async function main() {
  // 1. Non-submittable problems -> UNSUPPORTED.
  const unsupported = await prisma.problem.updateMany({
    where: { canSubmit: false },
    data: { judgeMode: "UNSUPPORTED", checkerKey: null },
  });

  // 2. Submittable -> NORMALIZED baseline.
  const normalized = await prisma.problem.updateMany({
    where: { canSubmit: true },
    data: { judgeMode: "NORMALIZED", checkerKey: null },
  });

  // 3. Apply curated checkers (only for submittable problems).
  let checkerCount = 0;
  for (const [slug, checkerKey] of Object.entries(CHECKER_MAP)) {
    const res = await prisma.problem.updateMany({
      where: { slug, canSubmit: true },
      data: { judgeMode: "CHECKER", checkerKey },
    });
    if (res.count > 0) {
      checkerCount += res.count;
      console.log(`  ✓ ${slug} -> CHECKER(${checkerKey})`);
    } else {
      console.warn(`  ! ${slug} not found / not submittable — skipped`);
    }
  }

  console.log("\n=== judgeMode distribution ===");
  const dist = await prisma.problem.groupBy({
    by: ["judgeMode"],
    _count: true,
  });
  dist.forEach((d) => console.log(`  ${d.judgeMode}: ${d._count}`));
  console.log(
    `\nUNSUPPORTED set on ${unsupported.count}, NORMALIZED baseline on ${normalized.count}, CHECKER on ${checkerCount}.`,
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
