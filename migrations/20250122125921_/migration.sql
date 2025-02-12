/*
  Warnings:

  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.

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
    "nicknameUserId" INTEGER,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_nicknameUserId_fkey" FOREIGN KEY ("nicknameUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PickemChoice" ("createdAt", "description", "id", "ownerId", "pickemId", "text", "updatedAt") SELECT "createdAt", "description", "id", "ownerId", "pickemId", "text", "updatedAt" FROM "PickemChoice";
DROP TABLE "PickemChoice";
ALTER TABLE "new_PickemChoice" RENAME TO "PickemChoice";
CREATE INDEX "PickemChoice_pickemId_idx" ON "PickemChoice"("pickemId");
CREATE INDEX "PickemChoice_ownerId_idx" ON "PickemChoice"("ownerId");
CREATE INDEX "PickemChoice_nicknameUserId_idx" ON "PickemChoice"("nicknameUserId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "displayName", "id", "isAdmin", "points", "username") SELECT "avatarUrl", "createdAt", "displayName", "id", "isAdmin", "points", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
