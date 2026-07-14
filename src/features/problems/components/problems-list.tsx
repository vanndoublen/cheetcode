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
import { CheckCircle, CloudFreeIcons, HeartRemoveFreeIcons, Loading03FreeIcons, Task01FreeIcons } from "@hugeicons/core-free-icons";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Problem, ProgressStatus, UserProblemProgress } from "@/generated/prisma/client";


const renderDifficulty = (difficulty: string) => {
  const level = difficulty === "EASY" ? 1 : difficulty === "MEDIUM" ? 2 : 3;

  const color = "text-foreground";
  // const color =
  //   difficulty === "EASY"
  //     ? "text-green-300"
  //     : difficulty === "MEDIUM"
  //     ? "text-blue-300"
  //     : "text-red-300";

  // three arc segments across a 180° top semicircle
  const R = 8, cx = 11, cy = 11;
  const segs = [
    { a0: 180, a1: 240 },
    { a0: 240, a1: 300 },
    { a0: 300, a1: 360 },
  ];
  const round = (n: number) => Math.round(n * 1000) / 1000;

  const pt = (ang: number): [number, number] => {
    const rad = (ang * Math.PI) / 180;
    return [round(cx + R * Math.cos(rad)), round(cy + R * Math.sin(rad))];
  };

  return (
    <span
      className={`inline-flex justify-end ${color}`}
      title={difficulty[0] + difficulty.slice(1).toLowerCase()}
    >
      <span className="sr-only">{difficulty}</span>
      <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
        {segs.map((s, i) => {
          const [x0, y0] = pt(s.a0);
          const [x1, y1] = pt(s.a1);
          const active = i < level;
          return (
            <path
              key={i}
              d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              stroke={active ? "currentColor" : "currentColor"}
              className={active ? "opacity-100" : "opacity-15"}
            />
          );
        })}
      </svg>
    </span>
  );
};

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

const renderStatus = (
  status: ProgressStatus
) => {
  if (status === "SOLVED") {
    return (
      <span>
        <HugeiconsIcon icon={CheckCircle} strokeWidth={2} className="size-3 " />
      </span>
    )
  } else if (status === "ATTEMPTED") {
    return (
      <span>
        <HugeiconsIcon icon={HeartRemoveFreeIcons} strokeWidth={2} className="size-3 " />
      </span>
    )
  } else {
    return <div></div>;
  }
}


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
        <TableHeader className="pointer-events-none">
          <TableRow>
            <TableHead className=""></TableHead>
            <TableHead className="w-25">No</TableHead>
            <TableHead className="truncate">Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.items.map((problem, index) => (
            <TableRow
              key={problem.slug}
              className="h-10! cursor-pointer"
              onClick={() => router.push(`/problems/${problem.slug}`)}
            >
              <TableCell className="font-medium">
                {renderStatus(problem.userProblemProgresses[0]?.status)}
              </TableCell>
              <TableCell className="font-medium">{((problems.page - 1) * problems.pageSize) + index + 1}</TableCell>
              <TableCell
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