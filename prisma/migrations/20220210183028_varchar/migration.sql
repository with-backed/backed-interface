/*
  Warnings:

  - You are about to alter the column `ethAddress` on the `NotificationRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to alter the column `event` on the `NotificationRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to alter the column `deliveryMethod` on the `NotificationRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to alter the column `deliveryDestination` on the `NotificationRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.

*/
-- AlterTable
ALTER TABLE "NotificationRequest" ALTER COLUMN "ethAddress" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "event" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "deliveryMethod" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "deliveryDestination" SET DATA TYPE VARCHAR(40);
