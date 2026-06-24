import "dotenv/config";
import prisma from "@/lib/db";

const main = async () => {
  // Preview first
  const bad = await prisma.testCase.findMany({
    where: {
      OR: [
        { expected: { contains: "Error:" } },
        { input: { contains: "* " } },   // Python expression like "a" * 50000
      ],
    },
    select: { id: true, input: true, expected: true, problemId: true },
    take: 20,
  });

  console.log(`Found ${bad.length} suspicious test cases (preview):`);
  bad.forEach(t => console.log(` - ${t.id} | input: ${t.input.slice(0, 60)} | expected: ${t.expected.slice(0, 60)}`));

  const { count } = await prisma.testCase.updateMany({
    where: {
      OR: [
        { expected: { contains: "Error:" } },
        { input: { contains: "* " } },
      ],
    },
    data: {
      isValid: false,
      invalidReason: "Bad seed data — Python expression or error message stored as value",
    },
  });

  console.log(`Marked ${count} test cases as invalid`);
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });