/*
  Warnings:

  - Added the required column `text` to the `PickemChoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "pickemId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PickemChoice" ("id", "ownerId", "pickemId") SELECT "id", "ownerId", "pickemId" FROM "PickemChoice";
DROP TABLE "PickemChoice";
ALTER TABLE "new_PickemChoice" RENAME TO "PickemChoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
