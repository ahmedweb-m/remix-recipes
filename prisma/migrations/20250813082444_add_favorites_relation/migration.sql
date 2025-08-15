/*
  Warnings:

  - You are about to drop the `_RecipeFavoritedBy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RecipeFavoritedBy";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_Favorites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Favorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Favorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_Favorites_AB_unique" ON "_Favorites"("A", "B");

-- CreateIndex
CREATE INDEX "_Favorites_B_index" ON "_Favorites"("B");
