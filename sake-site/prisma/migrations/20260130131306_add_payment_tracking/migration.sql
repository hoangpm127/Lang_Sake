-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "depositPaidAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "depositSource" TEXT;
ALTER TABLE "Booking" ADD COLUMN "depositTransferContent" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paymentBankRef" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paymentQRCode" TEXT;
