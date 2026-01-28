-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateTime" DATETIME NOT NULL,
    "guests" INTEGER NOT NULL,
    "comboName" TEXT NOT NULL,
    "comboPrice" INTEGER NOT NULL,
    "hasDeposit" BOOLEAN NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "finalTotal" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
