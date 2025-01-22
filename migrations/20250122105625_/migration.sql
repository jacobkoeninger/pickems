/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "nickname" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "pickemChoiceId" INTEGER NOT NULL,
    "pickemId" INTEGER NOT NULL,
    CONSTRAINT "UserPickemChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemChoiceId_fkey" FOREIGN KEY ("pickemChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserPickemChoice" ("createdAt", "id", "pickemChoiceId", "pickemId", "userId") SELECT "createdAt", "id", "pickemChoiceId", "pickemId", "userId" FROM "UserPickemChoice";
DROP TABLE "UserPickemChoice";
ALTER TABLE "new_UserPickemChoice" RENAME TO "UserPickemChoice";
CREATE UNIQUE INDEX "UserPickemChoice_userId_pickemId_key" ON "UserPickemChoice"("userId", "pickemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");
