-- CreateTable
CREATE TABLE `te_devis_dev` (
    `dev_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dev_cli_id` VARCHAR(191) NOT NULL,
    `dev_veh_id` VARCHAR(191) NOT NULL,
    `dev_invoice_id` VARCHAR(191) NULL,
    `dev_user` VARCHAR(191) NULL,
    `dev_adressefacturation` TEXT NULL,
    `dev_numdevis` VARCHAR(191) NOT NULL,
    `dev_datecreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dev_totalht` DECIMAL(14, 2) NOT NULL,
    `dev_totaltva` DECIMAL(14, 2) NOT NULL,
    `dev_totalttc` DECIMAL(14, 2) NOT NULL,
    `dev_tva` DECIMAL(5, 2) NULL,
    `dev_supprimee` BOOLEAN NOT NULL DEFAULT false,
    `dev_accordNumber` VARCHAR(191) NULL,
    `dev_dateAccord` DATETIME(3) NULL,

    UNIQUE INDEX `te_devis_dev_dev_numdevis_key`(`dev_numdevis`),
    UNIQUE INDEX `te_devis_dev_dev_accordNumber_key`(`dev_accordNumber`),
    INDEX `te_devis_dev_dev_cli_id_idx`(`dev_cli_id`),
    INDEX `te_devis_dev_dev_veh_id_idx`(`dev_veh_id`),
    INDEX `te_devis_dev_dev_invoice_id_idx`(`dev_invoice_id`),
    INDEX `te_devis_dev_dev_user_idx`(`dev_user`),
    INDEX `te_devis_dev_dev_datecreation_idx`(`dev_datecreation`),
    INDEX `te_devis_dev_dev_supprimee_idx`(`dev_supprimee`),
    PRIMARY KEY (`dev_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `te_devisart_dea` (
    `dea_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dea_dev_id` INTEGER NOT NULL,
    `dea_art_id` INTEGER NULL,
    `dea_art_designation` VARCHAR(191) NOT NULL,
    `dea_art_reference` VARCHAR(191) NULL,
    `dea_prixunitaire` DECIMAL(14, 2) NOT NULL,
    `dea_quantite` INTEGER NOT NULL,
    `dea_tva` DECIMAL(5, 2) NULL,
    `dea_pourcentageremise` INTEGER NULL,
    `dea_prixtotalht` DECIMAL(14, 2) NOT NULL,

    INDEX `te_devisart_dea_dea_dev_id_idx`(`dea_dev_id`),
    INDEX `te_devisart_dea_dea_art_id_idx`(`dea_art_id`),
    PRIMARY KEY (`dea_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_cli_id_fkey` FOREIGN KEY (`dev_cli_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_veh_id_fkey` FOREIGN KEY (`dev_veh_id`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_invoice_id_fkey` FOREIGN KEY (`dev_invoice_id`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devis_dev` ADD CONSTRAINT `te_devis_dev_dev_user_fkey` FOREIGN KEY (`dev_user`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devisart_dea` ADD CONSTRAINT `te_devisart_dea_dea_dev_id_fkey` FOREIGN KEY (`dea_dev_id`) REFERENCES `te_devis_dev`(`dev_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `te_devisart_dea` ADD CONSTRAINT `te_devisart_dea_dea_art_id_fkey` FOREIGN KEY (`dea_art_id`) REFERENCES `te_article_art`(`art_id`) ON DELETE SET NULL ON UPDATE CASCADE;
