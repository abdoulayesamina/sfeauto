-- AlterTable : ajout de l'annulation d'intervention
ALTER TABLE `intervention_int`
    ADD COLUMN `int_annulee` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `int_dateAnnulation` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `intervention_int_int_annulee_idx` ON `intervention_int`(`int_annulee`);
