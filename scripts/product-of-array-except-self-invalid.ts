import "dotenv/config";
import prisma from "@/lib/db";

const main = async () => {
  const problem = await prisma.problem.findUnique({
    where: { slug: "product-of-array-except-self" },
    select: { id: true },
  });

  if (!problem) throw new Error("Problem not found");

  const testCases = await prisma.testCase.findMany({
    where: { problemId: problem.id, isValid: true },
    select: { id: true, input: true, expected: true },
  });

  const overflowIds: string[] = [];

  for (const tc of testCases) {
    const numbers = tc.expected.match(/-?\d+/g)?.map(Number) ?? [];
    const MAX_INT32 = 2147483647;
    const hasOverflow = numbers.some((n) => Math.abs(n) > MAX_INT32);
    if (hasOverflow) overflowIds.push(tc.id);
  }

  console.log(`Found ${overflowIds.length} potentially overflowing test cases`);

  await prisma.testCase.updateMany({
    where: { id: { in: overflowIds } },
    data: {
      isValid: false,
      invalidReason:
        "Input values too large — product overflows 32-bit int, violates problem constraints",
    },
  });

  console.log("Done");
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


// npx tsx -e "
// import 'dotenv/config';
// import prisma from './src/lib/db';
// (async () => {
//   await prisma.testCase.update({
//     where: { id: 'b83860e2-d5a9-4b65-95de-9ffb73877fd0' },
//     data: {
//       isValid: false,
//       invalidReason: 'Input contains floats — violates problem constraint of integer array',
//     }
//   });
//   console.log('done');
//   await prisma.\$disconnect();
// })();
// "