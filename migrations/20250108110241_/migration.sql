/*
  Warnings:

  - Added the required column `contestId` to the `Pickem` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryId` on table `Pickem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pickem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "correctChoiceId" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    CONSTRAINT "Pickem_correctChoiceId_fkey" FOREIGN KEY ("correctChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pickem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PickemCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pickem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pickem" ("categoryId", "correctChoiceId", "id") SELECT "categoryId", "correctChoiceId", "id" FROM "Pickem";
DROP TABLE "Pickem";
ALTER TABLE "new_Pickem" RENAME TO "Pickem";
CREATE UNIQUE INDEX "Pickem_correctChoiceId_key" ON "Pickem"("correctChoiceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
