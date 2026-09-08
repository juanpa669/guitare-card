-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "surnom" TEXT,
    "diapason" TEXT NOT NULL,
    "radius" TEXT NOT NULL,
    "nombreCordes" INTEGER,
    "dateCreation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instrumentId" TEXT NOT NULL,
    "cordesGauge" TEXT NOT NULL,
    "controles" TEXT NOT NULL,
    "etatCordes" TEXT NOT NULL,
    "etatFrettes" TEXT NOT NULL,
    "frettesAutre" TEXT,
    "elementsDevisses" TEXT,
    "piecesManquantes" TEXT,
    "sillet" TEXT NOT NULL,
    "silletAutre" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Observation_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeasureOriginal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instrumentId" TEXT NOT NULL,
    "actionBass12" REAL NOT NULL,
    "actionTreble12" REAL NOT NULL,
    "courbureManche10" REAL NOT NULL,
    "formePontet" TEXT NOT NULL,
    "dateMesure" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MeasureOriginal_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeasureMicro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mesureOriginaleId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "hauteurBass" REAL NOT NULL,
    "hauteurTreble" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MeasureMicro_mesureOriginaleId_fkey" FOREIGN KEY ("mesureOriginaleId") REFERENCES "MeasureOriginal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestAfterMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mesureOriginaleId" TEXT NOT NULL,
    "frise" BOOLEAN NOT NULL,
    "vibrations" BOOLEAN NOT NULL,
    "son" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestAfterMeasure_mesureOriginaleId_fkey" FOREIGN KEY ("mesureOriginaleId") REFERENCES "MeasureOriginal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reglage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instrumentId" TEXT NOT NULL,
    "dateSaisie" TEXT NOT NULL,
    "courbureManche" REAL NOT NULL,
    "action12frette" REAL NOT NULL,
    "radiusChevalet" REAL NOT NULL,
    "intonation" TEXT NOT NULL,
    "microBrand" TEXT,
    "ordre" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reglage_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReglageMicro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reglageId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "hauteur" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReglageMicro_reglageId_fkey" FOREIGN KEY ("reglageId") REFERENCES "Reglage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReglageString" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reglageId" TEXT NOT NULL,
    "stringNum" INTEGER NOT NULL,
    "stringLabel" TEXT NOT NULL,
    "hauteur" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReglageString_reglageId_fkey" FOREIGN KEY ("reglageId") REFERENCES "Reglage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TestAfterMeasure_mesureOriginaleId_key" ON "TestAfterMeasure"("mesureOriginaleId");
