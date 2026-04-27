# CheetCode

A full-stack LeetCode clone with a Monaco editor, multi-language code execution via Judge0, and ~2.6k seeded problems with ~229k test cases.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **API:** tRPC + TanStack Query
- **Auth:** Clerk
- **UI:** shadcn/ui + Tailwind CSS
- **Editor:** Monaco (VSCode-like) with `@monaco-editor/react`
- **Layout:** Allotment for split panes
- **Code Execution:** Judge0 (via RapidAPI)

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
├── features/
│   ├── problems/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── server/               # tRPC procedures, prefetch
│   ├── submissions/
│   │   └── server/
│   │       ├── routers.ts        # submit mutation
│   │       └── c-drivers.ts      # per-signature C drivers
│   └── auth/
├── generated/prisma/             # Prisma client output
├── lib/db.ts                     # Prisma instance
└── trpc/                         # tRPC setup
prisma/
└── schema.prisma
scripts/                          # seed/migration scripts (run with `npx tsx`)
└── python/                       # Python helper scripts (use venv)
```

## Database Models

- `Problem` — has `entryPoint` (legacy, can be dropped), `inputSignature`, `outputSignature`, `canSubmit` flags
- `Category`, `Tag`, `ProblemTag`
- `TestCase` — has `input`, `stdin` (parsed for Judge0), `expected`
- `CodeSnippet` — per (problem, language) with `template`, `entryPoint` (extracted from template)
- `LanguageConfig` — per language with `prompt`, `driver`, `judge0Id`
- `Submission`, `SubmissionResult` — schema ready, not yet wired up
- `UserProblemProgress`, `Example`, `Hint`, `FollowUp`

## Submission Flow

When a user submits code:

1. Fetch `Problem`, its `TestCase`s (with stdin), `CodeSnippet` for the chosen language, and `LanguageConfig`
2. Build the full script: `prompt + userCode + driver`
3. Replace placeholders in driver: `{{ENTRY_POINT}}` (from `CodeSnippet.entryPoint`), `{{INPUT_SIG}}`, `{{OUTPUT_SIG}}`
4. For C, override the driver from `c-drivers.ts` keyed by signature
5. Send batch (base64-encoded) to Judge0 via RapidAPI
6. Poll for results, decode base64 fields
7. (TODO) Save `Submission` + `SubmissionResult` records, update `UserProblemProgress`

## Languages Supported

| Language    | Status | Notes |
|-------------|--------|-------|
| PYTHON3     | ✅ Full | Generic driver via `eval()` |
| PYTHON      | ✅ Full | Aliased to Python3 (judge0Id 71) |
| JAVASCRIPT  | ✅ Full | Generic driver via JSON parsing |
| TYPESCRIPT  | ✅ Full | Same as JS, with type declarations |
| JAVA        | ✅ Full | Generic driver via reflection |
| CSHARP      | ✅ Full | Generic driver via reflection |
| CPP         | ⚠️ Partial | Hardcoded for `int[],int → int[]` shape; needs per-signature drivers like C |
| C           | ⚠️ Partial | Per-signature drivers in `c-drivers.ts`; expand as needed |
| GO          | ⚠️ Partial | Same situation as C++ |
| RUST        | ⚠️ Partial | Same situation as C++; needs `pub struct Solution;` in prompt |

For partial-support languages, only specific input/output signatures work. Add new signatures to the relevant driver registry as needed.

## Key Conventions

- **Always run scripts with `npx tsx`**, NOT `node` (path aliases like `@/` won't resolve otherwise)
- **Python scripts** live in `scripts/python/` with their own `venv`. Activate with `source venv/bin/activate` before running
- **Path alias `@/`** points to `src/`
- **Prisma client output** is `src/generated/prisma`, not the default `node_modules/.prisma`
- **Import `Language` enum** from `@/generated/prisma/enums`, not Prisma's main client
- **DATABASE_URL:** `.env` uses `DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"` for local Docker Postgres
- **Judge0:** uses base64 encoding for both submission and polling (`base64_encoded=true`) to avoid UTF-8 errors. Decode `stdout`, `stderr`, `compile_output`, `expected_output` from base64 before using

## Important Gotchas

- `replace()` returns a new string in JS — assign the result, don't expect mutation
- The `\n` inside template literals is a real newline character. To store the escape sequence in DB (so Judge0 can interpret it), use `\\n` in the source
- `inputSignature` and `outputSignature` are language-agnostic (e.g. `"int[],int"` and `"int[]"`). Each language's driver translates these to its native types
- TypeScript Judge0 image has a strict TS config — declare `Map`, `Set`, etc. as types in the prompt to avoid lib errors
- TypeScript `Map<K,V>` requires a generic constructor declaration: `interface MapConstructor { new<K,V>(): any; }; declare const Map: MapConstructor;`
- Rust requires `pub struct Solution;` in the prompt before the user's `impl Solution` block
- C compiler checks all branches at compile time, so multi-branch drivers fail. Use per-signature drivers in `c-drivers.ts`

## Common Commands

```bash
# Run any TypeScript script (always use tsx, not node):
npx tsx scripts/<script-name>.ts

# Prisma migrations
npx prisma migrate dev --name <description>
npx prisma generate              # regenerate client after schema changes

# Python scripts (from scripts/python/)
source venv/bin/activate
python3 <script-name>.py

# Run dev server
npm run dev
```

## Seeding Pipeline (in order)

If reseeding from scratch, run these scripts in this order:

1. (Initial seed already done — produces problems, snippets, etc.)
2. `npx tsx scripts/seed-testcases.ts` — fetches HF dataset, populates `TestCase` and `entryPoint`
3. `python3 scripts/python/parse-stdin.py` — parses `TestCase.input` → `TestCase.stdin`
4. `npx tsx scripts/extract-signatures.ts` — extracts `inputSignature`/`outputSignature` on `Problem` from Python3 templates
5. `npx tsx scripts/extract-entry-points.ts` — extracts `entryPoint` on `CodeSnippet` per language
6. `npx tsx scripts/mark-submittable.ts` — sets `canSubmit` flag
7. `npx tsx scripts/seed-language-configs.ts` — seeds the 10 `LanguageConfig` rows

## Status

### Done
- Problem listing with filters (difficulty, category, tags)
- Problem workspace (split pane: description/solution + editor)
- Monaco editor with light/dark theme, language selector, template loading
- Full submission pipeline working end-to-end for all 10 languages (with caveats)

### TODO
- Save `Submission` + `SubmissionResult` records to DB (code drafted, not committed)
- Update `UserProblemProgress` on accepted submissions
- Display results UI (pass/fail per test case, runtime, memory)
- Drop unused `Problem.entryPoint` column (legacy from earlier refactor)
- Improve typed-language driver coverage (add more signatures to `c-drivers.ts`, similar files for C++/Go/Rust)
- Handle design problems (LRU Cache, MinStack etc. — currently `canSubmit: false`)

## Environment Variables

```
DATABASE_URL=postgresql://...
JUDGE0_RAPIDAPI_KEY=<your rapidapi key>
CLERK_SECRET_KEY=<clerk secret>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk publishable>
```
