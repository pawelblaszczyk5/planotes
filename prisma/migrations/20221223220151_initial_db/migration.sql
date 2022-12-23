-- CreateEnum
CREATE TYPE "SessionDuration" AS ENUM ('EPHEMERAL', 'PERSISTENT');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('RECURRING', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'ARCHIVED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('ITEM', 'TASK', 'GOAL');

-- CreateEnum
CREATE TYPE "CompletableStatus" AS ENUM ('TO_DO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('XS', 'S', 'M', 'L', 'XL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarSeed" TEXT,
    "timezone" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "validUntil" INTEGER NOT NULL,
    "sessionDuration" "SessionDuration" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "type" "ItemType" NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceEntry" (
    "id" TEXT NOT NULL,
    "change" INTEGER NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "entity" "Entity" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BalanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "status" "CompletableStatus" NOT NULL DEFAULT 'TO_DO',
    "size" "Size" NOT NULL,
    "priority" "Priority" NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "goalId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "size" "Size" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "CompletableStatus" NOT NULL DEFAULT 'TO_DO',
    "createdAt" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceEntry" ADD CONSTRAINT "BalanceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
