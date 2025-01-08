-- CreateTable
CREATE TABLE "PickemCategory" (
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
    "categoryId" INTEGER,
    CONSTRAINT "Pickem_correctChoiceId_fkey" FOREIGN KEY ("correctChoiceId") REFERENCES "PickemChoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pickem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PickemCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pickem" ("correctChoiceId", "id") SELECT "correctChoiceId", "id" FROM "Pickem";
DROP TABLE "Pickem";
ALTER TABLE "new_Pickem" RENAME TO "Pickem";
CREATE UNIQUE INDEX "Pickem_correctChoiceId_key" ON "Pickem"("correctChoiceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PickemCategory_name_key" ON "PickemCategory"("name");
