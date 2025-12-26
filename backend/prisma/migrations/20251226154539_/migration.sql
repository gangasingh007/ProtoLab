/*
  Warnings:

  - The primary key for the `_ExperimentToTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ExperimentToTag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_ExperimentToTag" DROP CONSTRAINT "_ExperimentToTag_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_ExperimentToTag_AB_unique" ON "_ExperimentToTag"("A", "B");
