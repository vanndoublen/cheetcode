/**
 * Special-judge checkers for problems where more than one output is correct,
 * so exact/normalized matching against a single reference answer is wrong.
 *
 * A checker validates the user's output semantically against the test input.
 * Keyed by `Problem.checkerKey`. See memory: judging-architecture.
 */

export type CheckerArgs = {
  /** raw stdin sent to the program (newline-separated args) */
  stdin: string;
  /** user program stdout */
  actual: string;
  /** reference expected output from the dataset */
  expected: string;
};

export type Checker = (args: CheckerArgs) => boolean;

function parse(raw: string): unknown {
  const t = raw.trim();
  if (t === "") return undefined;
  try {
    return JSON.parse(
      t
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false"),
    );
  } catch {
    return undefined;
  }
}

function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || (Array.isArray(v) && v.length === 0);
}

/** Canonical JSON of a value with inner arrays sorted (for set/multiset compare). */
function canonical(v: unknown, sortInner: boolean): string {
  if (Array.isArray(v)) {
    const items = v.map((x) => canonical(x, sortInner));
    if (sortInner) items.sort();
    return "[" + items.join(",") + "]";
  }
  return JSON.stringify(v);
}

/** two-sum & friends: any pair of distinct indices whose values sum to target. */
const twoSumIndices: Checker = ({ stdin, actual, expected }) => {
  const lines = stdin.split("\n").filter((l) => l.trim() !== "");
  const nums = parse(lines[0]) as number[] | undefined;
  const target = Number((lines[1] ?? "").trim());
  const out = parse(actual);
  const exp = parse(expected);

  // No-answer case: reference says none → user must also produce none.
  if (isEmpty(exp)) return isEmpty(out);
  if (isEmpty(out)) return false;

  if (!Array.isArray(nums) || !Array.isArray(out) || out.length !== 2) return false;
  const [i, j] = out as number[];
  if (!Number.isInteger(i) || !Number.isInteger(j) || i === j) return false;
  if (i < 0 || j < 0 || i >= nums.length || j >= nums.length) return false;
  return nums[i] + nums[j] === target;
};

/** 3sum-style: set of triplets/tuples, order-insensitive at every level. */
const setOfTuples: Checker = ({ actual, expected }) => {
  const out = parse(actual);
  const exp = parse(expected);
  if (isEmpty(exp)) return isEmpty(out);
  if (!Array.isArray(out) || !Array.isArray(exp)) return false;
  return canonical(out, true) === canonical(exp, true);
};

/** Output is a collection where order doesn't matter (multiset equality). */
const orderInsensitiveArray: Checker = ({ actual, expected }) => {
  const out = parse(actual);
  const exp = parse(expected);
  if (isEmpty(exp)) return isEmpty(out);
  if (!Array.isArray(out) || !Array.isArray(exp)) return false;
  return canonical(out, true) === canonical(exp, true);
};

const REGISTRY: Record<string, Checker> = {
  "two-sum-indices": twoSumIndices,
  "set-of-tuples": setOfTuples,
  "order-insensitive-array": orderInsensitiveArray,
};

export function getChecker(key: string): Checker | undefined {
  return REGISTRY[key];
}
