-- CreateEnum
CREATE TYPE "JudgeMode" AS ENUM ('EXACT', 'NORMALIZED', 'CHECKER', 'UNSUPPORTED');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "checkerKey" TEXT,
ADD COLUMN     "judgeMode" "JudgeMode" NOT NULL DEFAULT 'NORMALIZED';
