/*
  Warnings:

  - You are about to drop the column `pythonPrompt` on the `Problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodeSnippet" ADD COLUMN     "driver" TEXT,
ADD COLUMN     "prompt" TEXT;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "pythonPrompt";
