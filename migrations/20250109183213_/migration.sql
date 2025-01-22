-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deadline" DATETIME NOT NULL
);
INSERT INTO "new_Contest" ("deadline", "description", "id", "name") SELECT "deadline", "description", "id", "name" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
CREATE TABLE "new_Pickem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctChoiceId" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    CONSTRAINT "Pickem_correctChoiceId_fkey" FOREIGN KEY ("correctChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pickem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PickemCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pickem_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pickem" ("categoryId", "contestId", "correctChoiceId", "id") SELECT "categoryId", "contestId", "correctChoiceId", "id" FROM "Pickem";
DROP TABLE "Pickem";
ALTER TABLE "new_Pickem" RENAME TO "Pickem";
CREATE UNIQUE INDEX "Pickem_correctChoiceId_key" ON "Pickem"("correctChoiceId");
CREATE TABLE "new_PickemCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT
);
INSERT INTO "new_PickemCategory" ("description", "id", "name") SELECT "description", "id", "name" FROM "PickemCategory";
DROP TABLE "PickemCategory";
ALTER TABLE "new_PickemCategory" RENAME TO "PickemCategory";
CREATE UNIQUE INDEX "PickemCategory_name_key" ON "PickemCategory"("name");
CREATE TABLE "new_PickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "pickemId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "PickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PickemChoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PickemChoice" ("id", "ownerId", "pickemId", "text") SELECT "id", "ownerId", "pickemId", "text" FROM "PickemChoice";
DROP TABLE "PickemChoice";
ALTER TABLE "new_PickemChoice" RENAME TO "PickemChoice";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatarUrl", "displayName", "id", "isAdmin", "points", "username") SELECT "avatarUrl", "displayName", "id", "isAdmin", "points", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_UserPickemChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "pickemChoiceId" INTEGER NOT NULL,
    "pickemId" INTEGER NOT NULL,
    CONSTRAINT "UserPickemChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemChoiceId_fkey" FOREIGN KEY ("pickemChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPickemChoice_pickemId_fkey" FOREIGN KEY ("pickemId") REFERENCES "Pickem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserPickemChoice" ("id", "pickemChoiceId", "pickemId", "userId") SELECT "id", "pickemChoiceId", "pickemId", "userId" FROM "UserPickemChoice";
DROP TABLE "UserPickemChoice";
ALTER TABLE "new_UserPickemChoice" RENAME TO "UserPickemChoice";
CREATE UNIQUE INDEX "UserPickemChoice_userId_pickemId_key" ON "UserPickemChoice"("userId", "pickemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
