/*
  Warnings:

  - You are about to drop the `UserCodeDraft` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCodeDraft" DROP CONSTRAINT "UserCodeDraft_problemId_fkey";

-- DropForeignKey
ALTER TABLE "UserCodeDraft" DROP CONSTRAINT "UserCodeDraft_userId_fkey";

-- DropTable
DROP TABLE "UserCodeDraft";
