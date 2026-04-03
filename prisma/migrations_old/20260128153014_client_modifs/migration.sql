-- AlterTable
ALTER TABLE `client` ADD COLUMN `cli_adresseFacturation` VARCHAR(191) NULL,
    ADD COLUMN `cli_numClient` VARCHAR(191) NULL,
    ADD COLUMN `cli_tvaIntraCommunautaire` VARCHAR(191) NULL;
