-- CreateIndex
CREATE INDEX "Problem_updatedAt_idx" ON "Problem"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Problem_title_updatedAt_idx" ON "Problem"("title", "updatedAt" DESC);
