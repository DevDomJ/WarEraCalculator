-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "productionValue" REAL NOT NULL,
    "maxProduction" REAL NOT NULL DEFAULT 200,
    "energyConsumption" REAL NOT NULL,
    "automatedEngineLevel" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "lastFetched" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("companyId", "createdAt", "displayOrder", "energyConsumption", "id", "lastFetched", "maxProduction", "name", "productionValue", "region", "type", "updatedAt", "userId") SELECT "companyId", "createdAt", "displayOrder", "energyConsumption", "id", "lastFetched", "maxProduction", "name", "productionValue", "region", "type", "updatedAt", "userId" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_companyId_key" ON "Company"("companyId");
CREATE INDEX "Company_userId_idx" ON "Company"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
