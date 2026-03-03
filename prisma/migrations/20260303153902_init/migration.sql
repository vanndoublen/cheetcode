-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('CPP', 'JAVA', 'PYTHON', 'PYTHON3', 'JAVASCRIPT', 'TYPESCRIPT', 'GO', 'RUST', 'C', 'CSHARP');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILE_ERROR');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('ATTEMPTED', 'SOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "description" TEXT NOT NULL,
    "constraints" TEXT,
    "solution" TEXT,
    "externalId" TEXT,
    "frontendId" TEXT,
    "timeLimitMs" INTEGER NOT NULL DEFAULT 1000,
    "memoryLimitKb" INTEGER NOT NULL DEFAULT 262144,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTag" (
    "problemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProblemTag_pkey" PRIMARY KEY ("problemId","tagId")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSnippet" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "CodeSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "runtimeMs" INTEGER,
    "memoryKb" INTEGER,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "judgeToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionResult" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "runtimeMs" INTEGER,
    "memoryKb" INTEGER,
    "output" TEXT,
    "error" TEXT,

    CONSTRAINT "SubmissionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProblemProgress" (
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL,
    "bestRuntimeMs" INTEGER,
    "bestMemoryKb" INTEGER,
    "solvedAt" TIMESTAMP(3),

    CONSTRAINT "UserProblemProgress_pkey" PRIMARY KEY ("userId","problemId")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

-- CreateIndex
CREATE INDEX "Problem_difficulty_idx" ON "Problem"("difficulty");

-- CreateIndex
CREATE INDEX "Problem_isPublished_idx" ON "Problem"("isPublished");

-- CreateIndex
CREATE INDEX "Problem_categoryId_idx" ON "Problem"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "TestCase_problemId_idx" ON "TestCase"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_problemId_order_key" ON "TestCase"("problemId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CodeSnippet_problemId_language_key" ON "CodeSnippet"("problemId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_judgeToken_key" ON "Submission"("judgeToken");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_problemId_idx" ON "Submission"("problemId");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_idx" ON "Submission"("userId", "problemId");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- CreateIndex
CREATE INDEX "SubmissionResult_submissionId_idx" ON "SubmissionResult"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionResult_submissionId_testCaseId_key" ON "SubmissionResult"("submissionId", "testCaseId");

-- CreateIndex
CREATE INDEX "Example_problemId_idx" ON "Example"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "Example_problemId_order_key" ON "Example"("problemId", "order");

-- CreateIndex
CREATE INDEX "Hint_problemId_idx" ON "Hint"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "Hint_problemId_order_key" ON "Hint"("problemId", "order");

-- CreateIndex
CREATE INDEX "FollowUp_problemId_idx" ON "FollowUp"("problemId");

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSnippet" ADD CONSTRAINT "CodeSnippet_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionResult" ADD CONSTRAINT "SubmissionResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionResult" ADD CONSTRAINT "SubmissionResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProblemProgress" ADD CONSTRAINT "UserProblemProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProblemProgress" ADD CONSTRAINT "UserProblemProgress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
