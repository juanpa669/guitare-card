-- AlterTable
ALTER TABLE "ReglageMicro" ADD COLUMN "microBrand" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Instrument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "surnom" TEXT,
    "diapason" TEXT NOT NULL,
    "radius" TEXT NOT NULL,
    "nombreCordes" INTEGER,
    "nombreMicros" INTEGER NOT NULL DEFAULT 2,
    "dateCreation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Instrument" ("createdAt", "dateCreation", "diapason", "id", "marque", "modele", "nombreCordes", "radius", "surnom", "type", "updatedAt") SELECT "createdAt", "dateCreation", "diapason", "id", "marque", "modele", "nombreCordes", "radius", "surnom", "type", "updatedAt" FROM "Instrument";
DROP TABLE "Instrument";
ALTER TABLE "new_Instrument" RENAME TO "Instrument";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
