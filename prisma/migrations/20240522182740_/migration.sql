-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "dataPath" TEXT,
    "serverSecretEphemeral" TEXT,
    "clientPublicEphemeral" TEXT,
    "encryptionSalt" TEXT NOT NULL DEFAULT 'randomSalt',
    "encryptionIV" TEXT NOT NULL DEFAULT '',
    "encryptionTag" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
