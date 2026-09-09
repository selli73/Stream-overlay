-- AlterTable
ALTER TABLE "User" ADD COLUMN     "donationAlertsAccessToken" TEXT,
ADD COLUMN     "donationAlertsExpiryDate" TIMESTAMP(3),
ADD COLUMN     "donationAlertsRefreshToken" TEXT;
