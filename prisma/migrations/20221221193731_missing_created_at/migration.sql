-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "createdAt" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "createdAt" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "createdAt" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "createdAt" INTEGER NOT NULL;
