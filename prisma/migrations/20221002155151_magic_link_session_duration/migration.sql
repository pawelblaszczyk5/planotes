/*
  Warnings:

  - You are about to alter the column `validUntil` on the `MagicLink` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Added the required column `sessionDuration` to the `MagicLink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SessionDuration" AS ENUM ('EPHEMERAL', 'PERSISTENT');

-- AlterTable
ALTER TABLE "MagicLink" ADD COLUMN     "sessionDuration" "SessionDuration" NOT NULL,
ALTER COLUMN "validUntil" SET DATA TYPE INTEGER;
