-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('ITEM', 'TASK', 'GOAL');

TRUNCATE TABLE "BalanceEntry";

-- AlterTable
ALTER TABLE "BalanceEntry" ADD COLUMN     "entity" "Entity" NOT NULL,
ADD COLUMN     "itemId" TEXT NOT NULL;
