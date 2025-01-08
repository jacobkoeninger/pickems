/*
  Warnings:

  - Added the required column `deadline` to the `Contest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deadline" DATETIME NOT NULL
);
INSERT INTO "new_Contest" ("description", "id", "name") SELECT "description", "id", "name" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
