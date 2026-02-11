-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemCode" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "Item" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradingOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradingOrder_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "Item" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "workers" INTEGER NOT NULL,
    "wagePerWorker" REAL NOT NULL,
    "productionValue" REAL NOT NULL,
    "energyConsumption" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "actualPP" REAL NOT NULL,
    "expectedPP" REAL NOT NULL,
    "variance" REAL NOT NULL,
    CONSTRAINT "ProductionHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("companyId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");

-- CreateIndex
CREATE INDEX "PriceHistory_itemCode_timestamp_idx" ON "PriceHistory"("itemCode", "timestamp");

-- CreateIndex
CREATE INDEX "TradingOrder_itemCode_type_timestamp_idx" ON "TradingOrder"("itemCode", "type", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyId_key" ON "Company"("companyId");

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "Company"("userId");

-- CreateIndex
CREATE INDEX "ProductionHistory_companyId_date_idx" ON "ProductionHistory"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionHistory_companyId_date_key" ON "ProductionHistory"("companyId", "date");
