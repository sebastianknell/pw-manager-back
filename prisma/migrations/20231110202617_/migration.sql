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
    "secretKey" TEXT,
    "encryptionSalt" TEXT NOT NULL DEFAULT 'randomSalt'
);
INSERT INTO "new_User" ("clientPublicEphemeral", "dataPath", "salt", "secretKey", "serverSecretEphemeral", "userId", "username", "verifier") SELECT "clientPublicEphemeral", "dataPath", "salt", "secretKey", "serverSecretEphemeral", "userId", "username", "verifier" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
