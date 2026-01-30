-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Commission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Commission" ("amount", "bookingId", "createdAt", "id", "isPaid", "paidAt", "partnerId", "rate") SELECT "amount", "bookingId", "createdAt", "id", "isPaid", "paidAt", "partnerId", "rate" FROM "Commission";
DROP TABLE "Commission";
ALTER TABLE "new_Commission" RENAME TO "Commission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
