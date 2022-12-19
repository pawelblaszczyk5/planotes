-- CreateTable
CREATE TABLE "BalanceEntry" (
    "id" TEXT NOT NULL,
    "change" INTEGER NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BalanceEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BalanceEntry" ADD CONSTRAINT "BalanceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
