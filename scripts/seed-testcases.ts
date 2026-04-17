import "dotenv/config";
import prisma from "@/lib/db";

const HF_API = "https://datasets-server.huggingface.co/rows";
const DATASET = "newfacade/LeetCodeDataset";
const SPLIT = "train";
const BATCH_SIZE = 100;

async function fetchRows(offset: number, length: number) {
  const url = `${HF_API}?dataset=${DATASET}&config=default&split=${SPLIT}&offset=${offset}&length=${length}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HF API error: ${res.status}`);
  const json = await res.json();
  return json.rows as { row: Record<string, any> }[];
}

async function main() {
  console.log("Fetching problems from DB...");
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true },
  });

  const slugToId = new Map(problems.map((p) => [p.slug, p.id]));
  console.log(`Found ${problems.length} problems in DB`);

  let offset = 0;
  let totalInserted = 0;
  let totalSkipped = 0;

  while (true) {
    console.log(`Fetching rows ${offset} - ${offset + BATCH_SIZE}...`);
    const rows = await fetchRows(offset, BATCH_SIZE);
    if (rows.length === 0) break;

    for (const { row } of rows) {
      const slug = row.task_id as string;
      const problemId = slugToId.get(slug);

      if (!problemId) {
        totalSkipped++;
        continue;
      }

      let inputOutput: { input: string; output: string }[] = [];
      try {
        inputOutput =
          typeof row.input_output === "string"
            ? JSON.parse(row.input_output)
            : row.input_output;
      } catch {
        console.warn(`Failed to parse input_output for ${slug}`);
        continue;
      }

      if (!inputOutput?.length) {
        totalSkipped++;
        continue;
      }

      // delete existing test cases for this problem first
      await prisma.testCase.deleteMany({
        where: { problemId },
      });

      await prisma.testCase.createMany({
        data: inputOutput
          .filter((tc) => tc.input != null && tc.output != null)
          .map((tc, index) => ({
            problemId,
            input: tc.input,
            expected: tc.output,
            isHidden: index > 2,
            order: index,
          })),
      });

      console.log(`✓ ${slug} — inserted ${inputOutput.length} test cases`);
      totalInserted += inputOutput.length;
    }

    if (rows.length < BATCH_SIZE) break;
    offset += BATCH_SIZE;
  }

  console.log(
    `\nDone! Inserted ${totalInserted} test cases, skipped ${totalSkipped} problems`,
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
