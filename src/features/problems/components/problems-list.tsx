"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { useSuspenseProblems } from "../hooks/use-problems";
import { Difficulty } from "@/generated/prisma/enums";


const renderDifficulty = (difficulty: string) => {
  let color = ""

  if (difficulty === "EASY") {
    color = "bg-green-100 text-green-700"
  } else if (difficulty === "MEDIUM") {
    color = "bg-yellow-100 text-yellow-700"
  } else if (difficulty === "HARD") {
    color = "bg-red-100 text-red-700"
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
      {difficulty}
    </span>
  )
}

const renderTag = (
  tags: { tag: { name: string } }[]
) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t.tag.name}
          className="px-2 py-0.5 text-xs border rounded"
        >
          {t.tag.name}
        </span>
      ))}
    </div>
  );
};


export const ProblemsList = () => {
    const { data: problems } = useSuspenseProblems();
    return (
        <div className="p-4 border border-inset">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">No</TableHead>
                        <TableHead className="truncate">Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Difficulty</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {problems.items.map((problem, index) => (
                        <TableRow key={problem.slug} className="h-10!">
                            <TableCell className="font-medium">{((problems.page - 1) * problems.pageSize) + index + 1}</TableCell>
                            <TableCell>{problem.title}</TableCell>
                            <TableCell>{problem.category?.name}</TableCell>
                            <TableCell>{renderTag(problem.tags)}</TableCell>
                            <TableCell className="text-right">{renderDifficulty(problem.difficulty)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}