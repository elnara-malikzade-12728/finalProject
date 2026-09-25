ALTER TABLE "User"
ADD COLUMN "verificationStatusTokenHash" TEXT,
ADD COLUMN "verificationStatusExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_verificationStatusTokenHash_key"
ON "User"("verificationStatusTokenHash");
