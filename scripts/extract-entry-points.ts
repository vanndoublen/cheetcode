import "dotenv/config";
import prisma from "@/lib/db";
import { Language } from "@/generated/prisma/enums";

const PATTERNS: Partial<Record<Language, RegExp>> = {
  [Language.PYTHON]: /def\s+(\w+)\s*\(/,
  [Language.PYTHON3]: /def\s+(\w+)\s*\(/,
  [Language.JAVASCRIPT]: /(?:var\s+(\w+)\s*=\s*function|function\s+(\w+))\s*\(/,
  [Language.TYPESCRIPT]: /function\s+(\w+)\s*\(/,
  [Language.JAVA]: /public\s+[\w\[\]<>,\s]+?\s+(\w+)\s*\(/,
  [Language.CPP]: /[\w<>,\s*&]+\s+(\w+)\s*\([^)]*\)\s*\{/,
  [Language.C]: /^\s*(?:struct\s+\w+\s*\*?|[\w\*\s]+?)\s+\*?\s*(\w+)\s*\(/m,
  [Language.CSHARP]: /public\s+[\w\[\]<>,\s]+?\s+(\w+)\s*\(/,
  [Language.GO]: /func\s+(\w+)\s*\(/,
  [Language.RUST]: /pub\s+fn\s+(\w+)\s*\(/,
};

// skip first match for Python templates — Solution class's __init__ or similar
function extractName(template: string, language: Language): string | null {
  const pattern = PATTERNS[language];
  if (!pattern) return null;

  if (language === Language.PYTHON || language === Language.PYTHON3) {
    // find all `def X(` — skip __init__, take first real method
    const matches = [...template.matchAll(/def\s+(\w+)\s*\(/g)];
    const candidate = matches.find(m => m[1] !== "__init__");
    return candidate ? candidate[1] : null;
  }

  if (language === Language.JAVA || language === Language.CSHARP) {
    // skip "public class Solution" — grab methods only
    const matches = [...template.matchAll(/public\s+[\w\[\]<>,\s]+?\s+(\w+)\s*\(/g)];
    // filter out keywords like "class"
    const methods = matches.filter(m => !["class", "Solution"].includes(m[1]));
    return methods[0]?.[1] ?? null;
  }

  const match = template.match(pattern);
  if (!match) return null;
  // JS pattern has two capture groups, pick whichever matched
  return match[1] ?? match[2] ?? null;
}

async function main() {
  console.log("Fetching all code snippets...");
  const snippets = await prisma.codeSnippet.findMany({
    select: { id: true, language: true, template: true },
  });

  console.log(`Processing ${snippets.length} snippets...`);

  let updated = 0;
  let failed = 0;
  const failures: Record<string, number> = {};

  for (const s of snippets) {
    const name = extractName(s.template, s.language);
    if (!name) {
      failed++;
      failures[s.language] = (failures[s.language] ?? 0) + 1;
      continue;
    }

    await prisma.codeSnippet.update({
      where: { id: s.id },
      data: { entryPoint: name },
    });
    updated++;
    if (updated % 500 === 0) console.log(`  Progress: ${updated}/${snippets.length}`);
  }

  console.log(`\nDone! Updated ${updated}, failed ${failed}`);
  if (Object.keys(failures).length) {
    console.log("Failures by language:", failures);
  }
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