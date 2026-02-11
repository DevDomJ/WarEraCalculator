-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PriceHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemCode" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "highestBuy" REAL,
    "lowestSell" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_itemCode_fkey" FOREIGN KEY ("itemCode") REFERENCES "Item" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PriceHistory" ("id", "itemCode", "price", "timestamp") SELECT "id", "itemCode", "price", "timestamp" FROM "PriceHistory";
DROP TABLE "PriceHistory";
ALTER TABLE "new_PriceHistory" RENAME TO "PriceHistory";
CREATE INDEX "PriceHistory_itemCode_timestamp_idx" ON "PriceHistory"("itemCode", "timestamp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
