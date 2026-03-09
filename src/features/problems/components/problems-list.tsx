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
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudFreeIcons, Loading03FreeIcons, Task01FreeIcons } from "@hugeicons/core-free-icons";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


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
  const router = useRouter();

  const { data: problems, isFetching, isPending, isLoading, isRefetching, fetchStatus } = useSuspenseProblems();
  const isSpinning = isFetching || isPending || isLoading || isRefetching || fetchStatus === "fetching";

  if (isSpinning) {
    return (
      <ProblemLoading />
    )
  }

  if (problems.items.length === 0) {
    return <ProblemEmpty />
  }

  return (
    <div className="p-4 border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">No</TableHead>
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
              <TableCell
                className="cursor-pointer hover:underline"
                onClick={() => router.push(`/problems/${problem.slug}`)}
                
              >
                {problem.title}
              </TableCell>
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

export const ProblemLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto">
      <HugeiconsIcon icon={Loading03FreeIcons} strokeWidth={2} className="animate-spin" />
    </div>
  )
}

const ProblemEmpty = () => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Task01FreeIcons} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>Empty</EmptyTitle>
        <EmptyDescription>
          No problems related to the filters found.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}