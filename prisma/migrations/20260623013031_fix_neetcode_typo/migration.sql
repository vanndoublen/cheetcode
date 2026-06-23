/*
  Warnings:

  - You are about to drop the column `isNeedCode75` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "isNeedCode75",
ADD COLUMN     "isNeetCode75" BOOLEAN NOT NULL DEFAULT false;
