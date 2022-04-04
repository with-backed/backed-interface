-- CreateTable
CREATE TABLE "DiscordMetrics" (
    "id" SERIAL NOT NULL,
    "numLoansCreated" INTEGER NOT NULL,
    "numLoansLentTo" INTEGER NOT NULL,
    "dollarLoansLentTo" INTEGER NOT NULL,

    CONSTRAINT "DiscordMetrics_pkey" PRIMARY KEY ("id")
);
