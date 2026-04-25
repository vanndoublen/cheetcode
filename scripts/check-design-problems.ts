// scripts/check-design-problems.ts
import "dotenv/config";

const DESIGN_SLUGS = new Set([
  "lru-cache",
  "design-twitter",
  "min-stack",
  "implement-trie-prefix-tree",
  // add more if you want
]);

const HF_API = "https://datasets-server.huggingface.co/rows";
const DATASET = "newfacade/LeetCodeDataset";
const SPLIT = "train";
const BATCH_SIZE = 100;

async function main() {
  let offset = 0;
  const found = new Map<string, any>();

  while (true) {
    const url = `${HF_API}?dataset=${DATASET}&config=default&split=${SPLIT}&offset=${offset}&length=${BATCH_SIZE}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const json = await res.json();
    const rows = json.rows as { row: any }[];
    if (rows.length === 0) break;

    for (const { row } of rows) {
      if (DESIGN_SLUGS.has(row.task_id)) {
        found.set(row.task_id, row);
      }
    }

    console.log(`Scanned ${offset + rows.length}, found ${found.size}/${DESIGN_SLUGS.size}`);
    if (found.size === DESIGN_SLUGS.size) break;
    if (rows.length < BATCH_SIZE) break;
    offset += BATCH_SIZE;
  }

  console.log("\n=== RESULTS ===");
  for (const slug of DESIGN_SLUGS) {
    const row = found.get(slug);
    if (!row) {
      console.log(`❌ ${slug} — NOT FOUND`);
      continue;
    }
    console.log(`✅ ${slug}`);
    console.log(`   entry_point: ${row.entry_point}`);
    console.log(`   first input:  ${row.input_output?.[0]?.input?.substring(0, 200)}`);
    console.log(`   first output: ${row.input_output?.[0]?.output?.substring(0, 80)}`);
  }
}

main().catch(console.error);