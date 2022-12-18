/*
  Warnings:

  - You are about to drop the column `icon` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "icon",
ADD COLUMN     "iconUrl" TEXT;
