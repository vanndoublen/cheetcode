-- CreateTable
CREATE TABLE "UserCodeDraft" (
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "code" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCodeDraft_pkey" PRIMARY KEY ("userId","problemId","language")
);

-- AddForeignKey
ALTER TABLE "UserCodeDraft" ADD CONSTRAINT "UserCodeDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCodeDraft" ADD CONSTRAINT "UserCodeDraft_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
