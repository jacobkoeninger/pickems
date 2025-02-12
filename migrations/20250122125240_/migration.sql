/*
  Warnings:

  - Added the required column `updatedAt` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pickem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PickemCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PickemChoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPickemChoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deadline" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Contest" ("createdAt", "deadline", "description", "id", "name") SELECT "createdAt", "deadline", "description", "id", "name" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
CREATE INDEX "Contest_isActive_idx" ON "Contest"("isActive");
CREATE TABLE "new_Pickem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "correctChoiceId" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    CONSTRAINT "Pickem_correctChoiceId_fkey" FOREIGN KEY ("correctChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pickem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PickemCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pickem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pickem" ("categoryId", "contestId", "correctChoiceId", "createdAt", "id") SELECT "categoryId", "contestId", "correctChoiceId", "createdAt", "id" FROM "Pickem";
DROP TABLE "Pickem";
ALTER TABLE "new_Pickem" RENAME TO "Pickem";
CREATE UNIQUE INDEX "Pickem_correctChoiceId_key" ON "Pickem"("correctChoiceId");
CREATE INDEX "Pickem_status_idx" ON "Pickem"("status");
CREATE INDEX "Pickem_contestId_idx" ON "Pickem"("contestId");
CREATE INDEX "Pickem_categoryId_idx" ON "Pickem"("categoryId");
CREATE TABLE "new_PickemCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_PickemCategory" ("createdAt", "description", "id", "name") SELECT "createdAt", "description", "id", "name" FROM "PickemCategory";
DROP TABLE "PickemCategory";
ALTER TABLE "new_PickemCategory" RENAME TO "PickemCategory";
CREATE UNIQUE INDEX "PickemCategory_name_key" ON "PickemCategory"("name");
CREATE INDEX "PickemCategory_isActive_sortOrder_idx" ON "PickemCategory"("isActive", "sortOrder");
CREATE TABLE "new_PickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "pickemId" INTEGER NOT NULL,
    "ownerId" INTEGER,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PickemChoice" ("createdAt", "id", "ownerId", "pickemId", "text") SELECT "createdAt", "id", "ownerId", "pickemId", "text" FROM "PickemChoice";
DROP TABLE "PickemChoice";
ALTER TABLE "new_PickemChoice" RENAME TO "PickemChoice";
CREATE INDEX "PickemChoice_pickemId_idx" ON "PickemChoice"("pickemId");
CREATE INDEX "PickemChoice_ownerId_idx" ON "PickemChoice"("ownerId");
CREATE TABLE "new_UserPickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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
CREATE INDEX "UserPickemChoice_userId_idx" ON "UserPickemChoice"("userId");
CREATE INDEX "UserPickemChoice_pickemId_idx" ON "UserPickemChoice"("pickemId");
CREATE INDEX "UserPickemChoice_pickemChoiceId_idx" ON "UserPickemChoice"("pickemChoiceId");
CREATE UNIQUE INDEX "UserPickemChoice_userId_pickemId_key" ON "UserPickemChoice"("userId", "pickemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
