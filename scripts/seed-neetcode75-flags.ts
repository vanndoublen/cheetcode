import "dotenv/config";
import prisma from "@/lib/db";

const NEETCODE_75_SLUGS = [
  // Array
  "two-sum", "best-time-to-buy-and-sell-stock", "contains-duplicate",
  "product-of-array-except-self", "maximum-subarray", "maximum-product-subarray",
  "find-minimum-in-rotated-sorted-array", "search-in-rotated-sorted-array",
  "3sum", "container-with-most-water",
  // Binary
  "sum-of-two-integers", "number-of-1-bits", "counting-bits",
  "missing-number", "reverse-bits",
  // Dynamic Programming
  "climbing-stairs", "coin-change", "longest-increasing-subsequence",
  "longest-common-subsequence", "word-break", "combination-sum-iv",
  "house-robber", "house-robber-ii", "decode-ways", "unique-paths", "jump-game",
  // Graph
  "clone-graph", "course-schedule", "pacific-atlantic-water-flow",
  "number-of-islands", "longest-consecutive-sequence", "alien-dictionary",
  "graph-valid-tree", "number-of-connected-components-in-an-undirected-graph",
  // Interval
  "insert-interval", "merge-intervals", "non-overlapping-intervals",
  "meeting-rooms", "meeting-rooms-ii",
  // Linked List
  "reverse-linked-list", "linked-list-cycle", "merge-two-sorted-lists",
  "merge-k-sorted-lists", "remove-nth-node-from-end-of-list", "reorder-list",
  // Matrix
  "set-matrix-zeroes", "spiral-matrix", "rotate-image", "word-search",
  // String
  "longest-substring-without-repeating-characters",
  "longest-repeating-character-replacement", "minimum-window-substring",
  "valid-anagram", "group-anagrams", "valid-parentheses", "valid-palindrome",
  "longest-palindromic-substring", "palindromic-substrings",
  "encode-and-decode-strings",
  // Tree
  "maximum-depth-of-binary-tree", "same-tree", "invert-binary-tree",
  "binary-tree-maximum-path-sum", "binary-tree-level-order-traversal",
  "serialize-and-deserialize-binary-tree", "subtree-of-another-tree",
  "construct-binary-tree-from-preorder-and-inorder-traversal",
  "validate-binary-search-tree", "kth-smallest-element-in-a-bst",
  "lowest-common-ancestor-of-a-binary-search-tree", "implement-trie-prefix-tree",
  "design-add-and-search-words-data-structure", "word-search-ii",
  // Heap
  "merge-k-sorted-lists", "top-k-frequent-elements", "find-median-from-data-stream",
];


const main = async () => {
  // NeetCode 75
  const found75 = await prisma.problem.findMany({
    where: { slug: { in: NEETCODE_75_SLUGS } },
    select: { slug: true },
  });
  const found75Slugs = found75.map(f => f.slug);
  const missing75 = NEETCODE_75_SLUGS.filter(s => !found75Slugs.includes(s));
  console.log(`NC75 — Found: ${found75.length} / ${NEETCODE_75_SLUGS.length}`);
  if (missing75.length) console.log("Missing:", missing75);
  await prisma.problem.updateMany({
    where: { slug: { in: found75Slugs } },
    data: { isNeetCode75: true },
  });

  console.log("Done");
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });