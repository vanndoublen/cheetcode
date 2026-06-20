/**
 * In-app judging. Judge0 only executes code and returns stdout; correctness is
 * decided here so we control the comparison instead of relying on Judge0's
 * exact-match against a single reference answer.
 *
 * See memory: judging-architecture.
 */

export type JudgeMode = "EXACT" | "NORMALIZED" | "CHECKER";

const FLOAT_EPS = 1e-6;

/** Parse a driver-printed (Python-style) value into a JS value, or undefined. */
function parsePyish(raw: string): unknown {
  const t = raw.trim();
  if (t === "") return undefined;
  try {
    const jsonish = t
      .replace(/'/g, '"')
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
    return JSON.parse(jsonish);
  } catch {
    return undefined;
  }
}

/** null / undefined / "" / [] all represent "no answer". */
function isEmpty(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    v === "" ||
    (Array.isArray(v) && v.length === 0)
  );
}

function numClose(a: number, b: number): boolean {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const diff = Math.abs(a - b);
  return diff <= FLOAT_EPS || diff <= FLOAT_EPS * Math.max(Math.abs(a), Math.abs(b));
}

/** Deep structural equality with float tolerance. Order IS significant. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return numClose(a, b);
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  if (
    a !== null &&
    b !== null &&
    typeof a === "object" &&
    typeof b === "object"
  ) {
    const ka = Object.keys(a as object).sort();
    const kb = Object.keys(b as object).sort();
    if (ka.length !== kb.length || !ka.every((k, i) => k === kb[i])) return false;
    return ka.every((k) =>
      deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }
  return a === b;
}

/** Strip one layer of matching surrounding quotes. */
function stripQuotes(s: string): string {
  const t = s.trim();
  if (t.length >= 2) {
    const f = t[0];
    if ((f === '"' || f === "'") && t[t.length - 1] === f) {
      return t.slice(1, -1);
    }
  }
  return t;
}

function judgeNormalized(expected: string, actual: string): boolean {
  const ea = expected.trim();
  const aa = actual.trim();

  // Fast path: literal match (also handles big-int strings JSON can't hold).
  if (ea === aa) return true;

  const ev = parsePyish(ea);
  const av = parsePyish(aa);

  // No-answer equivalence (None / [] / "" interchangeable).
  if (isEmpty(ev) && isEmpty(av)) return true;

  if (ev !== undefined && av !== undefined) return deepEqual(ev, av);

  // One/both unparseable → compare as raw strings, tolerating wrapping quotes.
  return stripQuotes(ea) === stripQuotes(aa);
}

import { getChecker } from "./checkers";

export function judge(args: {
  mode: JudgeMode;
  expected: string;
  actual: string;
  /** raw stdin for this test case (checkers need the input) */
  stdin?: string;
  checkerKey?: string | null;
}): boolean {
  const { mode, expected, actual, stdin, checkerKey } = args;

  if (mode === "EXACT") return expected.trim() === actual.trim();

  if (mode === "CHECKER" && checkerKey) {
    const checker = getChecker(checkerKey);
    if (checker) return checker({ stdin: stdin ?? "", actual, expected });
    // Unknown checker key → fall back to normalized rather than silently passing.
  }

  return judgeNormalized(expected, actual);
}
