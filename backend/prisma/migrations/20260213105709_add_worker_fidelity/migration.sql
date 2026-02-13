-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Worker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT 'Unknown',
    "avatarUrl" TEXT,
    "wage" REAL NOT NULL,
    "maxEnergy" REAL NOT NULL DEFAULT 70,
    "production" REAL NOT NULL DEFAULT 0,
    "fidelity" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Worker_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("companyId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Worker" ("avatarUrl", "companyId", "createdAt", "id", "maxEnergy", "production", "updatedAt", "userId", "username", "wage", "workerId") SELECT "avatarUrl", "companyId", "createdAt", "id", "maxEnergy", "production", "updatedAt", "userId", "username", "wage", "workerId" FROM "Worker";
DROP TABLE "Worker";
ALTER TABLE "new_Worker" RENAME TO "Worker";
CREATE UNIQUE INDEX "Worker_workerId_key" ON "Worker"("workerId");
CREATE INDEX "Worker_companyId_idx" ON "Worker"("companyId");
CREATE INDEX "Worker_userId_idx" ON "Worker"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
