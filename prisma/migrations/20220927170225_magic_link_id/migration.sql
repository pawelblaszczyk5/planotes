/*
  Warnings:

  - The primary key for the `MagicLink` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `MagicLink` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "MagicLink_token_key";

-- AlterTable
ALTER TABLE "MagicLink" DROP CONSTRAINT "MagicLink_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id");
