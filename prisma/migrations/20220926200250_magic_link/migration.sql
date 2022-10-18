-- CreateTable
CREATE TABLE "MagicLink" (
    "token" TEXT NOT NULL,
    "validUntil" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MagicLink_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_token_key" ON "MagicLink"("token");

-- AddForeignKey
ALTER TABLE "MagicLink" ADD CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
