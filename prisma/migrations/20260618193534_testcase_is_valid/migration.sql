-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "invalidReason" TEXT,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true;
