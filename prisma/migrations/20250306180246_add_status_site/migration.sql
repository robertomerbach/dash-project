/*
  Warnings:

  - Added the required column `status` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "status" "SiteStatus" NOT NULL;
