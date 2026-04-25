import "dotenv/config";
import prisma from "@/lib/db";

// convert Python type hint to our generic notation
function normalizePythonType(pyType: string): string {
  pyType = pyType.trim();

  // Optional[X] → X?
  const optMatch = pyType.match(/^Optional\[(.+)\]$/);
  if (optMatch) return normalizePythonType(optMatch[1]) + "?";

  // List[X] → X[]
  const listMatch = pyType.match(/^List\[(.+)\]$/);
  if (listMatch) return normalizePythonType(listMatch[1]) + "[]";

  // primitive mappings
  const map: Record<string, string> = {
    int: "int",
    float: "double",
    bool: "bool",
    str: "string",
    None: "void",
  };

  return map[pyType] ?? pyType; // ListNode, TreeNode pass through as-is
}

// extract input and output signatures from a Python3 template
function extractSignatures(template: string): { input: string; output: string } | null {
  // match: def funcName(self, arg1: Type1, arg2: Type2) -> ReturnType:
  const match = template.match(/def\s+\w+\s*\(self(?:,\s*([^)]*))?\)\s*(?:->\s*([^:]+))?\s*:/);
  if (!match) return null;

  const paramsStr = match[1]?.trim() ?? "";
  const returnTypeStr = match[2]?.trim() ?? "void";

  // parse parameters — split on comma but respect brackets
  const params: string[] = [];
  if (paramsStr) {
    let depth = 0;
    let current = "";
    for (const char of paramsStr) {
      if (char === "[") depth++;
      else if (char === "]") depth--;
      if (char === "," && depth === 0) {
        params.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) params.push(current.trim());
  }

  // extract types from each param — format is "name: Type" or "name"
  const inputTypes = params.map((p) => {
    const colonIdx = p.indexOf(":");
    if (colonIdx === -1) return "unknown";
    return normalizePythonType(p.substring(colonIdx + 1).trim());
  });

  return {
    input: inputTypes.join(","),
    output: normalizePythonType(returnTypeStr),
  };
}

async function main() {
  console.log("Fetching Python3 snippets...");
  const snippets = await prisma.codeSnippet.findMany({
    where: { language: "PYTHON3" },
    select: {
      problemId: true,
      template: true,
    },
  });

  console.log(`Found ${snippets.length} Python3 snippets`);

  let updated = 0;
  let failed = 0;

  for (const snippet of snippets) {
    const sigs = extractSignatures(snippet.template);
    if (!sigs) {
      failed++;
      continue;
    }

    await prisma.problem.update({
      where: { id: snippet.problemId },
      data: {
        inputSignature: sigs.input,
        outputSignature: sigs.output,
      },
    });

    updated++;
    if (updated % 100 === 0) console.log(`  Progress: ${updated}/${snippets.length}`);
  }

  console.log(`\nDone! Updated ${updated}, failed ${failed}`);
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