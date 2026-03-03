import fs from "fs"

type RawQuestion = {
  topics?: string[]
}

function main() {
  const raw = fs.readFileSync("./scripts/leetcode-problems.json", "utf-8")
  const parsed: { questions: RawQuestion[] } = JSON.parse(raw)

  const topicCount = new Map<string, number>()

  for (const q of parsed.questions) {
    for (const topic of q.topics ?? []) {
      topicCount.set(topic, (topicCount.get(topic) ?? 0) + 1)
    }
  }

  const sorted = Array.from(topicCount.entries())
    .sort((a, b) => b[1] - a[1])

  console.log("Total unique topics:", sorted.length)
  console.log("")

  for (const [topic, count] of sorted) {
    console.log(`${topic} — ${count}`)
  }
}

main()