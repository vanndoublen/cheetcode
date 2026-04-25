import "dotenv/config";
import prisma from "@/lib/db";

async function main() {
  console.log("Marking problems as unsubmittable...");

  // mark problems with bad/missing signatures or no test cases as unsubmittable
  const result = await prisma.problem.updateMany({
    where: {
      OR: [
        { inputSignature: null },
        { inputSignature: "" },
        { inputSignature: { contains: "unknown" } },
        { outputSignature: null },
        { entryPoint: null },
        { testCases: { none: {} } },
      ],
    },
    data: { canSubmit: false },
  });

  console.log(`Marked ${result.count} problems as unsubmittable`);

  // reset the rest to submittable (in case anything was wrongly flagged before)
  const result2 = await prisma.problem.updateMany({
    where: {
      AND: [
        { inputSignature: { not: null } },
        { inputSignature: { not: "" } },
        { inputSignature: { not: { contains: "unknown" } } },
        { outputSignature: { not: null } },
        { entryPoint: { not: null } },
        { testCases: { some: {} } },
      ],
    },
    data: { canSubmit: true },
  });

  console.log(`Marked ${result2.count} problems as submittable`);
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