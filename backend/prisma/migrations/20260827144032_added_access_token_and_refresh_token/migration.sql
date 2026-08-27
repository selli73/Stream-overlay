/*
  Warnings:

  - Added the required column `spotifyAccessToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotifyRefreshToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "spotifyAccessToken" TEXT NOT NULL,
ADD COLUMN     "spotifyRefreshToken" TEXT NOT NULL;
