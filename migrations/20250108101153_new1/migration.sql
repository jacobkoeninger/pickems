/*
  Warnings:

  - Added the required column `pickemId` to the `UserPickemChoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "pickemChoiceId" INTEGER NOT NULL,
    "pickemId" INTEGER NOT NULL,
    CONSTRAINT "UserPickemChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemChoiceId_fkey" FOREIGN KEY ("pickemChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserPickemChoice" ("id", "pickemChoiceId", "userId") SELECT "id", "pickemChoiceId", "userId" FROM "UserPickemChoice";
DROP TABLE "UserPickemChoice";
ALTER TABLE "new_UserPickemChoice" RENAME TO "UserPickemChoice";
CREATE UNIQUE INDEX "UserPickemChoice_userId_pickemId_key" ON "UserPickemChoice"("userId", "pickemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
