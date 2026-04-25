/*
  Warnings:

  - You are about to drop the column `driver` on the `CodeSnippet` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `CodeSnippet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodeSnippet" DROP COLUMN "driver",
DROP COLUMN "prompt",
ADD COLUMN     "driverOverride" TEXT;

-- CreateTable
CREATE TABLE "LanguageConfig" (
    "language" "Language" NOT NULL,
    "prompt" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "judge0Id" INTEGER NOT NULL,

    CONSTRAINT "LanguageConfig_pkey" PRIMARY KEY ("language")
);
