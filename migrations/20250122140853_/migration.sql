/*
  Warnings:

  - You are about to drop the column `ownerId` on the `PickemChoice` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "pickemId" INTEGER NOT NULL,
    "nickname" TEXT,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PickemChoice" ("createdAt", "description", "id", "nickname", "pickemId", "text", "updatedAt") SELECT "createdAt", "description", "id", "nickname", "pickemId", "text", "updatedAt" FROM "PickemChoice";
DROP TABLE "PickemChoice";
ALTER TABLE "new_PickemChoice" RENAME TO "PickemChoice";
CREATE INDEX "PickemChoice_pickemId_idx" ON "PickemChoice"("pickemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
