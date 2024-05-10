/*
  Warnings:

  - You are about to drop the column `srpStep1` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "dataPath" TEXT,
    "serverSecretEphemeral" TEXT,
    "clientPublicEphemeral" TEXT,
    "encryptionSalt" TEXT NOT NULL DEFAULT 'randomSalt',
    "encryptionIV" TEXT NOT NULL DEFAULT '',
    "encryptionTag" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("clientPublicEphemeral", "dataPath", "encryptionIV", "encryptionSalt", "encryptionTag", "salt", "serverSecretEphemeral", "userId", "username", "verifier") SELECT "clientPublicEphemeral", "dataPath", "encryptionIV", "encryptionSalt", "encryptionTag", "salt", "serverSecretEphemeral", "userId", "username", "verifier" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
