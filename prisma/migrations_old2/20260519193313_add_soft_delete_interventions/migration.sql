-- AlterTable
ALTER TABLE `intervention_int` ADD COLUMN `int_supprimee` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `intervention_int_int_supprimee_idx` ON `intervention_int`(`int_supprimee`);
