-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "salt" INTEGER NOT NULL,
    "verifier" TEXT NOT NULL,
    "dataPath" TEXT
);
INSERT INTO "new_User" ("dataPath", "salt", "userId", "username", "verifier") SELECT "dataPath", "salt", "userId", "username", "verifier" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
