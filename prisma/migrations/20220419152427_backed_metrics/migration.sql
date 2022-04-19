/*
  Warnings:

  - You are about to drop the `DiscordMetrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DiscordMetrics";

-- CreateTable
CREATE TABLE "BackedMetrics" (
    "id" SERIAL NOT NULL,
    "emailsSentPastDay" INTEGER NOT NULL,

    CONSTRAINT "BackedMetrics_pkey" PRIMARY KEY ("id")
);
