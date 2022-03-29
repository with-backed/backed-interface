/*
  Warnings:

  - The primary key for the `NotificationRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "NotificationRequest" DROP CONSTRAINT "NotificationRequest_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "NotificationRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "NotificationRequest_id_seq";
