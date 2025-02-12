/*
  Warnings:

  - You are about to drop the column `nicknameUserId` on the `PickemChoice` table. All the data in the column will be lost.

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
    "ownerId" INTEGER,
    "nickname" TEXT,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PickemChoice" ("createdAt", "description", "id", "ownerId", "pickemId", "text", "updatedAt") SELECT "createdAt", "description", "id", "ownerId", "pickemId", "text", "updatedAt" FROM "PickemChoice";
DROP TABLE "PickemChoice";
ALTER TABLE "new_PickemChoice" RENAME TO "PickemChoice";
CREATE INDEX "PickemChoice_pickemId_idx" ON "PickemChoice"("pickemId");
CREATE INDEX "PickemChoice_ownerId_idx" ON "PickemChoice"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
