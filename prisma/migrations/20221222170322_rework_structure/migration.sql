
-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "description",
ADD COLUMN     "htmlContent" TEXT NOT NULL,
ADD COLUMN     "textContent" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "content",
ADD COLUMN     "htmlContent" TEXT NOT NULL,
ADD COLUMN     "textContent" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "description",
ADD COLUMN     "htmlContent" TEXT NOT NULL,
ADD COLUMN     "textContent" TEXT NOT NULL;
