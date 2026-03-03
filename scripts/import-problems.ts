import "dotenv/config"
import fs from "fs"
import prisma from "@/lib/db"
import type { Prisma } from "@/generated/prisma/client"
import { Difficulty, Language } from "@/generated/prisma/enums"

type RawQuestion = {
  title: string
  problem_id: string
  frontend_id: string
  difficulty: string
  problem_slug: string
  topics?: string[]
  description: string
  examples?: { example_text: string }[]
  constraints?: string[]
  hints?: string[]
  code_snippets?: Record<string, string>
  solution?: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * High-level category mapping.
 * First matching topic wins.
 */
function resolveCategory(topics?: string[]): string {
  if (!topics || topics.length === 0) return "Algorithms"

  const t = topics[0]

  const graphTopics = new Set([
    "Graph",
    "Depth-First Search",
    "Breadth-First Search",
    "Topological Sort",
    "Shortest Path",
    "Minimum Spanning Tree",
    "Strongly Connected Component",
    "Eulerian Circuit",
    "Biconnected Component",
  ])

  const dsTopics = new Set([
    "Tree",
    "Binary Tree",
    "Binary Search Tree",
    "Trie",
    "Stack",
    "Queue",
    "Heap (Priority Queue)",
    "Linked List",
    "Segment Tree",
    "Binary Indexed Tree",
    "Union Find",
    "Ordered Set",
    "Monotonic Stack",
    "Monotonic Queue",
    "Data Stream",
    "Iterator",
    "Doubly-Linked List",
  ])

  if (t === "Database") return "Database"
  if (t === "Concurrency") return "Concurrency"
  if (graphTopics.has(t)) return "Graph Theory"
  if (dsTopics.has(t)) return "Data Structures"

  return "Algorithms"
}

async function main() {
  console.log("Reading file...")
  const raw = fs.readFileSync("./scripts/leetcode-problems.json", "utf-8")
  const parsed: { questions: RawQuestion[] } = JSON.parse(raw)
  const questions = parsed.questions

  // -----------------------
  // 1️⃣ Seed Categories
  // -----------------------
  const categoryNames = [
    "Algorithms",
    "Data Structures",
    "Graph Theory",
    "Database",
    "Concurrency",
  ]

  await prisma.category.createMany({
    data: categoryNames.map(name => ({ name })),
    skipDuplicates: true,
  })

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  })

  const categoryMap = new Map(categories.map(c => [c.name, c.id]))

  // -----------------------
  // 2️⃣ Collect Tags
  // -----------------------
  const tagSet = new Set<string>()
  for (const q of questions) {
    for (const t of q.topics ?? []) tagSet.add(t)
  }

  await prisma.tag.createMany({
    data: Array.from(tagSet).map(name => ({ name })),
    skipDuplicates: true,
  })

  const tags = await prisma.tag.findMany({ select: { id: true, name: true } })
  const tagMap = new Map(tags.map(t => [t.name, t.id]))

  // -----------------------
  // 3️⃣ Create Problems (with category)
  // -----------------------
  const problemsData: Prisma.ProblemCreateManyInput[] = questions.map(q => {
    const categoryName = resolveCategory(q.topics)
    const categoryId = categoryMap.get(categoryName)!

    return {
      title: q.title,
      slug: q.problem_slug,
      difficulty: q.difficulty.toUpperCase() as Difficulty,
      description: q.description,
      constraints: q.constraints?.join("\n") ?? null,
      solution: q.solution ?? null,
      externalId: q.problem_id,
      frontendId: q.frontend_id,
      categoryId,
    }
  })

  for (const batch of chunk(problemsData, 200)) {
    await prisma.problem.createMany({
      data: batch,
      skipDuplicates: true,
    })
  }

  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true },
  })

  const problemMap = new Map(problems.map(p => [p.slug, p.id]))

  // -----------------------
  // 4️⃣ Build relations in memory
  // -----------------------
  const problemTags: Prisma.ProblemTagCreateManyInput[] = []
  const examples: Prisma.ExampleCreateManyInput[] = []
  const hints: Prisma.HintCreateManyInput[] = []
  const snippets: Prisma.CodeSnippetCreateManyInput[] = []

  const validLanguages = Object.values(Language)

  for (const q of questions) {
    const problemId = problemMap.get(q.problem_slug)
    if (!problemId) continue

    for (const topic of q.topics ?? []) {
      const tagId = tagMap.get(topic)
      if (!tagId) continue
      problemTags.push({ problemId, tagId })
    }

    q.examples?.forEach((ex, i) => {
      examples.push({
        problemId,
        order: i,
        content: ex.example_text,
      })
    })

    q.hints?.forEach((h, i) => {
      hints.push({
        problemId,
        order: i,
        content: h,
      })
    })

    for (const [lang, code] of Object.entries(q.code_snippets ?? {})) {
      const mapped = lang.toUpperCase() as Language
      if (!validLanguages.includes(mapped)) continue

      snippets.push({
        problemId,
        language: mapped,
        template: code,
      })
    }
  }

  // -----------------------
  // 5️⃣ Bulk Insert Relations
  // -----------------------
  for (const batch of chunk(problemTags, 500)) {
    await prisma.problemTag.createMany({ data: batch, skipDuplicates: true })
  }

  for (const batch of chunk(examples, 500)) {
    await prisma.example.createMany({ data: batch, skipDuplicates: true })
  }

  for (const batch of chunk(hints, 500)) {
    await prisma.hint.createMany({ data: batch, skipDuplicates: true })
  }

  for (const batch of chunk(snippets, 500)) {
    await prisma.codeSnippet.createMany({ data: batch, skipDuplicates: true })
  }

  console.log("Import complete.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })