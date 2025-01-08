/*
  Warnings:

  - You are about to drop the `Choice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prediction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPrediction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Choice";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Prediction";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserPrediction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Pickem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "correctChoiceId" INTEGER,
    CONSTRAINT "Pickem_correctChoiceId_fkey" FOREIGN KEY ("correctChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pickemId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "pickemChoiceId" INTEGER NOT NULL,
    CONSTRAINT "UserPickemChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemChoiceId_fkey" FOREIGN KEY ("pickemChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pickem_correctChoiceId_key" ON "Pickem"("correctChoiceId");
